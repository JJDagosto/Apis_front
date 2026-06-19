import { FaExchangeAlt, FaTimes } from "react-icons/fa"

function ExchangeSummary({
  offeredCount,
  requestedCount,
  canSubmit,
  onClear,
  onSubmit,
}) {
  return (
    <aside className="exchange-summary">
      <div className="exchange-summary-card">
        <span>Operación</span>
        <h2>Intercambio</h2>
        <p>Seleccioná skins de tu inventario y elegí qué querés recibir.</p>

        <div className="exchange-summary-row">
          <span>Tu oferta</span>
          <strong>{offeredCount}</strong>
        </div>
        <div className="exchange-summary-row">
          <span>Recibís</span>
          <strong>{requestedCount}</strong>
        </div>

        <button
          type="button"
          className="exchange-submit"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          <FaExchangeAlt /> Intercambiar
        </button>
        <button
          type="button"
          className="exchange-clear"
          onClick={onClear}
          disabled={offeredCount + requestedCount === 0}
        >
          <FaTimes /> Limpiar selección
        </button>
      </div>
    </aside>
  )
}

export default ExchangeSummary
