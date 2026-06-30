import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { mostrarNotificacion } from "./notificacionesSlice"

const getErrorMessage = (error, fallback = "No se pudo completar la operacion.") => (
  error?.message || fallback
)

const getRejectedMessage = (action) => action.payload || action.error.message

export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password }) => {
  const loginResponse = await apiRequest("/api/v1/auth/authenticate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const token = loginResponse.access_token
  const userResponse = await apiRequest("/api/v1/users/me", {}, token)

  return {
    token,
    user: userResponse.data,
  }
})

export const fetchSteamLoginUrl = createAsyncThunk(
  "auth/fetchSteamLoginUrl",
  async ({ redirectUrl }, { dispatch, rejectWithValue }) => {
    try {
      const query = redirectUrl
        ? `?redirectUrl=${encodeURIComponent(redirectUrl)}`
        : ""
      const response = await apiRequest(`/api/v1/auth/steam/login-url${query}`)
      return response.data.url
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo iniciar sesion con Steam.")
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const loginWithSteamToken = createAsyncThunk(
  "auth/loginWithSteamToken",
  async (token, { dispatch, rejectWithValue }) => {
    try {
      const userResponse = await apiRequest("/api/v1/users/me", {}, token)

      dispatch(mostrarNotificacion("Sesion iniciada con Steam."))
      return {
        token,
        user: userResponse.data,
      }
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiRequest("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.message
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/api/v1/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      return response.message
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      return response.message
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async ({ token, password, passwordRepeat }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, passwordRepeat }),
      })
      return response.message
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const verifyUserEmail = createAsyncThunk("auth/verifyUserEmail", async (token, { rejectWithValue }) => {
  try {
    const response = await apiRequest("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
    return response.message
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const updateCurrentUser = createAsyncThunk(
  "auth/updateCurrentUser",
  async (profileData, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await apiRequest(
        "/api/v1/users/me",
        {
          method: "PUT",
          body: JSON.stringify(profileData),
        },
        getState().auth.token,
      )
      dispatch(mostrarNotificacion("Perfil actualizado correctamente."))
      return response.data
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
)

export const prepararRecargaSaldo = createAsyncThunk(
  "auth/prepararRecargaSaldo",
  async ({ amountArs }, { dispatch, getState, rejectWithValue }) => {
    const state = getState().auth
    const existingAmount = Number(state.balanceCheckout?.order?.totalFinal)
    const hasCheckoutUrl = Boolean(
      state.balanceCheckout?.checkoutUrl ||
      state.balanceCheckout?.sandboxInitPoint ||
      state.balanceCheckout?.initPoint,
    )

    if (hasCheckoutUrl && Math.abs(existingAmount - Number(amountArs)) < 0.01) {
      return state.balanceCheckout
    }

    try {
      const response = await apiRequest(
        "/payments/bricks/balance/preferences",
        {
          method: "POST",
          body: JSON.stringify({ amountArs }),
        },
        state.token,
      )
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo iniciar la recarga.")
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.balanceLoading,
  },
)

export const sincronizarRecargaSaldo = createAsyncThunk(
  "auth/sincronizarRecargaSaldo",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState().auth
    const orderId = state.balanceCheckout?.order?.id
    if (!orderId) {
      const message = "No hay una recarga para verificar."
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }

    try {
      const paymentResponse = await apiRequest(
        `/payments/bricks/orders/${orderId}/sync`,
        { method: "POST" },
        state.token,
      )
      const payment = paymentResponse.data
      const approved = payment?.status === "approved" || payment?.order?.paymentStatus === "PAID"
      const userResponse = approved
        ? await apiRequest("/api/v1/users/me", {}, state.token)
        : null

      if (approved) {
        const creditedUsd = Number(payment?.order?.priceDifference ?? 0)
        dispatch(mostrarNotificacion(
          creditedUsd > 0
            ? `Se acreditaron $${creditedUsd.toFixed(2)} USD a tu saldo.`
            : "Saldo acreditado correctamente.",
          "success",
        ))
      }

      return {
        payment,
        user: userResponse?.data ?? null,
      }
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo verificar la recarga todavia.")
      dispatch(mostrarNotificacion(message, "error"))
      return rejectWithValue(message)
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.balanceSyncing,
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    currentUser: null,
    steamLoginUrl: "",
    loading: false,
    balanceLoading: false,
    balanceSyncing: false,
    balanceCheckout: null,
    balancePayment: null,
    balanceError: null,
    message: "",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null
      state.currentUser = null
      state.steamLoginUrl = ""
      state.loading = false
      state.balanceLoading = false
      state.balanceSyncing = false
      state.balanceCheckout = null
      state.balancePayment = null
      state.balanceError = null
      state.message = ""
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
      state.message = ""
    },
    setCurrentUserBalance: (state, action) => {
      if (state.currentUser) {
        state.currentUser.saldo = action.payload
      }
    },
    clearBalanceCheckout: (state) => {
      state.balanceLoading = false
      state.balanceSyncing = false
      state.balanceCheckout = null
      state.balancePayment = null
      state.balanceError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.message = ""
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.currentUser = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(fetchSteamLoginUrl.pending, (state) => {
        state.loading = true
        state.steamLoginUrl = ""
        state.error = null
      })
      .addCase(fetchSteamLoginUrl.fulfilled, (state, action) => {
        state.loading = false
        state.steamLoginUrl = action.payload
      })
      .addCase(fetchSteamLoginUrl.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(loginWithSteamToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginWithSteamToken.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.currentUser = action.payload.user
      })
      .addCase(loginWithSteamToken.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.message = ""
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload || "Cuenta creada. Verifica tu email antes de iniciar sesion."
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true
        state.message = ""
        state.error = null
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload || "Si tu cuenta esta pendiente, reenviamos el link."
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true
        state.message = ""
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload || "Si el email esta registrado, te enviamos un link para cambiar la contrasena."
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true
        state.message = ""
        state.error = null
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload || "Tu contrasena se actualizo correctamente. Ya podes iniciar sesion."
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(verifyUserEmail.pending, (state) => {
        state.loading = true
        state.message = "Verificando email..."
        state.error = null
      })
      .addCase(verifyUserEmail.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload || "Email verificado. Ya podes iniciar sesion."
      })
      .addCase(verifyUserEmail.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(updateCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = getRejectedMessage(action)
      })
      .addCase(prepararRecargaSaldo.pending, (state) => {
        state.balanceLoading = true
        state.balanceError = null
      })
      .addCase(prepararRecargaSaldo.fulfilled, (state, action) => {
        state.balanceLoading = false
        state.balanceCheckout = action.payload
      })
      .addCase(prepararRecargaSaldo.rejected, (state, action) => {
        state.balanceLoading = false
        state.balanceError = getRejectedMessage(action)
      })
      .addCase(sincronizarRecargaSaldo.pending, (state) => {
        state.balanceSyncing = true
        state.balanceError = null
      })
      .addCase(sincronizarRecargaSaldo.fulfilled, (state, action) => {
        state.balanceSyncing = false
        state.balancePayment = action.payload.payment
        if (state.balanceCheckout && action.payload.payment?.order) {
          state.balanceCheckout.order = action.payload.payment.order
        }
        if (action.payload.user) {
          state.currentUser = action.payload.user
        }
      })
      .addCase(sincronizarRecargaSaldo.rejected, (state, action) => {
        state.balanceSyncing = false
        state.balanceError = getRejectedMessage(action)
      })
  },
})

export const {
  logout,
  clearAuthError,
  clearBalanceCheckout,
  setCurrentUserBalance,
} = authSlice.actions

export default authSlice.reducer
