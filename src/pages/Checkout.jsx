import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  clearCheckoutResult,
  iniciarCheckout,
  procesarPagoPrueba,
  sincronizarPagoCheckout,
} from "../Redux/checkoutSlice"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Checkout.css"

const getCheckoutUrl = (data) => {
  if (!data) return ""

  const isTestKey = data.publicKey?.startsWith("TEST-")
  const preferSandbox = data.checkoutMode === "sandbox" || isTestKey
  const serverCheckoutUrl = data.checkoutUrl || ""
  const usableServerCheckoutUrl =
    preferSandbox === serverCheckoutUrl.includes("sandbox.mercadopago")
      ? serverCheckoutUrl
      : ""

  return (
    usableServerCheckoutUrl ||
    (preferSandbox ? data.sandboxInitPoint : data.initPoint) ||
    data.initPoint ||
    data.sandboxInitPoint ||
    (data.preferenceId
      ? `${preferSandbox ? "https://sandbox.mercadopago.com.ar" : "https://www.mercadopago.com.ar"}/checkout/v1/redirect?pref_id=${data.preferenceId}`
      : "")
  )
}

function Checkout({
  goToLogin,
  goToCatalogo,
  goToPerfil,
  goToMisPublicaciones,
  cupon,
}) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const {
    data,
    status,
    syncing,
    testProcessing,
    result,
    error: checkoutError,
  } = useSelector((state) => state.checkout)
  const syncingRef = useRef(false)
  const [localError, setLocalError] = useState("")
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

  const order = data?.order
  const amount = order?.totalFinal ?? order?.totalPrice
  const mercadoPagoUrl = getCheckoutUrl(data)
  const brickReady = Boolean(data?.publicKey && order)
  const loading = status === "loading"
  const tradeUrlIssue = currentUser
    ? getTradeUrlIssue(currentUser, "comprar")
    : ""
  const error = localError || checkoutError || (
    tradeUrlIssue
      ? `${tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.`
      : ""
  )

  useEffect(() => {
    if (!currentUser || tradeUrlIssue) return

    dispatch(iniciarCheckout({
      cupon,
      email: currentUser.email,
    }))
  }, [cupon, currentUser, dispatch, tradeUrlIssue])

  const syncPaymentStatus = useCallback(async () => {
    if (!order?.id || result || syncingRef.current) return
    syncingRef.current = true
    setLocalError("")

    try {
      await dispatch(sincronizarPagoCheckout()).unwrap()
    } catch (syncError) {
      setLocalError(
        syncError.message || "No se pudo verificar el pago todavia.",
      )
    } finally {
      syncingRef.current = false
    }
  }, [dispatch, order?.id, result])

  useEffect(() => {
    if (!order?.id || result) return

    const handleFocus = () => syncPaymentStatus()
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
  }, [order?.id, result, syncPaymentStatus])

  const updateTestCardForm = (field, value) => {
    setTestCardForm((current) => ({ ...current, [field]: value }))
  }

  const handleTestCardPayment = async (event) => {
    event.preventDefault()
    setLocalError("")

    try {
      await dispatch(procesarPagoPrueba({
        ...testCardForm,
        expirationMonth: Number(testCardForm.expirationMonth),
        expirationYear: Number(testCardForm.expirationYear),
        installments: Number(testCardForm.installments) || 1,
      })).unwrap()
    } catch (paymentError) {
      setLocalError(paymentError.message)
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

  if (result) {
    const aprobado = result.status === "approved"
    const pendiente =
      result.status === "in_process" || result.status === "pending"

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
              <p>No se pudo procesar el pago ({result.statusDetail || result.status}).</p>
              <button type="button" onClick={() => dispatch(clearCheckoutResult())}>
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
        {tradeUrlIssue && (
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
                  disabled={syncing}
                >
                  {syncing ? "Verificando pago..." : "Ya pague, verificar pago"}
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
