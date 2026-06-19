import { formatCartPrice } from "../../utils/cartTotals"

function CartSummary({
  cupon,
  totals,
  tradeUrlIssue,
  updating,
  onCuponChange,
  onCheckout,
  onCompleteProfile,
}) {
  const couponCode = cupon.trim()
  const hasCoupon = couponCode.length > 0
  const hasSkinDiscount = totals.skinDiscountTotal > 0

  return (
    <aside className="cart-summary">
      <h2>Resumen</h2>
      {tradeUrlIssue && (
        <div className="cart-setup-warning">
          <strong>Falta Steam Trade URL</strong>
          <p>{tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.</p>
          <button type="button" onClick={onCompleteProfile}>Completar perfil</button>
        </div>
      )}
      <div className="cart-summary-row">
        <span>Publicaciones</span>
        <strong>{totals.publicationCount}</strong>
      </div>
      <div className="cart-summary-row">
        <span>Skins en carrito</span>
        <strong>{totals.itemCount}</strong>
      </div>
      <div className="cart-summary-row">
        <span>Subtotal</span>
        <strong>{formatCartPrice(totals.subtotal)}</strong>
      </div>
      {hasSkinDiscount && (
        <div className="cart-summary-row cart-summary-discount">
          <span>Descuentos de skins</span>
          <strong>-{formatCartPrice(totals.skinDiscountTotal)}</strong>
        </div>
      )}
      {hasCoupon && (
        <div className="cart-summary-row cart-summary-coupon">
          <span>Cupón {couponCode.toUpperCase()}</span>
          <strong>A validar</strong>
        </div>
      )}
      <div className="cart-summary-row cart-summary-total">
        <span>Total estimado</span>
        <strong>{formatCartPrice(totals.totalBeforeCoupon)}</strong>
      </div>

      <label className="cart-cupon">
        Cupón (opcional)
        <input
          type="text"
          value={cupon}
          onChange={(event) => onCuponChange(event.target.value.trim())}
          placeholder="Ingresá un código"
        />
      </label>

      <button
        type="button"
        onClick={onCheckout}
        disabled={updating || Boolean(tradeUrlIssue)}
      >
        Continuar compra
      </button>
      <small>
        El cupón se descuenta cuando el backend crea la orden. Acá ves la suma
        del carrito y los descuentos de publicaciones.
      </small>
    </aside>
  )
}

export default CartSummary
