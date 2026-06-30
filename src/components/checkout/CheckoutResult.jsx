import { FaCheck } from "react-icons/fa6"

const getConfirmedTradeStatus = (tradeStatus) => {
  if (tradeStatus === "WAITING_UNLOCK") return "Esperando desbloqueo de Steam"
  if (tradeStatus === "PREPARING_TRADE") return "Preparando intercambio"
  if (tradeStatus === "BOT_SENT") return "Oferta de intercambio enviada"
  if (tradeStatus === "COMPLETED") return "Intercambio completado"
  return "Pago confirmado - Preparando entrega"
}

function CheckoutResult({
  completedResult,
  order,
  onRetry,
  onCatalogo,
  onMisPublicaciones,
}) {
  const approved = completedResult.status === "approved"
  const pending = completedResult.status === "in_process" || completedResult.status === "pending"
  const confirmedOrder = completedResult.order ?? order

  return (
    <main className="checkout-page">
      <div className="checkout-box checkout-result-box">
        {approved && (
          <>
            <div className="checkout-success-icon" aria-hidden="true"><FaCheck /></div>
            <h1 className="checkout-ok">Compra exitosa</h1>
            <p className="checkout-success-desc">
              El pago fue aprobado y la orden qued&oacute; confirmada correctamente.
            </p>
            {confirmedOrder?.id && (
              <div className="checkout-confirmed-order">
                <span>Orden #{confirmedOrder.id}</span>
                <strong>{getConfirmedTradeStatus(confirmedOrder.tradeStatus)}</strong>
              </div>
            )}
            <button type="button" className="checkout-action-primary" onClick={onMisPublicaciones}>
              Ver mis publicaciones
            </button>
            <button type="button" className="checkout-secondary" onClick={onCatalogo}>
              Seguir comprando
            </button>
          </>
        )}
        {pending && (
          <>
            <h1 className="checkout-pending">Pago pendiente</h1>
            <p>El pago quedo en revision. Te avisaremos cuando se confirme.</p>
            <button type="button" className="checkout-action-primary" onClick={onMisPublicaciones}>
              Ver en Mis publicaciones
            </button>
            <button type="button" className="checkout-secondary" onClick={onCatalogo}>
              Volver al catalogo
            </button>
          </>
        )}
        {!approved && !pending && (
          <>
            <h1 className="checkout-fail">Pago rechazado</h1>
            <p>No se pudo procesar el pago ({completedResult.statusDetail || completedResult.status}).</p>
            <button type="button" onClick={onRetry}>Reintentar</button>
            <button type="button" className="checkout-secondary" onClick={onCatalogo}>
              Volver al catalogo
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default CheckoutResult
