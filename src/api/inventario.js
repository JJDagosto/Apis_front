import { apiRequest } from "./client"

export const getInventario = async () => {
  const response = await apiRequest("/inventario")
  return response.data ?? []
}

export const syncInventario = async () => {
  const response = await apiRequest("/inventario/sync", {
    method: "POST",
  })
  return response.message
}

export const publicarInventarioItem = async (itemId, { price, discount = 0 }) => {
  const response = await apiRequest(`/inventario/${itemId}/publicar`, {
    method: "POST",
    body: JSON.stringify({ price, discount }),
  })
  return response.data
}