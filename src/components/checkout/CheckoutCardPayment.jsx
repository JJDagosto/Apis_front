import { SiMercadopago } from "react-icons/si"

function CheckoutCardPayment({ form, processing, disabled, embedded = false, orderId, onChange, onSubmit }) {
  return (
    <form
      className={`checkout-test-card${embedded ? " checkout-test-card-embedded" : " checkout-payment-method"}`}
      onSubmit={onSubmit}
    >
      {!embedded && (
        <div className="checkout-payment-heading">
          <span className="checkout-payment-icon checkout-mp-icon"><SiMercadopago /></span>
          <div>
            <strong>Mercado Pago</strong>
            <small>Pago seguro con Visa o Mastercard</small>
          </div>
        </div>
      )}
      <p className="checkout-card-notice">
        Ingres&aacute; los datos de la tarjeta para confirmar el pago.
      </p>
      <div className="checkout-test-grid">
        <label className="checkout-test-wide">
          Número de tarjeta
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{13,19}"
            maxLength="19"
            value={form.cardNumber}
            onChange={(event) => onChange("cardNumber", event.target.value.replace(/\D/g, ""))}
            required
          />
        </label>
        <label className="checkout-test-wide">
          Titular
          <input
            type="text"
            minLength="2"
            maxLength="40"
            value={form.cardholderName}
            onChange={(event) => onChange("cardholderName", event.target.value.toUpperCase())}
            required
          />
        </label>
        <label>
          Mes
          <input type="number" min="1" max="12" value={form.expirationMonth} onChange={(event) => onChange("expirationMonth", event.target.value)} required />
        </label>
        <label>
          Año
          <input type="number" min="2026" max="2099" value={form.expirationYear} onChange={(event) => onChange("expirationYear", event.target.value)} required />
        </label>
        <label>
          CVV
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]{3,4}"
            maxLength="4"
            value={form.securityCode}
            onChange={(event) => onChange("securityCode", event.target.value.replace(/\D/g, ""))}
            required
          />
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
            required
          />
        </label>
        <label className="checkout-test-wide">
          E-mail del pagador
          <input type="email" value={form.email} onChange={(event) => onChange("email", event.target.value)} required />
        </label>
      </div>
      <button type="submit" className="checkout-card-button" disabled={disabled || processing || !orderId}>
        {processing ? "Procesando con Mercado Pago..." : "Pagar con Mercado Pago"}
      </button>
    </form>
  )
}

export default CheckoutCardPayment
