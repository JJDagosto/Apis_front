import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"
import { publicarInventarioItem } from "./inventarioSlice"

const getToken = (getState) => getState().auth.token

export const fetchMisPublicaciones = createAsyncThunk(
  "publicaciones/fetchMisPublicaciones",
  async (_, { getState }) => {
    const response = await apiRequest("/skins/mis-skins", {}, getToken(getState))
    return response.data ?? []
  },
  {
    condition: (options, { getState }) =>
      options?.force || getState().publicaciones.status === "idle",
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

    const [historialResponse, comprasResponse] = await Promise.all([
      apiRequest("/skins/mis-skins/historial", {}, token),
      apiRequest("/order/me", {}, token),
    ])

    return {
      historial: historialResponse.data ?? [],
      compras: (comprasResponse.data ?? []).filter(
        (order) =>
          order.operationType === "PURCHASE" &&
          order.tradeStatus === "COMPLETED",
      ),
    }
  },
  {
    condition: (_, { getState }) =>
      getState().publicaciones.detailStatus === "idle",
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
    status: "idle",
    detailStatus: "idle",
    loading: false,
    error: null,
  },
  reducers: {},
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
        state.historial = action.payload.historial
        state.compras = action.payload.compras
      })
      .addCase(fetchDetallePublicaciones.rejected, (state, action) => {
        state.detailStatus = "failed"
        state.loading = false
        state.error = action.error.message
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
        state.status = "idle"
        state.detailStatus = "idle"
        state.loading = false
        state.error = null
      })
  },
})

export default publicacionesSlice.reducer
