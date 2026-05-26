import { useEffect, useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"
import {
  crearPreferenciaDesdeCarrito,
  procesarPagoBrick,
  procesarPagoTarjetaPrueba,
} from "../api/payments"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Checkout.css"

const getBrickErrorMessage = (error) => {
  const cause =
    typeof error?.cause === "string"
      ? error.cause
      : error?.cause?.message || error?.cause?.code || error?.cause
  const message = error?.message || cause || ""
  const normalizedMessage = String(message).toLowerCase()
  const normalizedCause = String(cause || "").toLowerCase()

  if (
    normalizedMessage.includes("failed to create card token") ||
    normalizedCause.includes("card_token_creation_failed") ||
    normalizedCause.includes("secure_fields_card_token_creation_failed")
  ) {
    return "El formulario seguro de Mercado Pago no pudo tokenizar la tarjeta. Usa la tarjeta sandbox de abajo para probar el pago."
  }

  return message || "Hubo un problema con el formulario de pago."
}

function Checkout({
  currentUser,
  goToLogin,
  goToCatalogo,
  goToPerfil,
  cupon,
  checkoutSession,
  onCheckoutSessionChange,
  onCartChange,
}) {
  const [order, setOrder] = useState(null)
  const [amount, setAmount] = useState(null)
  const [preferenceId, setPreferenceId] = useState(null)
  const [publicKey, setPublicKey] = useState("")
  const [brickReady, setBrickReady] = useState(false) // ya tenemos publicKey y orden
  const [loading, setLoading] = useState(true)
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

    initMercadoPago(data.publicKey, { locale: "es-AR" })
    setOrder(data.order)
    setAmount(monto)
    setPreferenceId(data.preferenceId)
    setPublicKey(data.publicKey)
    setBrickReady(true)
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
        const reusableSession =
          checkoutSession?.email === currentUser.email &&
          checkoutSession?.cupon === (cupon || "") &&
          checkoutSession?.data?.order?.id &&
          checkoutSession?.data?.preferenceId &&
          checkoutSession?.data?.publicKey

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

  // 2) Cuando el usuario manda el formulario del Brick, procesamos el pago en el back.
  const onSubmit = async (paymentData) => {
    setError("")
    try {
      const selectedPaymentMethod = paymentData?.selectedPaymentMethod ?? paymentData?.paymentType
      const formData = paymentData?.formData ?? paymentData

      if (selectedPaymentMethod === "wallet_purchase" || selectedPaymentMethod === "onboarding_credits") {
        return
      }

      if (!formData || !formData.payment_method_id || !formData.token) {
        throw new Error("Mercado Pago no genero los datos de pago. Revisa los datos ingresados e intenta de nuevo.")
      }

      const resp = await procesarPagoBrick(order.id, formData)
      setResultado({ status: resp.status, statusDetail: resp.statusDetail })
      if (resp.status === "approved") {
        onCheckoutSessionChange?.(null)
        await onCartChange?.()
      }
      // Resolvemos: el Brick muestra su feedback de "procesado".
    } catch (err) {
      setError(err.message)
      // Rechazamos para que el Brick reactive el formulario y permita reintentar.
      throw err
    }
  }

  const updateTestCardForm = (field, value) => {
    setTestCardForm((current) => ({ ...current, [field]: value }))
  }

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

      setResultado({ status: resp.status, statusDetail: resp.statusDetail })
      if (resp.status === "approved") {
        onCheckoutSessionChange?.(null)
        await onCartChange?.()
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
              <h1 className="checkout-ok">Pago aprobado</h1>
              <p>Tu compra se proceso correctamente. La confirmacion final llega por webhook.</p>
            </>
          )}
          {pendiente && (
            <>
              <h1 className="checkout-pending">Pago pendiente</h1>
              <p>El pago quedo en revision. Te avisaremos cuando se confirme.</p>
            </>
          )}
          {!aprobado && !pendiente && (
            <>
              <h1 className="checkout-fail">Pago rechazado</h1>
              <p>No se pudo procesar el pago ({resultado.statusDetail || resultado.status}).</p>
              <button type="button" onClick={() => setResultado(null)}>
                Reintentar
              </button>
            </>
          )}
          <button type="button" className="checkout-secondary" onClick={goToCatalogo}>
            Volver al catalogo
          </button>
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

            <Payment
              key={`${order?.id ?? "order"}-${preferenceId}`}
              initialization={{ amount: Number(amount), preferenceId }}
              customization={{
                visual: {
                  style: { theme: "dark" },
                },
                paymentMethods: {
                  mercadoPago: "all",
                  types: {
                    excluded: ["creditCard", "debitCard"],
                  },
                },
              }}
              onSubmit={onSubmit}
              onError={(e) => {
                console.error("Brick error:", e)
                setError(getBrickErrorMessage(e))
              }}
              onReady={() => {}}
            />

            {publicKey.startsWith("TEST-") && (
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
