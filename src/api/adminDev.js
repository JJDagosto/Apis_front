import { apiRequest } from "./client"

export const buscarCatalogo = async (nombre) => {
  const response = await apiRequest(`/catalogo/buscar?nombre=${encodeURIComponent(nombre)}`)
  return response.data ?? []
}

export const crearSkinParaUsuario = async (email, payload) => {
  const response = await apiRequest(
    `/skins/admin/create-for-user?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
  return response.data
}
