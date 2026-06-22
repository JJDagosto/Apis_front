import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"

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
  async ({ redirectUrl }) => {
    const query = redirectUrl
      ? `?redirectUrl=${encodeURIComponent(redirectUrl)}`
      : ""
    const response = await apiRequest(`/api/v1/auth/steam/login-url${query}`)
    return response.data.url
  },
)

export const loginWithSteamToken = createAsyncThunk(
  "auth/loginWithSteamToken",
  async (token) => {
    const userResponse = await apiRequest("/api/v1/users/me", {}, token)

    return {
      token,
      user: userResponse.data,
    }
  },
)

export const registerUser = createAsyncThunk("auth/registerUser", async (payload) => {
  const response = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.message
})

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  async (email) => {
    const response = await apiRequest("/api/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
    return response.message
  },
)

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email) => {
    const response = await apiRequest("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
    return response.message
  },
)

export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async ({ token, password, passwordRepeat }) => {
    const response = await apiRequest("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, passwordRepeat }),
    })
    return response.message
  },
)

export const verifyUserEmail = createAsyncThunk("auth/verifyUserEmail", async (token) => {
  const response = await apiRequest("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
  return response.message
})

export const updateCurrentUser = createAsyncThunk(
  "auth/updateCurrentUser",
  async (profileData, { getState }) => {
    const response = await apiRequest(
      "/api/v1/users/me",
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
      getState().auth.token,
    )
    return response.data
  },
)

export const prepararRecargaSaldo = createAsyncThunk(
  "auth/prepararRecargaSaldo",
  async ({ amountArs }, { getState }) => {
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

    const response = await apiRequest(
      "/payments/bricks/balance/preferences",
      {
        method: "POST",
        body: JSON.stringify({ amountArs }),
      },
      state.token,
    )
    return response.data
  },
  {
    condition: (_, { getState }) => !getState().auth.balanceLoading,
  },
)

export const sincronizarRecargaSaldo = createAsyncThunk(
  "auth/sincronizarRecargaSaldo",
  async (_, { getState }) => {
    const state = getState().auth
    const orderId = state.balanceCheckout?.order?.id
    if (!orderId) {
      throw new Error("No hay una recarga para verificar.")
    }

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

    return {
      payment,
      user: userResponse?.data ?? null,
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
    loading: false,
    balanceLoading: false,
    balanceSyncing: false,
    balanceCheckout: null,
    balancePayment: null,
    balanceError: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null
      state.currentUser = null
      state.loading = false
      state.balanceLoading = false
      state.balanceSyncing = false
      state.balanceCheckout = null
      state.balancePayment = null
      state.balanceError = null
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
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
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.currentUser = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchSteamLoginUrl.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSteamLoginUrl.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(fetchSteamLoginUrl.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
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
        state.error = action.error.message
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
        state.error = action.error.message
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
        state.balanceError = action.error.message
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
        state.balanceError = action.error.message
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
