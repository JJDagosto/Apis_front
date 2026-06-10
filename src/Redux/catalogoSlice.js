import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import {
  activarPublicacion,
  despublicarPublicacion,
  editarPublicacion,
} from "./publicacionesSlice"
import { publicarInventarioItem } from "./inventarioSlice"
import {
  crearSkinAdminParaUsuario,
  inactivarSkinAdmin,
} from "./adminSlice"

export const fetchCatalogo = createAsyncThunk(
  "catalogo/fetchCatalogo",
  async () => {
    const response = await apiRequest("/skins/get/all")
    return response.data ?? []
  },
  {
    condition: (_, { getState }) => getState().catalogo.status === "idle",
  },
)

const catalogoSlice = createSlice({
  name: "catalogo",
  initialState: {
    items: [],
    status: "idle",
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogo.pending, (state) => {
        state.status = "loading"
        state.loading = true
        state.error = null
      })
      .addCase(fetchCatalogo.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCatalogo.rejected, (state, action) => {
        state.status = "failed"
        state.loading = false
        state.error = action.error.message
      })
      .addCase(editarPublicacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((skin) => skin.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(despublicarPublicacion.fulfilled, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = false
          skin.estadoPublicacion = "PAUSADA"
        }
      })
      .addCase(activarPublicacion.fulfilled, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = true
          skin.estadoPublicacion = "PUBLICADA"
        }
      })
      .addCase(publicarInventarioItem.fulfilled, (state, action) => {
        state.items.push(action.payload.skin)
      })
      .addCase(crearSkinAdminParaUsuario.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(inactivarSkinAdmin.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (skin) => skin.id !== action.payload.skinId,
        )
      })
  },
})

export default catalogoSlice.reducer
