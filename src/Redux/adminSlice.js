import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"

const getToken = (getState) => getState().auth.token

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchAdminDashboard",
  async (_, { getState }) => {
    const response = await apiRequest(
      "/api/v1/admin/dashboard",
      {},
      getToken(getState),
    )
    return response.data
  },
  {
    condition: (_, { getState }) => getState().admin.status === "idle",
  },
)

export const buscarCatalogoAdmin = createAsyncThunk(
  "admin/buscarCatalogoAdmin",
  async (nombre, { getState }) => {
    const response = await apiRequest(
      `/catalogo/buscar?nombre=${encodeURIComponent(nombre)}`,
      {},
      getToken(getState),
    )
    return response.data ?? []
  },
)

export const crearSkinAdminParaUsuario = createAsyncThunk(
  "admin/crearSkinAdminParaUsuario",
  async ({ vendedorEmail, payload }, { getState }) => {
    const response = await apiRequest(
      `/skins/admin/create-for-user?email=${encodeURIComponent(vendedorEmail)}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      getToken(getState),
    )
    return response.data
  },
)

export const inactivarSkinAdmin = createAsyncThunk(
  "admin/inactivarSkinAdmin",
  async (skinId, { getState }) => {
    const response = await apiRequest(
      `/skins/admin/inactivar/${skinId}`,
      { method: "PUT" },
      getToken(getState),
    )
    return { skinId, message: response.message }
  },
)

export const crearCuponAdmin = createAsyncThunk(
  "admin/crearCuponAdmin",
  async ({ codigo, descuentoPct, fechaExpiracion, multiUso }, { getState }) => {
    const response = await apiRequest(
      "/cupones",
      {
        method: "POST",
        body: JSON.stringify({
          codigo,
          descuento: Number(descuentoPct) / 100,
          fechaExpiracion: fechaExpiracion
            ? `${fechaExpiracion}T23:59:00`
            : null,
          multiUso,
        }),
      },
      getToken(getState),
    )
    return response.data
  },
)

export const eliminarCuponAdmin = createAsyncThunk(
  "admin/eliminarCuponAdmin",
  async (cuponId, { getState }) => {
    const response = await apiRequest(
      `/cupones/${cuponId}`,
      { method: "DELETE" },
      getToken(getState),
    )
    return { cuponId, message: response.message }
  },
)

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    publicaciones: [],
    cupones: [],
    usuarios: [],
    ordenes: [],
    catalogResults: [],
    status: "idle",
    searching: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.publicaciones = action.payload.publicaciones ?? []
        state.cupones = action.payload.cupones ?? []
        state.usuarios = action.payload.usuarios ?? []
        state.ordenes = action.payload.ordenes ?? []
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message
      })
      .addCase(buscarCatalogoAdmin.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(buscarCatalogoAdmin.fulfilled, (state, action) => {
        state.searching = false
        state.catalogResults = action.payload
      })
      .addCase(buscarCatalogoAdmin.rejected, (state, action) => {
        state.searching = false
        state.error = action.error.message
      })
      .addCase(crearSkinAdminParaUsuario.fulfilled, (state, action) => {
        state.publicaciones.unshift(action.payload)
      })
      .addCase(inactivarSkinAdmin.fulfilled, (state, action) => {
        state.publicaciones = state.publicaciones.filter(
          (skin) => skin.id !== action.payload.skinId,
        )
      })
      .addCase(crearCuponAdmin.fulfilled, (state, action) => {
        state.cupones.push(action.payload)
      })
      .addCase(eliminarCuponAdmin.fulfilled, (state, action) => {
        state.cupones = state.cupones.filter(
          (cupon) => cupon.id !== action.payload.cuponId,
        )
      })
      .addCase(logout, (state) => {
        state.publicaciones = []
        state.cupones = []
        state.usuarios = []
        state.ordenes = []
        state.catalogResults = []
        state.status = "idle"
        state.searching = false
        state.error = null
      })
  },
})

export default adminSlice.reducer
