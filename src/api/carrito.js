import { apiRequest } from "./client"

export const getCarrito = async () => {
  const response = await apiRequest("/carrito")
  return response.data
}

export const agregarAlCarrito = async (skinId, cantidad = 1) => {
  const response = await apiRequest(`/carrito/skins/${skinId}?cantidad=${cantidad}`, {
    method: "PATCH",
  })
  return response.data
}

export const actualizarCantidadCarrito = async (itemId, cantidad) => {
  const response = await apiRequest(`/carrito/items/${itemId}?cantidad=${cantidad}`, {
    method: "PUT",
  })
  return response.data
}

export const eliminarItemCarrito = async (itemId) => {
  const response = await apiRequest(`/carrito/items/${itemId}`, {
    method: "DELETE",
  })
  return response.data
}

export const vaciarCarrito = async () => {
  const response = await apiRequest("/carrito", {
    method: "DELETE",
  })
  return response.data
}