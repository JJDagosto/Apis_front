import { FaWallet } from "react-icons/fa"

function CheckoutBalancePayment({ balance, total, loading, disabled, onPay, formatPrice }) {
  const available = Number(balance ?? 0)
  const amount = Number(total ?? 0)
  const enoughBalance = available >= amount
  const missing = Math.max(amount - available, 0)

  return (
    <section className="checkout-payment-method checkout-balance-method">
      <div className="checkout-payment-heading">
        <span className="checkout-payment-icon"><FaWallet /></span>
        <div>
          <strong>Usar saldo disponible</strong>
          <small>Saldo actual: {formatPrice(available)}</small>
        </div>
      </div>

      {!enoughBalance && (
        <p className="checkout-balance-warning">
          Te faltan {formatPrice(missing)}. Podés pagar con tarjeta o agregar saldo.
        </p>
      )}

      <button
        type="button"
        className="checkout-balance-button"
        onClick={onPay}
        disabled={disabled || loading || !enoughBalance}
      >
        {loading ? "Procesando pago..." : `Pagar ${formatPrice(amount)} con saldo`}
      </button>
    </section>
  )
}

export default CheckoutBalancePayment
