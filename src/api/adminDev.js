import { apiRequest } from "./client"

export const buscarCatalogo = async (nombre) => {
  const response = await apiRequest(`/catalogo/buscar?nombre=${encodeURIComponent(nombre)}`)
  return response.data ?? []
}

export const crearSkinAdmin = async (payload) => {
  const response = await apiRequest("/skins/admin/create", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.data
}

export const getTodasLasSkinsAdmin = async () => {
  const response = await apiRequest("/skins/admin/all?includeInactive=true")
  return response.data ?? []
}

export const inactivarSkinAdmin = async (skinId) => {
  const response = await apiRequest(`/skins/admin/inactivar/${skinId}`, {
    method: "PUT",
  })
  return response.message
}

export const getCuponesAdmin = async () => {
  const response = await apiRequest("/cupones")
  return response.data ?? []
}

export const crearCuponAdmin = async ({ codigo, descuentoPct, fechaExpiracion, multiUso }) => {
  const response = await apiRequest("/cupones", {
    method: "POST",
    body: JSON.stringify({
      codigo,
      descuento: Number(descuentoPct) / 100,
      fechaExpiracion: fechaExpiracion ? `${fechaExpiracion}T23:59:00` : null,
      multiUso,
    }),
  })
  return response.data
}

export const eliminarCuponAdmin = async (cuponId) => {
  const response = await apiRequest(`/cupones/${cuponId}`, {
    method: "DELETE",
  })
  return response.message
}

export const getUsuariosAdmin = async () => {
  const response = await apiRequest("/api/v1/admin/usuarios")
  return response.data ?? []
}

export const getOrdenesAdmin = async () => {
  const response = await apiRequest("/api/v1/admin/orders")
  return response.data ?? []
}
