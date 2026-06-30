import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FaExternalLinkAlt, FaTimes, FaWallet } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import {
  clearBalanceCheckout,
  prepararRecargaSaldo,
  sincronizarRecargaSaldo,
} from "../Redux/authSlice"
import { getMercadoPagoCheckoutUrl } from "../utils/mercadoPagoCheckout"
import "./BalanceTopUpModal.css"

const MIN_AMOUNT_ARS = 1500
const MAX_BALANCE_USD = 3000
const QUICK_AMOUNTS = {
  ARS: [1500, 3000, 7000, 10000, 20000, 50000],
  USD: [5, 10, 20, 50, 100, 250],
}

const formatArs = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
}).format(value)

const formatUsd = (value) => `USD ${Number(value).toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const isApproved = (payment) => (
  payment?.status === "approved" || payment?.order?.paymentStatus === "PAID"
)

function BalanceTopUpModal({ currentUser, initialAmountUsd = 0, onClose }) {
  const dispatch = useDispatch()
  const {
    balanceLoading,
    balanceSyncing,
    balanceCheckout,
    balancePayment,
    balanceError,
  } = useSelector((state) => state.auth)
  const rate = Number(currentUser?.usdToArs ?? 1451.02)
  const maxAmountArs = rate * MAX_BALANCE_USD
  const requestedAmountArs = Number(initialAmountUsd) * rate
  const defaultAmountArs = Math.min(
    Math.max(requestedAmountArs || MIN_AMOUNT_ARS, MIN_AMOUNT_ARS),
    maxAmountArs,
  )
  const [currency, setCurrency] = useState("ARS")
  const [inputValue, setInputValue] = useState(defaultAmountArs.toFixed(2))
  const [localError, setLocalError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [checkoutRequested, setCheckoutRequested] = useState(false)
  const syncingRef = useRef(false)
  const paymentWindowRef = useRef(null)

  const amountArs = useMemo(() => {
    const value = Number(inputValue)
    if (!Number.isFinite(value)) return 0
    return currency === "ARS" ? value : value * rate
  }, [currency, inputValue, rate])
  const amountUsd = amountArs / rate
  const amountIsValid = amountArs >= MIN_AMOUNT_ARS && amountArs <= maxAmountArs
  const selectedAmount = currency === "ARS" ? amountArs : amountUsd
  const quickAmounts = QUICK_AMOUNTS[currency]
  const formatSelectedAmount = (value) => (
    currency === "ARS" ? formatArs(value) : formatUsd(value)
  )
  const minDisplayAmount = currency === "ARS"
    ? MIN_AMOUNT_ARS
    : MIN_AMOUNT_ARS / rate
  const maxDisplayAmount = currency === "ARS"
    ? maxAmountArs
    : MAX_BALANCE_USD
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

  useEffect(() => {
    if (!checkoutRequested || !checkoutUrl) return
    setCheckoutRequested(false)

    const paymentWindow = paymentWindowRef.current
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.location.href = checkoutUrl
      paymentWindowRef.current = null
    } else {
      const newWindow = window.open(checkoutUrl, "_blank")
      if (!newWindow) {
        setLocalError("El navegador bloqueo la pestana de Mercado Pago. Habilita ventanas emergentes e intenta de nuevo.")
        return
      }
      newWindow.opener = null
    }

    setStatusMessage("Completa el pago en Mercado Pago y luego volve a esta pestana.")
  }, [checkoutRequested, checkoutUrl])

  useEffect(() => {
    if (!isApproved(balancePayment)) return
    dispatch(clearBalanceCheckout())
    onClose()
  }, [balancePayment, dispatch, onClose])

  const syncPaymentStatus = useCallback(() => {
    if (!balanceCheckout?.order?.id || syncingRef.current) return

    syncingRef.current = true
    setLocalError("")
    setStatusMessage("")
    dispatch(sincronizarRecargaSaldo())
    syncingRef.current = false
  }, [balanceCheckout?.order?.id, dispatch])

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

  const handleContinue = () => {
    setLocalError("")
    setStatusMessage("")

    if (!amountIsValid) {
      setLocalError(`Ingresá un importe entre ${formatSelectedAmount(minDisplayAmount)} y ${formatSelectedAmount(maxDisplayAmount)}.`)
      return
    }

    const paymentWindow = window.open("", "_blank")
    if (!paymentWindow) {
      setLocalError("El navegador bloqueo la pestana de Mercado Pago. Habilita ventanas emergentes e intenta de nuevo.")
      return
    }

    paymentWindow.opener = null
    paymentWindow.document.title = "Mercado Pago"
    paymentWindow.document.body.innerHTML = "<p style=\"font-family:sans-serif\">Abriendo Mercado Pago...</p>"
    paymentWindowRef.current = paymentWindow
    setCheckoutRequested(true)
    dispatch(prepararRecargaSaldo({
      amountArs: Number(amountArs.toFixed(2)),
    }))
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
          <h2 id="balance-title">Añadir saldo</h2>
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
            <small>Límite: {formatSelectedAmount(minDisplayAmount)} a {formatSelectedAmount(maxDisplayAmount)}</small>

            <div className="balance-quick-grid">
              {quickAmounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={Math.abs(selectedAmount - amount) < 0.01 ? "active" : ""}
                  onClick={() => {
                    setInputValue(String(amount))
                    setLocalError("")
                    setStatusMessage("")
                  }}
                >
                  {formatSelectedAmount(amount)}
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
                  {balanceLoading ? "Abriendo Mercado Pago..." : `Continuar por ${formatSelectedAmount(selectedAmount)}`}
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
              <div><strong>Saldo</strong><span>Recarga con Mercado Pago</span></div>
            </div>
            <dl>
              <div><dt>Tasa de conversión</dt><dd>USD 1.00 = {formatArs(rate)}</dd></div>
              <div><dt>Método de pago</dt><dd>Mercado Pago</dd></div>
              <div><dt>Tu pago</dt><dd>{formatSelectedAmount(selectedAmount)}</dd></div>
            </dl>
            <div className="balance-credit-total">
              <span>Se acreditan</span>
              <strong>{formatUsd(Number.isFinite(amountUsd) ? amountUsd : 0)}</strong>
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
