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

  saveToken(response.access_token)
  return response.access_token
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

export const logout = () => {
  clearToken()
}