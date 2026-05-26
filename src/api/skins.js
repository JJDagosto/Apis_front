import { apiRequest } from "./client"

export const getMisPublicaciones = async () => {
  const response = await apiRequest("/skins/mis-skins")
  return response.data ?? []
}

export const getHistorialPublicaciones = async () => {
  const response = await apiRequest("/skins/mis-skins/historial")
  return response.data ?? []
}

export const editarPublicacion = async (skinId, { price, discount = 0 }) => {
  const response = await apiRequest(`/skins/${skinId}`, {
    method: "PUT",
    body: JSON.stringify({
      price,
      discount,
      stock: 1,
    }),
  })
  return response.data
}

export const despublicarPublicacion = async (skinId) => {
  const response = await apiRequest(`/skins/${skinId}/inactivar`, {
    method: "PUT",
  })
  return response.message
}

export const activarPublicacion = async (skinId) => {
  const response = await apiRequest(`/skins/${skinId}/activar`, {
    method: "PUT",
  })
  return response.message
}
