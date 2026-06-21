import { FaExchangeAlt, FaTimes } from "react-icons/fa"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"

function ExchangeSummary({
  offeredCount,
  requestedCount,
  currentBalance,
  quote,
  quoteStatus,
  quoteError,
  canSubmit,
  submitting,
  onAddBalance,
  onClear,
  onSubmit,
}) {
  const { formatPrice } = useCurrencyFormatter()
  const projectedBalance = quote?.saldoRestante ?? (
    Number(currentBalance ?? 0) + Number(quote?.saldoARecibir ?? 0)
  )
  const missingBalance = Number(quote?.saldoFaltante ?? 0)
  const appliedBalance = Math.min(
    Number(quote?.saldoDisponible ?? currentBalance ?? 0),
    Number(quote?.montoAPagar ?? 0),
  )

  return (
    <aside className="exchange-summary">
      <div className="exchange-summary-card">
        <div className="exchange-summary-heading">
          <span className="exchange-header-icon"><FaExchangeAlt /></span>
          <div>
            <span className="exchange-summary-kicker">Operación</span>
            <h2>Intercambio</h2>
          </div>
        </div>
        <p>Seleccioná skins de tu inventario y elegí qué querés recibir.</p>

        <div className="exchange-summary-row">
          <span>Tu oferta ({offeredCount})</span>
          <strong>{quote ? formatPrice(quote.valorUsuario) : "-"}</strong>
        </div>
        <div className="exchange-summary-row">
          <span>Recibís ({requestedCount})</span>
          <strong>{quote ? formatPrice(quote.valorMarketplace) : "-"}</strong>
        </div>

        {quote?.montoAPagar > 0 && (
          <div className="exchange-summary-row exchange-summary-difference">
            <span>Diferencia a pagar</span>
            <strong>{formatPrice(quote.montoAPagar)}</strong>
          </div>
        )}
        {appliedBalance > 0 && (
          <div className="exchange-summary-row exchange-summary-applied">
            <span>Saldo aplicado autom&aacute;ticamente</span>
            <strong>-{formatPrice(appliedBalance)}</strong>
          </div>
        )}
        {quote?.saldoARecibir > 0 && (
          <div className="exchange-summary-row exchange-summary-credit">
            <span>Saldo a recibir</span>
            <strong>+{formatPrice(quote.saldoARecibir)}</strong>
          </div>
        )}
        <div className="exchange-summary-row exchange-summary-balance">
          <span>Saldo restante</span>
          <strong>{formatPrice(projectedBalance)}</strong>
        </div>

        {missingBalance > 0 && (
          <div className="exchange-balance-warning">
            <p>Te faltan <strong>{formatPrice(missingBalance)}</strong> para completar el intercambio.</p>
            <button type="button" onClick={onAddBalance}>Agregar saldo</button>
          </div>
        )}

        {quoteStatus === "loading" && (
          <p className="exchange-quote-message">Calculando valores...</p>
        )}
        {quoteError && (
          <p className="exchange-quote-message exchange-error">{quoteError}</p>
        )}

        <button
          type="button"
          className="exchange-submit"
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
        >
          <FaExchangeAlt /> {submitting ? "Procesando..." : "Intercambiar"}
        </button>
        <button
          type="button"
          className="exchange-clear"
          onClick={onClear}
          disabled={offeredCount + requestedCount === 0 || submitting}
        >
          <FaTimes /> Limpiar selección
        </button>
      </div>
    </aside>
  )
}

export default ExchangeSummary
