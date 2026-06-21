import { useMemo, useState } from "react"
import { FaTimes, FaWallet } from "react-icons/fa"
import { SiMercadopago } from "react-icons/si"
import { useDispatch, useSelector } from "react-redux"
import { agregarSaldo } from "../Redux/authSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import BalanceSandboxCardForm from "./BalanceSandboxCardForm.jsx"
import "./BalanceTopUpModal.css"

const QUICK_AMOUNTS = [1500, 3000, 7000, 10000, 20000, 50000]

const getDefaultTestCard = () => ({
  cardNumber: "4509953566233704",
  expirationMonth: "11",
  expirationYear: "2030",
  securityCode: "123",
  cardholderName: "APRO",
  email: "compradora.prueba@mail.com",
  documentType: "DNI",
  documentNumber: "12345678",
  installments: 1,
  paymentMethodId: "visa",
})

const formatArs = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
}).format(value)

function BalanceTopUpModal({ currentUser, initialAmountUsd = 0, onClose }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.balanceLoading)
  const rate = Number(currentUser.usdToArs ?? 1451.02)
  const maxAmountArs = rate * 3000
  const requestedAmountArs = Number(initialAmountUsd) * rate
  const defaultAmountArs = Math.min(
    Math.max(requestedAmountArs || 1500, 1500),
    maxAmountArs,
  )
  const [currency, setCurrency] = useState("ARS")
  const [inputValue, setInputValue] = useState(defaultAmountArs.toFixed(2))
  const [testCardForm, setTestCardForm] = useState(
    getDefaultTestCard,
  )
  const [error, setError] = useState("")

  const amountArs = useMemo(() => {
    const value = Number(inputValue)
    if (!Number.isFinite(value)) return 0
    return currency === "ARS" ? value : value * rate
  }, [currency, inputValue, rate])
  const amountUsd = amountArs / rate

  const changeCurrency = (nextCurrency) => {
    if (nextCurrency === currency) return
    setInputValue(nextCurrency === "ARS"
      ? amountArs.toFixed(2)
      : amountUsd.toFixed(2))
    setCurrency(nextCurrency)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (amountArs < 1500 || amountArs > maxAmountArs) {
      setError(`Ingresá un importe entre ${formatArs(1500)} y ${formatArs(maxAmountArs)}.`)
      return
    }

    try {
      await dispatch(agregarSaldo({
        amountArs: Number(amountArs.toFixed(2)),
        card: {
          ...testCardForm,
          expirationMonth: Number(testCardForm.expirationMonth),
          expirationYear: Number(testCardForm.expirationYear),
        },
      })).unwrap()
      dispatch(mostrarNotificacion(
        `Se acreditaron $${amountUsd.toFixed(2)} USD a tu saldo.`,
      ))
      onClose()
    } catch (requestError) {
      setError(requestError.message)
      dispatch(mostrarNotificacion(requestError.message, "error"))
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
          disabled={loading}
        >
          <FaTimes />
        </button>

        <header>
          <h2 id="balance-title">Añadir fondos para intercambiar</h2>
        </header>

        <form className="balance-modal-layout" onSubmit={handleSubmit}>
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
                onChange={(event) => setInputValue(event.target.value)}
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

            <BalanceSandboxCardForm
              form={testCardForm}
              disabled={loading}
              onChange={(field, value) => {
                setTestCardForm((current) => ({ ...current, [field]: value }))
                setError("")
              }}
              onReset={() => {
                setTestCardForm(getDefaultTestCard())
                setError("")
              }}
            />

          </div>

          <aside className="balance-summary-panel">
            <div className="balance-summary-title">
              <FaWallet />
              <div><strong>Saldo de intercambio</strong><span>Recarga con Mercado Pago</span></div>
            </div>
            <dl>
              <div><dt>Tasa de conversión</dt><dd>$1.00 = {formatArs(rate)}</dd></div>
              <div><dt>M&eacute;todo de pago</dt><dd>Mercado Pago</dd></div>
              <div><dt>Tu pago</dt><dd>{formatArs(amountArs)}</dd></div>
            </dl>
            <div className="balance-credit-total">
              <span>Se acreditan</span>
              <strong>${Number.isFinite(amountUsd) ? amountUsd.toFixed(2) : "0.00"} USD</strong>
            </div>
            {error && <p className="balance-error">{error}</p>}
            <button type="submit" className="balance-submit" disabled={loading || amountArs <= 0}>
              <SiMercadopago />
              {loading
                ? "Procesando con Mercado Pago..."
                : "Pagar con Mercado Pago y a\u00f1adir $" + amountUsd.toFixed(2) + " USD"}
            </button>
          </aside>
        </form>
      </section>
    </div>
  )
}

export default BalanceTopUpModal
