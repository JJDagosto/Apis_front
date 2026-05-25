import { useEffect, useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"
import { crearPreferenciaDesdeCarrito, procesarPagoBrick } from "../api/payments"
import "./Checkout.css"

function Checkout({ currentUser, goToLogin, goToCatalogo, cupon }) {
  const [order, setOrder] = useState(null)
  const [amount, setAmount] = useState(null)
  const [preferenceId, setPreferenceId] = useState(null)
  const [brickReady, setBrickReady] = useState(false) // ya tenemos publicKey y orden
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null) // { status, statusDetail }

  // 1) Al entrar: creamos la orden desde el carrito y traemos publicKey + preferenceId.
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    let cancelado = false

    const init = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await crearPreferenciaDesdeCarrito(cupon)
        if (cancelado) return

        // El total con descuento es totalFinal; si no hay cupon usamos totalPrice.
        const monto = data.order?.totalFinal ?? data.order?.totalPrice

        // initMercadoPago debe llamarse antes de renderizar el Brick.
        initMercadoPago(data.publicKey, { locale: "es-AR" })

        setOrder(data.order)
        setAmount(monto)
        setPreferenceId(data.preferenceId)
        setBrickReady(true)
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
  }, [currentUser, cupon])

  // 2) Cuando el usuario manda el formulario del Brick, procesamos el pago en el back.
  const onSubmit = async ({ formData }) => {
    setError("")
    try {
      const resp = await procesarPagoBrick(order.id, formData)
      setResultado({ status: resp.status, statusDetail: resp.statusDetail })
      // Resolvemos: el Brick muestra su feedback de "procesado".
    } catch (err) {
      setError(err.message)
      // Rechazamos para que el Brick reactive el formulario y permita reintentar.
      throw err
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

        {!loading && brickReady && amount != null && (
          <>
            <div className="checkout-resumen">
              <span>Orden #{order?.id}</span>
              <strong>Total: ${Number(amount).toFixed(2)}</strong>
            </div>

            <Payment
              initialization={{ amount: Number(amount), preferenceId }}
              customization={{
                visual: { style: { theme: "dark" } },
                paymentMethods: {
                  creditCard: "all",
                  debitCard: "all",
                  mercadoPago: "all",
                },
              }}
              onSubmit={onSubmit}
              onError={(e) => {
                console.error("Brick error:", e)
                setError("Hubo un problema con el formulario de pago.")
              }}
              onReady={() => {}}
            />
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
