import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FaExternalLinkAlt, FaTimes, FaWallet } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import {
  clearBalanceCheckout,
  prepararRecargaSaldo,
  sincronizarRecargaSaldo,
} from "../Redux/authSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { getMercadoPagoCheckoutUrl } from "../utils/mercadoPagoCheckout"
import "./BalanceTopUpModal.css"

const QUICK_AMOUNTS = [1500, 3000, 7000, 10000, 20000, 50000]

const formatArs = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
}).format(value)

const isApproved = (payment) => (
  payment?.status === "approved" || payment?.order?.paymentStatus === "PAID"
)

function BalanceTopUpModal({ currentUser, initialAmountUsd = 0, onClose }) {
  const dispatch = useDispatch()
  const {
    balanceLoading,
    balanceSyncing,
    balanceCheckout,
    balanceError,
  } = useSelector((state) => state.auth)
  const rate = Number(currentUser?.usdToArs ?? 1451.02)
  const maxAmountArs = rate * 3000
  const requestedAmountArs = Number(initialAmountUsd) * rate
  const defaultAmountArs = Math.min(
    Math.max(requestedAmountArs || 1500, 1500),
    maxAmountArs,
  )
  const [currency, setCurrency] = useState("ARS")
  const [inputValue, setInputValue] = useState(defaultAmountArs.toFixed(2))
  const [localError, setLocalError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const syncingRef = useRef(false)

  const amountArs = useMemo(() => {
    const value = Number(inputValue)
    if (!Number.isFinite(value)) return 0
    return currency === "ARS" ? value : value * rate
  }, [currency, inputValue, rate])
  const amountUsd = amountArs / rate
  const amountIsValid = amountArs >= 1500 && amountArs <= maxAmountArs
  const preparedAmount = Number(balanceCheckout?.order?.totalFinal)
  const preparedForAmount = Boolean(balanceCheckout?.order?.id) &&
    Math.abs(preparedAmount - amountArs) < 0.01
  const checkoutUrl = preparedForAmount
    ? getMercadoPagoCheckoutUrl(balanceCheckout)
    : ""
  const busy = balanceLoading || balanceSyncing
  const error = localError || balanceError

  const changeCurrency = (nextCurrency) => {
    if (nextCurrency === currency) return
    setInputValue(nextCurrency === "ARS"
      ? amountArs.toFixed(2)
      : amountUsd.toFixed(2))
    setCurrency(nextCurrency)
    setLocalError("")
    setStatusMessage("")
  }

  const syncPaymentStatus = useCallback(async () => {
    if (!balanceCheckout?.order?.id || syncingRef.current) return

    syncingRef.current = true
    setLocalError("")
    setStatusMessage("")
    try {
      const result = await dispatch(sincronizarRecargaSaldo()).unwrap()
      if (isApproved(result.payment)) {
        const creditedUsd = Number(result.payment?.order?.priceDifference ?? amountUsd)
        dispatch(mostrarNotificacion(
          `Se acreditaron $${creditedUsd.toFixed(2)} USD a tu saldo.`,
          "success",
        ))
        dispatch(clearBalanceCheckout())
        onClose()
        return
      }
      setStatusMessage("El pago todavía está pendiente en Mercado Pago.")
    } catch (requestError) {
      setLocalError(requestError.message || "No se pudo verificar la recarga todavía.")
    } finally {
      syncingRef.current = false
    }
  }, [amountUsd, balanceCheckout?.order?.id, dispatch, onClose])

  useEffect(() => {
    if (!checkoutUrl || !balanceCheckout?.order?.id) return

    const handleFocus = () => syncPaymentStatus()
    const handleVisibility = () => {
      if (!document.hidden) syncPaymentStatus()
    }
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [balanceCheckout?.order?.id, checkoutUrl, syncPaymentStatus])

  const handleContinue = async () => {
    setLocalError("")
    setStatusMessage("")

    if (!amountIsValid) {
      setLocalError(`Ingresá un importe entre ${formatArs(1500)} y ${formatArs(maxAmountArs)}.`)
      return
    }

    const paymentWindow = window.open("", "_blank")
    try {
      const checkout = await dispatch(prepararRecargaSaldo({
        amountArs: Number(amountArs.toFixed(2)),
      })).unwrap()
      const paymentUrl = getMercadoPagoCheckoutUrl(checkout)

      if (!paymentUrl) {
        paymentWindow?.close()
        throw new Error("Mercado Pago no devolvió una URL de checkout.")
      }

      if (paymentWindow) {
        paymentWindow.location.href = paymentUrl
      } else {
        window.location.assign(paymentUrl)
      }
      setStatusMessage("Completá el pago en Mercado Pago y luego volvé a esta pestaña.")
    } catch (requestError) {
      paymentWindow?.close()
      const message = requestError.message || "No se pudo iniciar la recarga."
      setLocalError(message)
      dispatch(mostrarNotificacion(message, "error"))
    }
  }

  return (
    <div className="balance-modal-backdrop" role="presentation">
      <section className="balance-modal" role="dialog" aria-modal="true" aria-labelledby="balance-title">
        <button
          type="button"
          className="balance-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={busy}
        >
          <FaTimes />
        </button>

        <header>
          <h2 id="balance-title">Añadir fondos para intercambiar</h2>
        </header>

        <div className="balance-modal-layout">
          <div className="balance-form-column">
            <div className="balance-field-heading">
              <label htmlFor="balance-amount">Importe de la recarga</label>
              <div className="balance-currency-toggle" aria-label="Moneda">
                <button type="button" className={currency === "ARS" ? "active" : ""} onClick={() => changeCurrency("ARS")}>ARS</button>
                <button type="button" className={currency === "USD" ? "active" : ""} onClick={() => changeCurrency("USD")}>USD</button>
              </div>
            </div>

            <div className="balance-amount-input">
              <span>{currency}</span>
              <input
                id="balance-amount"
                type="number"
                min="0"
                step="0.01"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value)
                  setLocalError("")
                  setStatusMessage("")
                }}
                required
              />
            </div>
            <small>Límite: {formatArs(1500)} a {formatArs(maxAmountArs)}</small>

            <div className="balance-quick-grid">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={Math.abs(amountArs - amount) < 0.01 ? "active" : ""}
                  onClick={() => {
                    setCurrency("ARS")
                    setInputValue(String(amount))
                    setLocalError("")
                    setStatusMessage("")
                  }}
                >
                  {formatArs(amount)}
                </button>
              ))}
            </div>

            <label className="balance-select-label">
              País
              <span className="balance-static-select">🇦🇷 Argentina</span>
            </label>

            <section className="balance-checkout-card" aria-label="Pago con Mercado Pago">
              <div className="balance-checkout-heading">
                <FaExternalLinkAlt />
                <div>
                  <strong>Mercado Pago</strong>
                  <span>Elegí el medio de pago dentro de Mercado Pago</span>
                </div>
              </div>
              <p>
                Te redirigiremos al checkout seguro. Los datos del pago no pasan por nuestra aplicación.
              </p>
              <div className="balance-payment-actions">
                <button
                  type="button"
                  className="balance-submit"
                  onClick={handleContinue}
                  disabled={!amountIsValid || busy}
                >
                  <FaExternalLinkAlt />
                  {balanceLoading ? "Abriendo Mercado Pago..." : `Continuar por ${formatArs(amountArs)}`}
                </button>
                {checkoutUrl && (
                  <button
                    type="button"
                    className="balance-verify-button"
                    onClick={syncPaymentStatus}
                    disabled={busy}
                  >
                    {balanceSyncing ? "Verificando pago..." : "Ya pagué, verificar saldo"}
                  </button>
                )}
              </div>
              {!amountIsValid && (
                <p className="balance-brick-notice">
                  Elegí un importe válido para continuar.
                </p>
              )}
              {statusMessage && <p className="balance-status-message">{statusMessage}</p>}
              {error && <p className="balance-error">{error}</p>}
            </section>
          </div>

          <aside className="balance-summary-panel">
            <div className="balance-summary-title">
              <FaWallet />
              <div><strong>Saldo de intercambio</strong><span>Recarga con Mercado Pago</span></div>
            </div>
            <dl>
              <div><dt>Tasa de conversión</dt><dd>$1.00 = {formatArs(rate)}</dd></div>
              <div><dt>Método de pago</dt><dd>Mercado Pago</dd></div>
              <div><dt>Tu pago</dt><dd>{formatArs(amountArs)}</dd></div>
            </dl>
            <div className="balance-credit-total">
              <span>Se acreditan</span>
              <strong>${Number.isFinite(amountUsd) ? amountUsd.toFixed(2) : "0.00"} USD</strong>
            </div>
            {busy && <p className="balance-processing">Conectando con Mercado Pago...</p>}
            <p className="balance-summary-help">
              Mercado Pago se abrirá en una pestaña nueva para que elijas tarjeta, dinero disponible u otro medio habilitado.
            </p>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default BalanceTopUpModal
