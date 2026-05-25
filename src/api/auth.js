import { apiRequest, clearToken, saveToken } from "./client"

export const login = async ({ email, password }) => {
  const response = await apiRequest("/api/v1/auth/authenticate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  saveToken(response.access_token)
  return response.access_token
}

export const register = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  passwordRepeat,
}) => {
  const response = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password,
      passwordRepeat,
    }),
  })

  return response.message
}

export const getCurrentUser = async () => {
  const response = await apiRequest("/api/v1/users/me")
  return response.data
}

export const updateCurrentUser = async (profileData) => {
  const response = await apiRequest("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  })

  if (response.data?.access_token) {
    saveToken(response.data.access_token)
    return getCurrentUser()
  }

  return response.data
}

// Pide el mail de recuperacion. El back SIEMPRE responde OK (no revela si el email existe).
export const forgotPassword = async (email) => {
  const response = await apiRequest("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
  return response.message
}

export const resendVerification = async (email) => {
  const response = await apiRequest("/api/v1/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
  return response.message
}

export const verifyEmail = async (token) => {
  const response = await apiRequest("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
  return response.message
}

// Cambia la contraseña usando el token que llego por mail.
export const resetPassword = async ({ token, password, passwordRepeat }) => {
  const response = await apiRequest("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, passwordRepeat }),
  })
  return response.message
}

export const logout = () => {
  clearToken()
}
