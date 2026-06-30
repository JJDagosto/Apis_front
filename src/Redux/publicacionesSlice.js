import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"
import { mostrarNotificacion } from "./notificacionesSlice"
import { publicarInventarioItem } from "./inventarioSlice"
import {
  iniciarCheckout,
  pagarCheckoutConSaldo,
  procesarPagoPrueba,
  sincronizarPagoCheckout,
} from "./checkoutSlice"

const getToken = (getState) => getState().auth.token

const PENDING_PAYMENT_STATUSES = new Set(["PENDING_PAYMENT", "IN_PROCESS"])

export const fetchMisPublicaciones = createAsyncThunk(
  "publicaciones/fetchMisPublicaciones",
  async (_, { getState }) => {
    const response = await apiRequest("/skins/mis-skins", {}, getToken(getState))
    return response.data ?? []
  },
  {
    condition: (options, { getState }) =>
      getState().publicaciones.status !== "loading" &&
      (options?.force || ["idle", "failed"].includes(getState().publicaciones.status)),
  },
)

export const fetchDetallePublicaciones = createAsyncThunk(
  "publicaciones/fetchDetallePublicaciones",
  async (_, { getState }) => {
    const token = getToken(getState)

    try {
      await apiRequest(
        "/payments/bricks/orders/sync-pending",
        { method: "POST" },
        token,
      )
    } catch {
      // La sincronización ayuda, pero no debe bloquear la pantalla.
    }

    const comprasResponse = await apiRequest("/order/me", {}, token)

    const purchaseOrders = (comprasResponse.data ?? []).filter(
      (order) => order.operationType === "PURCHASE",
    )

    return {
      compras: purchaseOrders.filter((order) => order.paymentStatus === "PAID"),
      pagosPendientes: purchaseOrders.filter((order) =>
        PENDING_PAYMENT_STATUSES.has(order.paymentStatus),
      ),
    }
  },
  {
    condition: (options, { getState }) =>
      getState().publicaciones.detailStatus !== "loading" &&
      (options?.force || ["idle", "failed"].includes(getState().publicaciones.detailStatus)),
  },
)

export const fetchSalesNotifications = createAsyncThunk(
  "publicaciones/fetchSalesNotifications",
  async (_, { getState }) => {
    const token = getToken(getState)
    const [historyResponse, salesResponse] = await Promise.all([
      apiRequest("/skins/mis-skins/historial", {}, token),
      apiRequest("/order/sales", {}, token),
    ])
    return {
      historial: historyResponse.data ?? [],
      ventas: salesResponse.data ?? [],
    }
  },
  {
    condition: (options, { getState }) => {
      const status = getState().publicaciones.salesNotificationsStatus
      return status !== "loading" &&
        (options?.force || ["idle", "failed"].includes(status))
    },
  },
)

export const editarPublicacion = createAsyncThunk(
  "publicaciones/editarPublicacion",
  async ({ skinId, price, discount = 0, vendible = true, intercambiable = false }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `/skins/${skinId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            price,
            discount,
            stock: 1,
            vendible,
            intercambiable,
          }),
        },
        getToken(getState),
      )
      dispatch(mostrarNotificacion("Publicacion actualizada correctamente."))
      return response.data
    } catch (error) {
      const message = error?.message || "No se pudo actualizar la publicacion."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const despublicarPublicacion = createAsyncThunk(
  "publicaciones/despublicarPublicacion",
  async (skinId, { dispatch, getState, rejectWithValue }) => {
    try {
      const skin = getState().publicaciones.items.find((item) => item.id === skinId)
      const response = await apiRequest(
        `/skins/${skinId}/inactivar`,
        { method: "PUT" },
        getToken(getState),
      )
      dispatch(mostrarNotificacion(response.message || "Publicacion retirada. El bot devolvera la skin al inventario."))
      return { skinId, skin, message: response.message }
    } catch (error) {
      const message = error?.message || "No se pudo retirar la publicacion."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const pausarPublicacion = createAsyncThunk(
  "publicaciones/pausarPublicacion",
  async (skinId, { dispatch, getState, rejectWithValue }) => {
    try {
      const skin = getState().publicaciones.items.find((item) => item.id === skinId)
      const response = await apiRequest(
        `/skins/${skinId}/pausar`,
        { method: "PUT" },
        getToken(getState),
      )
      dispatch(mostrarNotificacion(response.message || "Publicacion pausada. Podes reactivarla desde Mis publicaciones."))
      return { skinId, skin, message: response.message }
    } catch (error) {
      const message = error?.message || "No se pudo pausar la publicacion."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const activarPublicacion = createAsyncThunk(
  "publicaciones/activarPublicacion",
  async (skinId, { dispatch, getState, rejectWithValue }) => {
    try {
      const skin = getState().publicaciones.items.find((item) => item.id === skinId)
      const response = await apiRequest(
        `/skins/${skinId}/activar`,
        { method: "PUT" },
        getToken(getState),
      )
      dispatch(mostrarNotificacion(response.message || "Publicacion reactivada."))
      return { skinId, skin, message: response.message }
    } catch (error) {
      const message = error?.message || "No se pudo activar la publicacion."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const cancelarPagoPendiente = createAsyncThunk(
  "publicaciones/cancelarPagoPendiente",
  async (orderId, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `/order/${orderId}/cancel-pending`,
        { method: "POST" },
        getToken(getState),
      )
      dispatch(mostrarNotificacion("Pago pendiente cancelado. La publicacion volvio al catalogo."))
      return response.data
    } catch (error) {
      const message = error?.message || "No se pudo cancelar el pago pendiente."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)


const getPaymentOrder = (payload) =>
  payload?.payment?.order ?? payload?.result?.order ?? payload?.order ?? null

const isApprovedPurchasePayload = (payload) => {
  const payment = payload?.payment ?? payload?.result ?? payload
  const order = getPaymentOrder(payload)
  return (
    (payment?.status === "approved" || order?.paymentStatus === "PAID") &&
    order?.operationType === "PURCHASE"
  )
}

const isPendingPurchaseOrder = (order) =>
  order?.operationType === "PURCHASE" &&
  PENDING_PAYMENT_STATUSES.has(order.paymentStatus)

const upsertOrder = (orders, order) => {
  if (!order?.id) return
  const index = orders.findIndex((item) => item.id === order.id)
  if (index === -1) {
    orders.unshift(order)
    return
  }
  orders[index] = { ...orders[index], ...order }
}

const buildPausedPublicationFromPurchase = (order, detail) => {
  const price = Number(detail.unitPrice ?? 0)
  return {
    id: `local-purchase-${order.id}-${detail.skinId}`,
    localOptimistic: true,
    sourceOrderId: order.id,
    sourceSkinId: detail.skinId,
    name: detail.skinName ?? "Skin comprada",
    imageUrl: detail.imageUrl,
    price,
    finalPrice: price,
    discount: 0,
    active: false,
    estadoPublicacion: "PAUSADA",
    stock: 1,
    vendible: true,
    intercambiable: true,
  }
}

const addPausedPurchasedPublications = (state, order, purchasedPublications = []) => {
  const fallbackPublications = (order?.orderDetailResponses ?? [])
    .filter((detail) => detail?.skinId)
    .map((detail) => buildPausedPublicationFromPurchase(order, detail))

  for (const publication of purchasedPublications.length > 0 ? purchasedPublications : fallbackPublications) {
    const alreadyVisible = state.items.some((skin) =>
      skin.sourceOrderId === publication.sourceOrderId &&
      skin.sourceSkinId === publication.sourceSkinId,
    )
    if (!alreadyVisible) {
      state.items.unshift(publication)
    }
  }
}

const applyApprovedPurchase = (state, payload) => {
  if (!isApprovedPurchasePayload(payload)) return

  const order = getPaymentOrder(payload)
  state.pagosPendientes = state.pagosPendientes.filter((item) => item.id !== order.id)
  upsertOrder(state.compras, order)
  addPausedPurchasedPublications(state, order, payload.purchasedPublications ?? [])
}

const applyPendingPurchase = (state, payload) => {
  const order = payload?.data?.order
  if (!isPendingPurchaseOrder(order)) return

  state.compras = state.compras.filter((item) => item.id !== order.id)
  upsertOrder(state.pagosPendientes, order)
}

const updateSkin = (items, skinId, changes) => {
  const index = items.findIndex((skin) => skin.id === skinId)
  if (index !== -1) {
    items[index] = { ...items[index], ...changes }
  }
}

const publicacionesSlice = createSlice({
  name: "publicaciones",
  initialState: {
    items: [],
    historial: [],
    compras: [],
    pagosPendientes: [],
    salesNotifications: [],
    readSaleNotificationIds: [],
    notificationsBaselineReady: false,
    status: "idle",
    detailStatus: "idle",
    salesNotificationsStatus: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    editarPublicacionLocal: (state, action) => {
      const { skinId, changes } = action.payload
      updateSkin(state.items, skinId, changes)
      updateSkin(state.historial, skinId, changes)
    },
    pausarPublicacionLocal: (state, action) => {
      updateSkin(state.items, action.payload.id, {
        active: false,
        estadoPublicacion: "PAUSADA",
      })
    },
    activarPublicacionLocal: (state, action) => {
      updateSkin(state.items, action.payload.id, {
        active: true,
        estadoPublicacion: "PUBLICADA",
        vendible: true,
      })
    },
    despublicarPublicacionLocal: (state, action) => {
      state.items = state.items.filter((skin) => skin.id !== action.payload.id)
      state.historial = state.historial.filter((skin) => skin.id !== action.payload.id)
    },
    markSalesNotificationsRead: (state) => {
      state.readSaleNotificationIds = state.salesNotifications.map(
        (sale) => `${sale.orderId}-${sale.skinId}`,
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisPublicaciones.pending, (state) => {
        state.status = "loading"
        state.loading = true
        state.error = null
      })
      .addCase(fetchMisPublicaciones.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMisPublicaciones.rejected, (state, action) => {
        state.status = "failed"
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchDetallePublicaciones.pending, (state) => {
        state.detailStatus = "loading"
        state.loading = true
        state.error = null
      })
      .addCase(fetchDetallePublicaciones.fulfilled, (state, action) => {
        state.detailStatus = "succeeded"
        state.loading = false
        state.compras = action.payload.compras
        state.pagosPendientes = action.payload.pagosPendientes
      })
      .addCase(fetchDetallePublicaciones.rejected, (state, action) => {
        state.detailStatus = "failed"
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchSalesNotifications.pending, (state) => {
        state.salesNotificationsStatus = "loading"
      })
      .addCase(fetchSalesNotifications.fulfilled, (state, action) => {
        state.salesNotificationsStatus = "succeeded"
        state.historial = action.payload.historial
        state.salesNotifications = action.payload.ventas
        if (!state.notificationsBaselineReady) {
          state.readSaleNotificationIds = action.payload.ventas.map(
            (sale) => [sale.orderId, sale.skinId].join("-"),
          )
          state.notificationsBaselineReady = true
        }
      })
      .addCase(fetchSalesNotifications.rejected, (state) => {
        state.salesNotificationsStatus = "failed"
      })
      .addCase(editarPublicacion.fulfilled, (state, action) => {
        updateSkin(state.items, action.payload.id, action.payload)
        updateSkin(state.historial, action.payload.id, action.payload)
      })
      .addCase(despublicarPublicacion.fulfilled, (state, action) => {
        state.items = state.items.filter((skin) => skin.id !== action.payload.skinId)
        state.historial = state.historial.filter((skin) => skin.id !== action.payload.skinId)
      })
      .addCase(pausarPublicacion.fulfilled, (state, action) => {
        updateSkin(state.items, action.payload.skinId, {
          active: false,
          estadoPublicacion: "PAUSADA",
        })
      })
      .addCase(activarPublicacion.fulfilled, (state, action) => {
        const changes = { active: true, estadoPublicacion: "PUBLICADA" }
        updateSkin(state.items, action.payload.skinId, changes)
        updateSkin(state.historial, action.payload.skinId, changes)
      })
      .addCase(cancelarPagoPendiente.fulfilled, (state, action) => {
        state.pagosPendientes = state.pagosPendientes.filter(
          (order) => order.id !== action.payload.id,
        )
        state.items = state.items.filter(
          (skin) => skin.sourceOrderId !== action.payload.id,
        )
      })
      .addCase(iniciarCheckout.fulfilled, (state, action) => {
        applyPendingPurchase(state, action.payload)
      })
      .addCase(sincronizarPagoCheckout.fulfilled, (state, action) => {
        applyApprovedPurchase(state, action.payload)
      })
      .addCase(procesarPagoPrueba.fulfilled, (state, action) => {
        applyApprovedPurchase(state, action.payload)
      })
      .addCase(pagarCheckoutConSaldo.fulfilled, (state, action) => {
        applyApprovedPurchase(state, action.payload)
      })
      .addCase(publicarInventarioItem.fulfilled, (state, action) => {
        state.items.push(action.payload.skin)
      })
      .addCase(logout, (state) => {
        state.items = []
        state.historial = []
        state.compras = []
        state.pagosPendientes = []
        state.salesNotifications = []
        state.readSaleNotificationIds = []
        state.notificationsBaselineReady = false
        state.status = "idle"
        state.detailStatus = "idle"
        state.salesNotificationsStatus = "idle"
        state.loading = false
        state.error = null
      })
  },
})

export const {
  activarPublicacionLocal,
  despublicarPublicacionLocal,
  editarPublicacionLocal,
  markSalesNotificationsRead,
  pausarPublicacionLocal,
} = publicacionesSlice.actions

export default publicacionesSlice.reducer
