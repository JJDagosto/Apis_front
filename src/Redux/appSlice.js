import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { mostrarNotificacion } from "./notificacionesSlice"

export const validarCheckoutCupon = createAsyncThunk(
  "app/validarCheckoutCupon",
  async (codigo, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      const response = await apiRequest(
        `/cupones/validar?codigo=${encodeURIComponent(codigo)}`,
        {},
        token,
      )
      dispatch(mostrarNotificacion("Cupon valido."))
      return response.data
    } catch (error) {
      const message = error?.message || "No se pudo validar el cupon."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  checkoutCupon: "",
  currency: "ARS",
  couponValidation: null,
  couponStatus: "idle",
  couponError: null,
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCheckoutCupon: (state, action) => {
      state.checkoutCupon = action.payload || ""
    },
    setCurrency: (state, action) => {
      if (["ARS", "USD"].includes(action.payload)) {
        state.currency = action.payload
      }
    },
    resetAppSession: (state) => {
      state.checkoutCupon = ""
      state.couponValidation = null
      state.couponStatus = "idle"
      state.couponError = null
    },
    clearCheckoutCuponValidation: (state) => {
      state.couponValidation = null
      state.couponStatus = "idle"
      state.couponError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validarCheckoutCupon.pending, (state) => {
        state.couponStatus = "loading"
        state.couponError = null
      })
      .addCase(validarCheckoutCupon.fulfilled, (state, action) => {
        state.couponStatus = "succeeded"
        state.couponValidation = action.payload
        state.couponError = null
      })
      .addCase(validarCheckoutCupon.rejected, (state, action) => {
        state.couponStatus = "failed"
        state.couponValidation = null
        state.couponError = action.payload || action.error.message
      })
  },
})

export const {
  setCheckoutCupon,
  setCurrency,
  resetAppSession,
  clearCheckoutCuponValidation,
} = appSlice.actions

export default appSlice.reducer
