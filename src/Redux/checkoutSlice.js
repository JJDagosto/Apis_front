import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout, setCurrentUserBalance } from "./authSlice"

const getToken = (getState) => getState().auth.token

const approvedPayment = (response) =>
  response?.status === "approved" || response?.order?.paymentStatus === "PAID"

const getApprovedOrder = (state) => {
  const order = state.checkout.result?.order ?? state.checkout.data?.order
  return approvedPayment(state.checkout.result) || order?.paymentStatus === "PAID"
    ? order
    : null
}

const paymentIsProcessing = (state) =>
  state.checkout.syncing ||
  state.checkout.testProcessing ||
  state.checkout.balanceProcessing ||
  state.checkout.mercadoPagoProcessing

const approvedResult = (order) => ({
  status: "approved",
  statusDetail: "already_paid",
  order,
})

const clearApprovedCart = async (token) => {
  try {
    const response = await apiRequest(
      "/carrito",
      { method: "DELETE" },
      token,
    )
    return response.data
  } catch {
    return null
  }
}

export const iniciarCheckout = createAsyncThunk(
  "checkout/iniciarCheckout",
  async ({ cupon, email }, { getState }) => {
    const state = getState()
    const token = getToken(getState)
    const normalizedCupon = cupon || ""
    const paidOrder = getApprovedOrder(state)

    if (paidOrder) {
      return {
        approved: true,
        result: approvedResult(paidOrder),
      }
    }

    const reusableSession =
      state.checkout.session?.email === email &&
      state.checkout.session?.cupon === normalizedCupon &&
      state.checkout.session?.data?.order?.id

    if (reusableSession) {
      return {
        approved: false,
        data: state.checkout.session.data,
        session: state.checkout.session,
      }
    }

    const query = normalizedCupon
      ? `?codigoCupon=${encodeURIComponent(normalizedCupon)}`
      : ""
    const response = await apiRequest(
      `/order/from-carrito${query}`,
      { method: "POST" },
      token,
    )
    const data = { order: response.data }

    return {
      approved: false,
      data,
      session: { email, cupon: normalizedCupon, data },
    }
  },
  {
    condition: (_, { getState }) => getState().checkout.status !== "loading",
  },
)

export const sincronizarPagoCheckout = createAsyncThunk(
  "checkout/sincronizarPagoCheckout",
  async (_, { getState }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      return { payment: approvedResult(paidOrder), cart: null }
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      throw new Error("No hay una orden para verificar.")
    }

    const token = getToken(getState)
    const response = await apiRequest(
      `/payments/bricks/orders/${orderId}/sync`,
      { method: "POST" },
      token,
    )

    let payment = response.data
    if (!approvedPayment(payment)) {
      const pendingResponse = await apiRequest(
        "/payments/bricks/orders/sync-pending",
        { method: "POST" },
        token,
      )
      payment = pendingResponse.data
    }

    return {
      payment,
      cart: approvedPayment(payment)
        ? await clearApprovedCart(token)
        : null,
    }
  },
)

export const procesarPagoPrueba = createAsyncThunk(
  "checkout/procesarPagoPrueba",
  async (payload, { getState }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      return { payment: approvedResult(paidOrder), cart: null }
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      throw new Error("No hay una orden para pagar.")
    }

    const token = getToken(getState)
    const response = await apiRequest(
      `/payments/bricks/orders/${orderId}/process-test-card`,
      {
        method: "POST",
        headers: { "X-Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      },
      token,
    )

    return {
      payment: response.data,
      cart: approvedPayment(response.data)
        ? await clearApprovedCart(token)
        : null,
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState()
      return !getApprovedOrder(state) && !paymentIsProcessing(state)
    },
  },
)

export const prepararMercadoPagoCheckout = createAsyncThunk(
  "checkout/prepararMercadoPago",
  async (_, { getState }) => {
    const state = getState()
    if (getApprovedOrder(state)) {
      throw new Error("Esta orden ya fue pagada.")
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      throw new Error("No hay una orden para pagar.")
    }

    if (state.checkout.data?.preferenceId && state.checkout.data?.publicKey) {
      return state.checkout.data
    }

    const response = await apiRequest(
      `/payments/bricks/preferences/orders/${orderId}`,
      { method: "POST" },
      getToken(getState),
    )
    return response.data
  },
  {
    condition: (_, { getState }) => {
      const state = getState()
      return !getApprovedOrder(state) && !paymentIsProcessing(state)
    },
  },
)

export const pagarCheckoutConSaldo = createAsyncThunk(
  "checkout/pagarConSaldo",
  async (_, { dispatch, getState }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      return { payment: approvedResult(paidOrder), cart: null, alreadyPaid: true }
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      throw new Error("No hay una orden para pagar.")
    }

    const token = getToken(getState)
    const response = await apiRequest(
      `/payments/bricks/orders/${orderId}/process-balance`,
      { method: "POST" },
      token,
    )
    const currentBalance = Number(state.auth.currentUser?.saldo ?? 0)
    const orderTotal = Number(state.checkout.data?.order?.totalFinal ?? 0)
    if (approvedPayment(response.data)) {
      const updatedBalance = Math.max(currentBalance - orderTotal, 0)
      dispatch(setCurrentUserBalance(updatedBalance))
    }

    return {
      payment: response.data,
      cart: approvedPayment(response.data)
        ? await clearApprovedCart(token)
        : null,
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState()
      return !getApprovedOrder(state) && !paymentIsProcessing(state)
    },
  },
)

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    session: null,
    data: null,
    status: "idle",
    syncing: false,
    testProcessing: false,
    balanceProcessing: false,
    mercadoPagoProcessing: false,
    result: null,
    error: null,
  },
  reducers: {
    resetCheckout: (state) => {
      state.session = null
      state.data = null
      state.status = "idle"
      state.syncing = false
      state.testProcessing = false
      state.balanceProcessing = false
      state.mercadoPagoProcessing = false
      state.result = null
      state.error = null
    },
    clearCheckoutResult: (state) => {
      state.result = null
      state.error = null
    },
    retomarCheckoutPendiente: (state, action) => {
      const order = action.payload?.order
      const email = action.payload?.email
      const data = {
        order,
        preferenceId: order?.mercadopagoPreferenceId,
      }

      state.session = { email, cupon: "", data }
      state.data = data
      state.status = "succeeded"
      state.syncing = false
      state.testProcessing = false
      state.balanceProcessing = false
      state.mercadoPagoProcessing = false
      state.result = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(iniciarCheckout.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(iniciarCheckout.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload.approved) {
          state.result = action.payload.result
          state.session = null
          state.data = null
          return
        }
        state.data = action.payload.data
        state.session = action.payload.session
      })
      .addCase(iniciarCheckout.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message
      })
      .addCase(sincronizarPagoCheckout.pending, (state) => {
        state.syncing = true
        state.error = null
      })
      .addCase(sincronizarPagoCheckout.fulfilled, (state, action) => {
        state.syncing = false
        const payment = action.payload.payment
        if (payment?.status) {
          state.result = {
            status: payment.status,
            statusDetail: payment.statusDetail,
            order: payment.order ?? state.data?.order,
          }
        }
        if (approvedPayment(payment)) {
          state.session = null
          if (state.data && payment.order) {
            state.data.order = payment.order
          }
        }
      })
      .addCase(sincronizarPagoCheckout.rejected, (state, action) => {
        state.syncing = false
        state.error = action.error.message
      })
      .addCase(procesarPagoPrueba.pending, (state) => {
        state.testProcessing = true
        state.error = null
      })
      .addCase(procesarPagoPrueba.fulfilled, (state, action) => {
        state.testProcessing = false
        state.result = {
          status: action.payload.payment.status,
          statusDetail: action.payload.payment.statusDetail,
          order: action.payload.payment.order ?? state.data?.order,
        }
        if (approvedPayment(action.payload.payment)) {
          state.session = null
          if (state.data && action.payload.payment.order) {
            state.data.order = action.payload.payment.order
          }
        }
      })
      .addCase(procesarPagoPrueba.rejected, (state, action) => {
        state.testProcessing = false
        state.error = action.error.message
      })
      .addCase(prepararMercadoPagoCheckout.pending, (state) => {
        state.mercadoPagoProcessing = true
        state.error = null
      })
      .addCase(prepararMercadoPagoCheckout.fulfilled, (state, action) => {
        state.mercadoPagoProcessing = false
        state.data = {
          ...state.data,
          ...action.payload,
        }
        if (state.session) {
          state.session.data = state.data
        }
      })
      .addCase(prepararMercadoPagoCheckout.rejected, (state, action) => {
        state.mercadoPagoProcessing = false
        state.error = action.error.message
      })
      .addCase(pagarCheckoutConSaldo.pending, (state) => {
        state.balanceProcessing = true
        state.error = null
      })
      .addCase(pagarCheckoutConSaldo.fulfilled, (state, action) => {
        state.balanceProcessing = false
        state.result = {
          status: action.payload.payment.status,
          statusDetail: action.payload.payment.statusDetail,
          order: action.payload.payment.order ?? state.data?.order,
        }
        state.session = null
        if (state.data && action.payload.payment.order) {
          state.data.order = action.payload.payment.order
        }
      })
      .addCase(pagarCheckoutConSaldo.rejected, (state, action) => {
        state.balanceProcessing = false
        state.error = action.error.message
      })
      .addCase(logout, (state) => {
        state.session = null
        state.data = null
        state.status = "idle"
        state.syncing = false
        state.testProcessing = false
        state.balanceProcessing = false
        state.mercadoPagoProcessing = false
        state.result = null
        state.error = null
      })
  },
})

export const {
  resetCheckout,
  clearCheckoutResult,
  retomarCheckoutPendiente,
} = checkoutSlice.actions

export default checkoutSlice.reducer
