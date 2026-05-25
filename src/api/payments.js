import { apiRequest } from "./client"

/**
 * Crea la orden a partir del carrito y devuelve los datos para el Payment Brick.
 * Respuesta: { order, preferenceId, publicKey, paymentStatus }
 * El codigoCupon es opcional.
 */
export const crearPreferenciaDesdeCarrito = async (codigoCupon) => {
  const qs = codigoCupon
    ? `?codigoCupon=${encodeURIComponent(codigoCupon)}`
    : ""
  const response = await apiRequest(
    `/payments/bricks/preferences/from-carrito${qs}`,
    { method: "POST" }
  )
  return response.data
}

/**
 * Procesa el pago con el formData que entrega el Payment Brick.
 *
 * Importante:
 *  - El back IGNORA el monto del formData y lo recalcula desde la orden, asi que
 *    no hay riesgo de que el usuario manipule el precio desde el navegador.
 *  - X-Idempotency-Key evita pagos duplicados si el usuario reintenta.
 *
 * Respuesta: { order, paymentId, status, statusDetail, ... }
 */
export const procesarPagoBrick = async (orderId, formData) => {
  const response = await apiRequest(
    `/payments/bricks/orders/${orderId}/process-payment`,
    {
      method: "POST",
      headers: { "X-Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(formData),
    }
  )
  return response.data
}
