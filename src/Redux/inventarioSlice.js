import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"

const getToken = (getState) => getState().auth.token

export const fetchInventario = createAsyncThunk(
  "inventario/fetchInventario",
  async (_, { getState }) => {
    const response = await apiRequest("/inventario", {}, getToken(getState))
    return response.data ?? []
  },
  {
    condition: (options, { getState }) =>
      getState().inventario.status !== "loading" &&
      (options?.force || getState().inventario.status === "idle"),
  },
)

export const sincronizarInventario = createAsyncThunk(
  "inventario/sincronizarInventario",
  async (_, { getState }) => {
    const response = await apiRequest(
      "/inventario/sync",
      { method: "POST" },
      getToken(getState),
    )
    return {
      items: response.data ?? [],
      message: response.message,
    }
  },
  {
    condition: (_, { getState }) => !getState().inventario.syncing,
  },
)

export const publicarInventarioItem = createAsyncThunk(
  "inventario/publicarInventarioItem",
  async (
    { itemId, price, discount = 0, vendible = true, intercambiable = false },
    { getState },
  ) => {
    const response = await apiRequest(
      `/inventario/${itemId}/publicar`,
      {
        method: "POST",
        body: JSON.stringify({
          price,
          discount,
          vendible,
          intercambiable,
        }),
      },
      getToken(getState),
    )
    return {
      itemId,
      skin: response.data,
      message: response.message,
    }
  },
  {
    condition: (_, { getState }) => !getState().inventario.publishing,
  },
)

const inventarioSlice = createSlice({
  name: "inventario",
  initialState: {
    items: [],
    status: "idle",
    syncing: false,
    publishing: false,
    syncMessage: "",
    error: null,
  },
  reducers: {
    marcarInventarioItemDisponible: (state, action) => {
      const { itemId, steamAssetId, catalogoId, name } = action.payload ?? {}
      const item = state.items.find((inventoryItem) => (
        (itemId && inventoryItem.id === itemId) ||
        (steamAssetId && inventoryItem.assetId === steamAssetId) ||
        (catalogoId && inventoryItem.catalogo?.id === catalogoId) ||
        (name && inventoryItem.name === name)
      ))

      if (item) {
        item.publicado = false
        item.pending = false
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventario.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchInventario.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
      })
      .addCase(fetchInventario.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message
      })
      .addCase(sincronizarInventario.pending, (state) => {
        state.syncing = true
        state.syncMessage = ""
        state.error = null
      })
      .addCase(sincronizarInventario.fulfilled, (state, action) => {
        state.syncing = false
        state.status = "succeeded"
        state.items = action.payload.items
        state.syncMessage = action.payload.message || "Inventario actualizado correctamente."
      })
      .addCase(sincronizarInventario.rejected, (state, action) => {
        state.syncing = false
        state.syncMessage = ""
        state.error = action.error.message
      })
      .addCase(publicarInventarioItem.pending, (state) => {
        state.publishing = true
        state.error = null
      })
      .addCase(publicarInventarioItem.fulfilled, (state, action) => {
        state.publishing = false
        const item = state.items.find(
          (inventoryItem) => inventoryItem.id === action.payload.itemId,
        )
        if (item) {
          item.publicado = true
        }
      })
      .addCase(publicarInventarioItem.rejected, (state, action) => {
        state.publishing = false
        state.error = action.error.message
      })
      .addCase(logout, (state) => {
        state.items = []
        state.status = "idle"
        state.syncing = false
        state.publishing = false
        state.syncMessage = ""
        state.error = null
      })
  },
})

export const { marcarInventarioItemDisponible } = inventarioSlice.actions

export default inventarioSlice.reducer
