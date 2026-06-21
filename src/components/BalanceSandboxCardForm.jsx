import { FaCreditCard, FaLock, FaUndo } from "react-icons/fa"
import { SiMercadopago } from "react-icons/si"

function BalanceSandboxCardForm({ form, disabled, onChange, onReset }) {
  return (
    <section className="balance-sandbox-card" aria-labelledby="balance-card-title">
      <header>
        <div>
          <SiMercadopago />
          <span>
            <strong id="balance-card-title">Mercado Pago</strong>
            <small>Pago seguro con Visa o Mastercard</small>
          </span>
        </div>
        <button type="button" onClick={onReset} disabled={disabled} title="Completar los datos habilitados">
          <FaUndo /> Completar datos
        </button>
      </header>

      <p className="balance-sandbox-notice">
        Ingres&aacute; los datos de la tarjeta para confirmar la recarga.
      </p>

      <div className="balance-card-grid">
        <label className="balance-card-wide">
          Número de tarjeta
          <div className="balance-card-input-with-icon">
            <FaCreditCard />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              pattern="[0-9]{13,19}"
              maxLength="19"
              value={form.cardNumber}
              onChange={(event) => onChange("cardNumber", event.target.value.replace(/\D/g, ""))}
              disabled={disabled}
              required
            />
          </div>
        </label>

        <label className="balance-card-wide">
          Titular
          <input
            type="text"
            autoComplete="cc-name"
            minLength="2"
            maxLength="40"
            value={form.cardholderName}
            onChange={(event) => onChange("cardholderName", event.target.value.toUpperCase())}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Mes
          <input
            type="number"
            inputMode="numeric"
            autoComplete="cc-exp-month"
            min="1"
            max="12"
            value={form.expirationMonth}
            onChange={(event) => onChange("expirationMonth", event.target.value)}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Año
          <input
            type="number"
            inputMode="numeric"
            autoComplete="cc-exp-year"
            min="2026"
            max="2099"
            value={form.expirationYear}
            onChange={(event) => onChange("expirationYear", event.target.value)}
            disabled={disabled}
            required
          />
        </label>

        <label>
          CVV
          <div className="balance-card-input-with-icon">
            <FaLock />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              pattern="[0-9]{3,4}"
              maxLength="4"
              value={form.securityCode}
              onChange={(event) => onChange("securityCode", event.target.value.replace(/\D/g, ""))}
              disabled={disabled}
              required
            />
          </div>
        </label>

        <label>
          DNI
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{7,9}"
            maxLength="9"
            value={form.documentNumber}
            onChange={(event) => onChange("documentNumber", event.target.value.replace(/\D/g, ""))}
            disabled={disabled}
            required
          />
        </label>

        <label className="balance-card-wide">
          E-mail del pagador
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            disabled={disabled}
            required
          />
        </label>
      </div>
    </section>
  )
}

export default BalanceSandboxCardForm
