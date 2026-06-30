// Verifica si una acción despachada fue rechazada (reemplaza el catch del .unwrap())
export const isRejectedAction = (action) => {
  return action?.meta?.requestStatus === "rejected"
}

// Extrae el mensaje de error de una acción rechazada
export const actionErrorMessage = (action) => {
  return action?.error?.message || "Ocurrió un error inesperado"
}
