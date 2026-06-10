import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"

const getToken = (getState) => getState().auth.token

const approvedPayment = (response) =>
  response?.status === "approved" || response?.order?.paymentStatus === "PAID"

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
    const pendingResponse = await apiRequest(
      "/payments/bricks/orders/sync-pending",
      { method: "POST" },
      token,
    )

    if (approvedPayment(pendingResponse.data)) {
      return {
        approved: true,
        result: {
          status: "approved",
          statusDetail: pendingResponse.data.statusDetail,
        },
        cart: await clearApprovedCart(token),
      }
    }

    const normalizedCupon = cupon || ""
    const reusableSession =
      state.checkout.session?.email === email &&
      state.checkout.session?.cupon === normalizedCupon &&
      state.checkout.session?.data?.order?.id &&
      state.checkout.session?.data?.preferenceId &&
      state.checkout.session?.data?.publicKey &&
      !(
        state.checkout.session.data.publicKey.startsWith("APP_USR-") &&
        state.checkout.session.data.checkoutUrl?.includes("sandbox.mercadopago")
      )

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
      `/payments/bricks/preferences/from-carrito${query}`,
      { method: "POST" },
      token,
    )
    const data = response.data

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
)

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    session: null,
    data: null,
    status: "idle",
    syncing: false,
    testProcessing: false,
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
      state.result = null
      state.error = null
    },
    clearCheckoutResult: (state) => {
      state.result = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(iniciarCheckout.pending, (state) => {
        state.status = "loading"
        state.error = null
        state.result = null
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
          }
        }
        if (approvedPayment(payment)) {
          state.session = null
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
        }
        if (approvedPayment(action.payload.payment)) {
          state.session = null
        }
      })
      .addCase(procesarPagoPrueba.rejected, (state, action) => {
        state.testProcessing = false
        state.error = action.error.message
      })
      .addCase(logout, (state) => {
        state.session = null
        state.data = null
        state.status = "idle"
        state.syncing = false
        state.testProcessing = false
        state.result = null
        state.error = null
      })
  },
})

export const { resetCheckout, clearCheckoutResult } = checkoutSlice.actions

export default checkoutSlice.reducer
