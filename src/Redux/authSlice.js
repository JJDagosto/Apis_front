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

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null
      state.currentUser = null
      state.loading = false
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
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
  },
})

export const { logout, clearAuthError } = authSlice.actions

export default authSlice.reducer
