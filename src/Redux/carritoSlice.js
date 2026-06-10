import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout } from "./authSlice"
import {
  iniciarCheckout,
  procesarPagoPrueba,
  sincronizarPagoCheckout,
} from "./checkoutSlice"

const getToken = (getState) => getState().auth.token

export const fetchCarrito = createAsyncThunk(
  "carrito/fetchCarrito",
  async (_, { getState }) => {
    const response = await apiRequest("/carrito", {}, getToken(getState))
    return response.data
  },
  {
    condition: (options, { getState }) =>
      options?.force || getState().carrito.status === "idle",
  },
)

export const agregarAlCarrito = createAsyncThunk(
  "carrito/agregarAlCarrito",
  async (skinId, { getState }) => {
    const response = await apiRequest(
      `/carrito/skins/${skinId}?cantidad=1`,
      { method: "PATCH" },
      getToken(getState),
    )
    return response.data
  },
)

export const eliminarItemCarrito = createAsyncThunk(
  "carrito/eliminarItemCarrito",
  async (itemId, { getState }) => {
    const response = await apiRequest(
      `/carrito/items/${itemId}`,
      { method: "DELETE" },
      getToken(getState),
    )
    return response.data
  },
)

export const vaciarCarrito = createAsyncThunk(
  "carrito/vaciarCarrito",
  async (_, { getState }) => {
    const response = await apiRequest(
      "/carrito",
      { method: "DELETE" },
      getToken(getState),
    )
    return response.data
  },
)

const carritoSlice = createSlice({
  name: "carrito",
  initialState: {
    data: null,
    status: "idle",
    loading: false,
    updating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state) => {
        state.status = "loading"
        state.loading = true
        state.error = null
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.status = "failed"
        state.loading = false
        state.error = action.error.message
      })
      .addCase(agregarAlCarrito.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(agregarAlCarrito.fulfilled, (state, action) => {
        state.updating = false
        state.data = action.payload
      })
      .addCase(agregarAlCarrito.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message
      })
      .addCase(eliminarItemCarrito.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(eliminarItemCarrito.fulfilled, (state, action) => {
        state.updating = false
        state.data = action.payload
      })
      .addCase(eliminarItemCarrito.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message
      })
      .addCase(vaciarCarrito.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(vaciarCarrito.fulfilled, (state, action) => {
        state.updating = false
        state.data = action.payload
      })
      .addCase(vaciarCarrito.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message
      })
      .addCase(iniciarCheckout.fulfilled, (state, action) => {
        if (action.payload.cart) {
          state.data = action.payload.cart
        }
      })
      .addCase(sincronizarPagoCheckout.fulfilled, (state, action) => {
        if (action.payload.cart) {
          state.data = action.payload.cart
        }
      })
      .addCase(procesarPagoPrueba.fulfilled, (state, action) => {
        if (action.payload.cart) {
          state.data = action.payload.cart
        }
      })
      .addCase(logout, (state) => {
        state.data = null
        state.status = "idle"
        state.loading = false
        state.updating = false
        state.error = null
      })
  },
})

export default carritoSlice.reducer
