const API_URL = "http://localhost:4003"

let tokenResolver = () => null

export const configureTokenResolver = (resolver) => {
  tokenResolver = resolver
}

export const getToken = () => tokenResolver()

export const apiRequest = async (path, options = {}, tokenOverride) => {
  const token = tokenOverride ?? getToken()
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
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = { message: text }
    }
  }

  if (!response.ok) {
    throw new Error(json?.message || "Ocurrió un error con la solicitud.")
  }

  return json
}
