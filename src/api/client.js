const API_URL = "http://localhost:4003"
const TOKEN_KEY = "skinsmarket_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const apiRequest = async (path, options = {}) => {
  const token = getToken()
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(json?.message || "Ocurrio un error con la solicitud.")
  }

  return json
}