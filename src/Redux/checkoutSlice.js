import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout, setCurrentUserBalance } from "./authSlice"
import { mostrarNotificacion } from "./notificacionesSlice"

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

const findCheckoutCatalogSkin = (state, skinId) =>
  state.catalogo.items.find((skin) => String(skin.id) === String(skinId)) ??
  (String(state.checkout.instantItem?.id) === String(skinId) ? state.checkout.instantItem : null)

const buildPurchasedPublications = (state, payment) => {
  const order = payment?.order ?? state.checkout.data?.order
  if (!approvedPayment(payment) || order?.operationType !== "PURCHASE") return []

  return (order.orderDetailResponses ?? [])
    .filter((detail) => detail?.skinId)
    .map((detail) => {
      const source = findCheckoutCatalogSkin(state, detail.skinId) ?? {}
      const price = Number(detail.unitPrice ?? source.finalPrice ?? source.price ?? 0)

      return {
        ...source,
        id: `local-purchase-${order.id}-${detail.skinId}`,
        localOptimistic: true,
        sourceOrderId: order.id,
        sourceSkinId: detail.skinId,
        name: detail.skinName ?? source.name ?? "Skin comprada",
        imageUrl: detail.imageUrl ?? source.imageUrl,
        price,
        finalPrice: price,
        discount: 0,
        active: false,
        estadoPublicacion: "PAUSADA",
        stock: 1,
        vendible: true,
        intercambiable: true,
      }
    })
}

const enrichOrderFromState = (state, order) => {
  if (!order?.orderDetailResponses) return order

  return {
    ...order,
    orderDetailResponses: order.orderDetailResponses.map((detail) => {
      const source = findCheckoutCatalogSkin(state, detail.skinId) ?? {}
      return {
        ...detail,
        skinName: detail.skinName ?? source.name,
        imageUrl: detail.imageUrl ?? source.imageUrl,
      }
    }),
  }
}

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
    const instantItem = state.checkout.instantItem
    const checkoutMode = instantItem ? "instant" : "cart"

    if (paidOrder) {
      return {
        approved: true,
        result: approvedResult(paidOrder),
      }
    }

    const reusableSession =
      state.checkout.session?.email === email &&
      state.checkout.session?.cupon === normalizedCupon &&
      state.checkout.session?.mode === checkoutMode &&
      (!instantItem || state.checkout.session?.skinId === instantItem.id) &&
      state.checkout.session?.data?.order?.id

    if (reusableSession) {
      return {
        approved: false,
        data: state.checkout.session.data,
        session: state.checkout.session,
      }
    }

    const response = instantItem
      ? await apiRequest(
        "/order/direct",
        {
          method: "POST",
          body: JSON.stringify({
            codigoCupon: normalizedCupon || null,
            itemList: [{ skinId: instantItem.id, quantity: 1 }],
          }),
        },
        token,
      )
      : await apiRequest(
        `/order/from-carrito${normalizedCupon ? `?codigoCupon=${encodeURIComponent(normalizedCupon)}` : ""}`,
        { method: "POST" },
        token,
      )
    const data = { order: enrichOrderFromState(state, response.data) }

    return {
      approved: false,
      data,
      session: {
        email,
        cupon: normalizedCupon,
        data,
        mode: checkoutMode,
        skinId: instantItem?.id,
      },
    }
  },
  {
    condition: (_, { getState }) => getState().checkout.status !== "loading",
  },
)

export const sincronizarPagoCheckout = createAsyncThunk(
  "checkout/sincronizarPagoCheckout",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      const payment = approvedResult(paidOrder)
      return {
        payment,
        cart: null,
        purchasedPublications: buildPurchasedPublications(state, payment),
      }
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      const message = "No hay una orden para verificar."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }

    try {
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
        cart: approvedPayment(payment) && !state.checkout.instantItem
          ? await clearApprovedCart(token)
          : null,
        purchasedPublications: buildPurchasedPublications(state, payment),
      }
    } catch (error) {
      const message = error?.message || "No se pudo verificar el pago todavia."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
  {
    condition: (_, { getState }) => !paymentIsProcessing(getState()),
  },
)

export const procesarPagoPrueba = createAsyncThunk(
  "checkout/procesarPagoPrueba",
  async (payload, { getState }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      const payment = approvedResult(paidOrder)
      return {
        payment,
        cart: null,
        purchasedPublications: buildPurchasedPublications(state, payment),
      }
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
      cart: approvedPayment(response.data) && !state.checkout.instantItem
        ? await clearApprovedCart(token)
        : null,
      purchasedPublications: buildPurchasedPublications(state, response.data),
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
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState()
    if (getApprovedOrder(state)) {
      const message = "Esta orden ya fue pagada."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      const message = "No hay una orden para pagar."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }

    if (state.checkout.data?.preferenceId && state.checkout.data?.publicKey) {
      return state.checkout.data
    }

    try {
      const response = await apiRequest(
        `/payments/bricks/preferences/orders/${orderId}`,
        { method: "POST" },
        getToken(getState),
      )
      return response.data
    } catch (error) {
      const message = error?.message || "No se pudo preparar Mercado Pago."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
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
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState()
    const paidOrder = getApprovedOrder(state)
    if (paidOrder) {
      const payment = approvedResult(paidOrder)
      return {
        payment,
        cart: null,
        purchasedPublications: buildPurchasedPublications(state, payment),
        alreadyPaid: true,
      }
    }

    const orderId = state.checkout.data?.order?.id
    if (!orderId) {
      const message = "No hay una orden para pagar."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }

    try {
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
        cart: approvedPayment(response.data) && !state.checkout.instantItem
          ? await clearApprovedCart(token)
          : null,
        purchasedPublications: buildPurchasedPublications(state, response.data),
      }
    } catch (error) {
      const message = error?.message || "No se pudo pagar con saldo."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
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
    instantItem: null,
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
      state.instantItem = null
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
    prepararCheckoutInstantaneo: (state, action) => {
      state.instantItem = action.payload
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
    prepararCheckoutCarrito: (state) => {
      state.instantItem = null
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
      state.instantItem = null
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
          state.instantItem = null
          if (state.data && payment.order) {
            state.data.order = payment.order
          }
        }
      })
      .addCase(sincronizarPagoCheckout.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload || action.error.message
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
          state.instantItem = null
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
        state.error = action.payload || action.error.message
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
        state.instantItem = null
        if (state.data && action.payload.payment.order) {
          state.data.order = action.payload.payment.order
        }
      })
      .addCase(pagarCheckoutConSaldo.rejected, (state, action) => {
        state.balanceProcessing = false
        state.error = action.payload || action.error.message
      })
      .addCase(logout, (state) => {
        state.instantItem = null
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
  prepararCheckoutInstantaneo,
  prepararCheckoutCarrito,
} = checkoutSlice.actions

export default checkoutSlice.reducer
