import { useEffect, useRef, useState } from "react"
import {
  crearPreferenciaDesdeCarrito,
  procesarPagoTarjetaPrueba,
  sincronizarPagosPendientes,
  sincronizarPagoOrden,
} from "../api/payments"
import { vaciarCarrito } from "../api/carrito"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Checkout.css"

function Checkout({
  currentUser,
  goToLogin,
  goToCatalogo,
  goToPerfil,
  goToMisPublicaciones,
  cupon,
  checkoutSession,
  onCheckoutSessionChange,
  onCartChange,
}) {
  const [order, setOrder] = useState(null)
  const [amount, setAmount] = useState(null)
  const [mercadoPagoUrl, setMercadoPagoUrl] = useState("")
  const [brickReady, setBrickReady] = useState(false) // ya tenemos publicKey y orden
  const [loading, setLoading] = useState(true)
  const [syncingPayment, setSyncingPayment] = useState(false)
  const syncingRef = useRef(false)
  const [testProcessing, setTestProcessing] = useState(false)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null) // { status, statusDetail }
  const [testCardForm, setTestCardForm] = useState({
    cardNumber: "4509953566233704",
    expirationMonth: "11",
    expirationYear: "2030",
    securityCode: "123",
    cardholderName: "APRO",
    email: "compradora.prueba@mail.com",
    documentType: "DNI",
    documentNumber: "12345678",
    installments: "1",
    paymentMethodId: "visa",
  })

  const hydrateCheckout = (data) => {
    const monto = data.order?.totalFinal ?? data.order?.totalPrice
    const isTestKey = data.publicKey?.startsWith("TEST-")
    const preferSandbox = data.checkoutMode === "sandbox" || isTestKey
    const serverCheckoutUrl = data.checkoutUrl || ""
    const usableServerCheckoutUrl =
      preferSandbox === serverCheckoutUrl.includes("sandbox.mercadopago")
        ? serverCheckoutUrl
        : ""
    const checkoutUrl =
      usableServerCheckoutUrl ||
      (preferSandbox ? data.sandboxInitPoint : data.initPoint) ||
      data.initPoint ||
      data.sandboxInitPoint ||
      (data.preferenceId
        ? `${preferSandbox ? "https://sandbox.mercadopago.com.ar" : "https://www.mercadopago.com.ar"}/checkout/v1/redirect?pref_id=${data.preferenceId}`
        : "")

    setOrder(data.order)
    setAmount(monto)
    setMercadoPagoUrl(checkoutUrl)
    setBrickReady(true)
  }

  const completeApprovedPayment = async (statusDetail) => {
    setResultado({ status: "approved", statusDetail })
    onCheckoutSessionChange?.(null)
    try { await vaciarCarrito() } catch { /* el pago ya fue aprobado; no bloqueamos la confirmacion */ }
    await onCartChange?.({ resetCheckout: true })
  }

  // 1) Al entrar: creamos la orden desde el carrito y traemos publicKey + preferenceId.
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.`)
      setBrickReady(false)
      setLoading(false)
      return
    }

    let cancelado = false

    const init = async () => {
      setLoading(true)
      setError("")
      try {
        const pendingSync = await sincronizarPagosPendientes()
        const pendingApproved =
          pendingSync.status === "approved" || pendingSync.order?.paymentStatus === "PAID"
        if (pendingApproved) {
          if (!cancelado) {
            await completeApprovedPayment(pendingSync.statusDetail)
          }
          return
        }

        const reusableSession =
          checkoutSession?.email === currentUser.email &&
          checkoutSession?.cupon === (cupon || "") &&
          checkoutSession?.data?.order?.id &&
          checkoutSession?.data?.preferenceId &&
          checkoutSession?.data?.publicKey &&
          !(
            checkoutSession.data.publicKey.startsWith("APP_USR-") &&
            checkoutSession.data.checkoutUrl?.includes("sandbox.mercadopago")
          )

        if (reusableSession) {
          if (!cancelado) hydrateCheckout(checkoutSession.data)
          return
        }

        const data = await crearPreferenciaDesdeCarrito(cupon)
        if (cancelado) return

        hydrateCheckout(data)
        onCheckoutSessionChange?.({ email: currentUser.email, cupon: cupon || "", data })
      } catch (err) {
        if (!cancelado) setError(err.message)
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    init()
    return () => {
      cancelado = true
    }
  }, [currentUser, cupon, checkoutSession])

  const updateTestCardForm = (field, value) => {
    setTestCardForm((current) => ({ ...current, [field]: value }))
  }

  const syncPaymentStatus = async () => {
    if (!order?.id || resultado || syncingRef.current) return
    syncingRef.current = true

    try {
      setSyncingPayment(true)
      const resp = await sincronizarPagoOrden(order.id)
      let approved = resp.status === "approved" || resp.order?.paymentStatus === "PAID"
      let approvedResp = resp
      if (!approved) {
        const pendingResp = await sincronizarPagosPendientes()
        approved = pendingResp.status === "approved" || pendingResp.order?.paymentStatus === "PAID"
        approvedResp = pendingResp
      }
      if (approved) {
        await completeApprovedPayment(approvedResp.statusDetail)
      }
    } catch (err) {
      setError(err.message || "No se pudo verificar el pago todavia.")
    } finally {
      setSyncingPayment(false)
      syncingRef.current = false
    }
  }

  useEffect(() => {
    if (!order?.id || resultado) return

    const handleFocus = () => {
      syncPaymentStatus()
    }
    const handleVisibility = () => {
      if (!document.hidden) syncPaymentStatus()
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    const timer = window.setInterval(syncPaymentStatus, 5000)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
      window.clearInterval(timer)
    }
  }, [order?.id, resultado])

  const handleTestCardPayment = async (event) => {
    event.preventDefault()
    setError("")
    setTestProcessing(true)

    try {
      const resp = await procesarPagoTarjetaPrueba(order.id, {
        ...testCardForm,
        expirationMonth: Number(testCardForm.expirationMonth),
        expirationYear: Number(testCardForm.expirationYear),
        installments: Number(testCardForm.installments) || 1,
      })

      if (resp.status === "approved") {
        await completeApprovedPayment(resp.statusDetail)
      } else {
        setResultado({ status: resp.status, statusDetail: resp.statusDetail })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setTestProcessing(false)
    }
  }

  if (!currentUser) {
    return (
      <main className="checkout-page">
        <div className="checkout-box">
          <h1>Checkout</h1>
          <p>Necesitas iniciar sesion para pagar.</p>
          <button type="button" onClick={goToLogin}>Iniciar sesion</button>
        </div>
      </main>
    )
  }

  // Pantalla de resultado segun el estado que devuelve Mercado Pago.
  if (resultado) {
    const aprobado = resultado.status === "approved"
    const pendiente =
      resultado.status === "in_process" || resultado.status === "pending"

    return (
      <main className="checkout-page">
        <div className="checkout-box">
          {aprobado && (
            <>
              <div className="checkout-success-icon">✓</div>
              <h1 className="checkout-ok">¡Pago aprobado!</h1>
              <p className="checkout-success-desc">
                Tu compra se proceso correctamente. En unos momentos
                vas a poder ver tu skin en tus publicaciones.
              </p>
              <button type="button" className="checkout-action-primary" onClick={goToMisPublicaciones}>
                Ver mis publicaciones
              </button>
              <button type="button" className="checkout-secondary" onClick={goToCatalogo}>
                Seguir comprando
              </button>
            </>
          )}
          {pendiente && (
            <>
              <h1 className="checkout-pending">Pago pendiente</h1>
              <p>El pago quedo en revision. Te avisaremos cuando se confirme.</p>
              <button type="button" className="checkout-secondary" onClick={goToCatalogo}>
                Volver al catalogo
              </button>
            </>
          )}
          {!aprobado && !pendiente && (
            <>
              <h1 className="checkout-fail">Pago rechazado</h1>
              <p>No se pudo procesar el pago ({resultado.statusDetail || resultado.status}).</p>
              <button type="button" onClick={() => setResultado(null)}>
                Reintentar
              </button>
              <button type="button" className="checkout-secondary" onClick={goToCatalogo}>
                Volver al catalogo
              </button>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <div className="checkout-box">
        <h1>Pagar compra</h1>

        {loading && <p className="checkout-message">Preparando el pago...</p>}
        {error && <p className="checkout-error">{error}</p>}
        {error?.includes("Steam Trade URL") && (
          <button type="button" className="checkout-secondary" onClick={goToPerfil}>
            Completar perfil
          </button>
        )}

        {!loading && brickReady && amount != null && (
          <>
            <div className="checkout-resumen">
              <span>Orden #{order?.id}</span>
              <strong>Total: ${Number(amount).toFixed(2)}</strong>
            </div>

            {mercadoPagoUrl ? (
              <>
                <a
                  className="checkout-mp-button"
                  href={mercadoPagoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pagar con Mercado Pago
                </a>
                {mercadoPagoUrl.includes("sandbox.mercadopago") && (
                  <p className="checkout-sandbox-note">Modo prueba de Mercado Pago</p>
                )}
                <button
                  type="button"
                  className="checkout-secondary"
                  onClick={syncPaymentStatus}
                  disabled={syncingPayment}
                >
                  {syncingPayment ? "Verificando pago..." : "Ya pague, verificar pago"}
                </button>
              </>
            ) : (
              <p className="checkout-error">
                No se pudo generar el link de Mercado Pago para esta orden.
              </p>
            )}

            {window.location.hostname === "localhost" && (
              <details className="checkout-test-details">
                <summary>Pago sandbox para pruebas</summary>
                <form className="checkout-test-card" onSubmit={handleTestCardPayment}>
                  <h2>Tarjeta sandbox</h2>
                  <div className="checkout-test-grid">
                    <label>
                      Numero
                      <input
                        type="text"
                        value={testCardForm.cardNumber}
                        onChange={(event) => updateTestCardForm("cardNumber", event.target.value)}
                      />
                    </label>
                    <label>
                      Titular
                      <input
                        type="text"
                        value={testCardForm.cardholderName}
                        onChange={(event) => updateTestCardForm("cardholderName", event.target.value)}
                      />
                    </label>
                    <label>
                      Mes
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={testCardForm.expirationMonth}
                        onChange={(event) => updateTestCardForm("expirationMonth", event.target.value)}
                      />
                    </label>
                    <label>
                      Año
                      <input
                        type="number"
                        min="2026"
                        value={testCardForm.expirationYear}
                        onChange={(event) => updateTestCardForm("expirationYear", event.target.value)}
                      />
                    </label>
                    <label>
                      CVV
                      <input
                        type="text"
                        value={testCardForm.securityCode}
                        onChange={(event) => updateTestCardForm("securityCode", event.target.value)}
                      />
                    </label>
                    <label>
                      DNI
                      <input
                        type="text"
                        value={testCardForm.documentNumber}
                        onChange={(event) => updateTestCardForm("documentNumber", event.target.value)}
                      />
                    </label>
                    <label className="checkout-test-wide">
                      E-mail
                      <input
                        type="email"
                        value={testCardForm.email}
                        onChange={(event) => updateTestCardForm("email", event.target.value)}
                      />
                    </label>
                  </div>
                  <button type="submit" disabled={testProcessing || !order?.id}>
                    {testProcessing ? "Procesando..." : "Pagar tarjeta sandbox"}
                  </button>
                </form>
              </details>
            )}
          </>
        )}

        {!loading && !brickReady && !error && (
          <p className="checkout-message">No se pudo iniciar el checkout.</p>
        )}
      </div>
    </main>
  )
}

export default Checkout
