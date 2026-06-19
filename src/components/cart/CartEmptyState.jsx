import { FaShoppingCart } from "react-icons/fa"

function CartEmptyState({ title, message, actionLabel, onAction, showIcon = false }) {
  return (
    <section className="cart-empty">
      {showIcon && <FaShoppingCart size={34} />}
      <h2>{title}</h2>
      <p>{message}</p>
      <button type="button" onClick={onAction}>{actionLabel}</button>
    </section>
  )
}

export default CartEmptyState
