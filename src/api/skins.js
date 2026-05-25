import { apiRequest } from "./client"

// Publicaciones activas del usuario (estados PUBLICADA y PAUSADA).
export const getMisPublicaciones = async () => {
  const response = await apiRequest("/skins/mis-skins")
  return response.data ?? []
}

// Historial: publicaciones RESERVADA y VENDIDA (solo lectura).
export const getHistorialPublicaciones = async () => {
  const response = await apiRequest("/skins/mis-skins/historial")
  return response.data ?? []
}

/**
 * Editar una publicación propia.
 *
 * OJO: el back (aplicarCampos) hace skin.setPrice(req.getPrice()) sin chequear null
 * y price es nullable=false. Por eso SIEMPRE mandamos price, aunque solo cambiemos
 * intercambiable/vendible. discount va como fracción 0–1.
 */
export const editarPublicacion = async (
  skinId,
  { price, discount, intercambiable, vendible }
) => {
  const response = await apiRequest(`/skins/${skinId}`, {
    method: "PUT",
    body: JSON.stringify({ price, discount, intercambiable, vendible }),
  })
  return response.data
}

// Despublicar = pausar (active=false, estado PAUSADA). Back bloquea si está VENDIDA/RESERVADA.
export const despublicarPublicacion = async (skinId) => {
  const response = await apiRequest(`/skins/${skinId}/inactivar`, {
    method: "PUT",
  })
  return response.message
}

// Republicar (estado PUBLICADA). Back bloquea si stock < 1 o si está VENDIDA/RESERVADA.
export const republicarPublicacion = async (skinId) => {
  const response = await apiRequest(`/skins/${skinId}/activar`, {
    method: "PUT",
  })
  return response.message
}
