import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"

function CartSummary({
  cupon,
  couponValidation,
  couponStatus,
  couponError,
  totals,
  tradeUrlIssue,
  updating,
  onCuponChange,
  onValidateCupon,
  onCheckout,
  onCompleteProfile,
}) {
  const { formatPrice } = useCurrencyFormatter()
  const couponCode = cupon.trim()
  const hasCoupon = couponCode.length > 0
  const hasSkinDiscount = totals.skinDiscountTotal > 0
  const couponDiscount = Number(couponValidation?.descuento ?? 0)
  const couponValidForCode =
    couponValidation?.codigo?.toUpperCase?.() === couponCode.toUpperCase()

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
        <strong>{formatPrice(totals.subtotal)}</strong>
      </div>
      {hasSkinDiscount && (
        <div className="cart-summary-row cart-summary-discount">
          <span>Descuentos de skins</span>
          <strong>-{formatPrice(totals.skinDiscountTotal)}</strong>
        </div>
      )}
      {hasCoupon && (
        <div className="cart-summary-row cart-summary-coupon">
          <span>Cupón {couponCode.toUpperCase()}</span>
          <strong>
            {couponValidForCode
              ? `${Math.round(couponDiscount * 100)}% OFF`
              : "A validar"}
          </strong>
        </div>
      )}
      <div className="cart-summary-row cart-summary-total">
        <span>Total estimado</span>
        <strong>{formatPrice(totals.totalBeforeCoupon)}</strong>
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
        className="cart-validate-coupon"
        onClick={onValidateCupon}
        disabled={!hasCoupon || couponStatus === "loading"}
      >
        {couponStatus === "loading" ? "Validando..." : "Validar cupón"}
      </button>
      {couponError && <small className="cart-coupon-error">{couponError}</small>}
      {couponValidForCode && (
        <small className="cart-coupon-success">
          Cupón aplicado: {Math.round(couponDiscount * 100)}% de descuento.
        </small>
      )}

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
