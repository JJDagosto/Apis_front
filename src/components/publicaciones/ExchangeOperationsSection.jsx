import { FaExchangeAlt, FaSyncAlt } from "react-icons/fa"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"

const STATUS_LABELS = {
  WAITING_PAYMENT: "Esperando el pago",
  WAITING_UNLOCK: "Esperando desbloqueo de Steam",
  WAITING_USER_TRADE: "Esperando que env\u00edes tus skins",
  USER_TRADE_RECEIVED: "Skins recibidas por el bot",
  WAITING_DIFFERENCE: "Esperando el pago de la diferencia",
  PREPARING_TRADE: "Preparando intercambio",
  BOT_SENT: "Oferta enviada por Steam",
  COMPLETED: "Intercambio completado",
  CANCELLED: "Intercambio cancelado",
  FAILED: "Intercambio con error",
  EXPIRED: "Oferta vencida",
  RETURN_PENDING: "Devoluci\u00f3n pendiente",
  RETURN_SENT: "Devoluci\u00f3n enviada",
  RETURNED: "Skins devueltas",
  RETURN_FAILED: "Error en la devoluci\u00f3n",
}

const getStatusClass = (status) => {
  if (status === "COMPLETED") return "completed"
  if (["CANCELLED", "FAILED", "EXPIRED", "RETURN_FAILED"].includes(status)) {
    return "failed"
  }
  return "pending"
}

const getOfferedCount = (operation) => {
  try {
    const assetIds = JSON.parse(operation.userSkinAssetIds ?? "[]")
    return Array.isArray(assetIds) ? assetIds.length : 0
  } catch {
    return 0
  }
}

const formatDate = (value) => {
  if (!value) return ""
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function ExchangeOperationsSection({ operations, loading, onRefresh }) {
  const { formatPrice } = useCurrencyFormatter()

  return (
    <section className="pub-section pub-operations-section">
      <div className="pub-section-heading">
        <h2>Mis intercambios ({operations.length})</h2>
        <button type="button" onClick={onRefresh} disabled={loading}>
          <FaSyncAlt /> {loading ? "Actualizando..." : "Actualizar estados"}
        </button>
      </div>

      {!loading && operations.length === 0 && (
        <p className="pub-message">Todav&iacute;a no realizaste ning&uacute;n intercambio.</p>
      )}

      {operations.length > 0 && (
        <div className="pub-operation-list">
          {operations.map((operation) => {
            const receivedNames = (operation.orderDetailResponses ?? [])
              .map((detail) => detail.skinName)
              .filter(Boolean)
            const offeredCount = getOfferedCount(operation)

            return (
              <article className="pub-operation-card" key={operation.id}>
                <span className="pub-operation-icon"><FaExchangeAlt /></span>
                <div className="pub-operation-copy">
                  <div className="pub-operation-title">
                    <h3>Intercambio #{operation.id}</h3>
                    <span className={"pub-operation-status " + getStatusClass(operation.tradeStatus)}>
                      {STATUS_LABELS[operation.tradeStatus] ?? operation.mensajeEstado ?? "En proceso"}
                    </span>
                  </div>
                  <p>
                    Envi&aacute;s {offeredCount} {offeredCount === 1 ? "skin" : "skins"}
                    {" "}<span aria-hidden="true">&middot;</span>{" "}
                    Recib&iacute;s {receivedNames.length > 0 ? receivedNames.join(", ") : "skins del Market"}
                  </p>
                  <div className="pub-operation-meta">
                    <span>{formatDate(operation.date)}</span>
                    {Number(operation.totalFinal ?? 0) > 0 && (
                      <strong>Diferencia pagada: {formatPrice(operation.totalFinal)}</strong>
                    )}
                    {Number(operation.saldoARecibir ?? 0) > 0 && (
                      <strong>Saldo recibido: +{formatPrice(operation.saldoARecibir)}</strong>
                    )}
                  </div>
                  {operation.mensajeEstado && <small>{operation.mensajeEstado}</small>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ExchangeOperationsSection
