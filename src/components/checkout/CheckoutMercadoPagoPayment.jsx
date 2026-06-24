import { SiMercadopago } from "react-icons/si"

function CheckoutMercadoPagoPayment({
  checkoutUrl,
  localMode,
  preparing,
  syncing,
  disabled,
  onPrepare,
  onSync,
}) {
  return (
    <section className="checkout-payment-method checkout-mercadopago-method">
      <div className="checkout-payment-heading">
        <span className="checkout-payment-icon checkout-mp-icon"><SiMercadopago /></span>
        <div>
          <strong>Mercado Pago</strong>
          <small>Tarjeta, dinero disponible y medios habilitados</small>
        </div>
      </div>

      {localMode ? (
        <p className="checkout-error checkout-mp-config-error">
          Checkout Pro no est&aacute; disponible porque faltan credenciales TEST v&aacute;lidas.
        </p>
      ) : (
        <>
          <p className="checkout-card-notice">
            Vas a ingresar a Mercado Pago para elegir el medio de pago y confirmar la compra.
          </p>
          <button
            type="button"
            className="checkout-mp-button"
            onClick={onPrepare}
            disabled={disabled || preparing}
          >
            <SiMercadopago />
            {preparing ? "Conectando con Mercado Pago..." : "Continuar en Mercado Pago"}
          </button>
          {checkoutUrl && (
            <button type="button" className="checkout-secondary" onClick={onSync} disabled={disabled || syncing}>
              {syncing ? "Verificando pago..." : "Ya pagué, verificar pago"}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export default CheckoutMercadoPagoPayment
