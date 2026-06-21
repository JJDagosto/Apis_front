import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"
import { publicarInventarioItem } from "./inventarioSlice"

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
  async ({ skinId, price, discount = 0, vendible = true, intercambiable = true }, { getState }) => {
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
    return response.data
  },
)

export const despublicarPublicacion = createAsyncThunk(
  "publicaciones/despublicarPublicacion",
  async (skinId, { getState }) => {
    const response = await apiRequest(
      `/skins/${skinId}/inactivar`,
      { method: "PUT" },
      getToken(getState),
    )
    return { skinId, message: response.message }
  },
)

export const activarPublicacion = createAsyncThunk(
  "publicaciones/activarPublicacion",
  async (skinId, { getState }) => {
    const response = await apiRequest(
      `/skins/${skinId}/activar`,
      { method: "PUT" },
      getToken(getState),
    )
    return { skinId, message: response.message }
  },
)

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
        const changes = { active: false, estadoPublicacion: "PAUSADA" }
        updateSkin(state.items, action.payload.skinId, changes)
        updateSkin(state.historial, action.payload.skinId, changes)
      })
      .addCase(activarPublicacion.fulfilled, (state, action) => {
        const changes = { active: true, estadoPublicacion: "PUBLICADA" }
        updateSkin(state.items, action.payload.skinId, changes)
        updateSkin(state.historial, action.payload.skinId, changes)
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

export const { markSalesNotificationsRead } = publicacionesSlice.actions

export default publicacionesSlice.reducer
