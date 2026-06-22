import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaCheck } from "react-icons/fa6"
import {
  clearCheckoutResult,
  iniciarCheckout,
  pagarCheckoutConSaldo,
  prepararMercadoPagoCheckout,
  sincronizarPagoCheckout,
} from "../../Redux/checkoutSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"
import CheckoutBalancePayment from "../checkout/CheckoutBalancePayment.jsx"
import CheckoutMercadoPagoPayment from "../checkout/CheckoutMercadoPagoPayment.jsx"
import { getMercadoPagoCheckoutUrl } from "../../utils/mercadoPagoCheckout"
import "../../pages/Checkout.css"

const getConfirmedTradeStatus = (tradeStatus) => {
  if (tradeStatus === "WAITING_UNLOCK") return "Esperando desbloqueo de Steam"
  if (tradeStatus === "PREPARING_TRADE") return "Preparando intercambio"
  if (tradeStatus === "BOT_SENT") return "Oferta de intercambio enviada"
  if (tradeStatus === "COMPLETED") return "Intercambio completado"
  return "Pago confirmado · Preparando entrega"
}

function Checkout({ goToLogin, goToCatalogo, goToMisPublicaciones, cupon }) {
  const { formatPrice } = useCurrencyFormatter()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const {
    session,
    data,
    status,
    syncing,
    balanceProcessing,
    mercadoPagoProcessing,
    result,
    error: checkoutError,
  } = useSelector((state) => state.checkout)
  const syncingRef = useRef(false)
  const notifiedOrderRef = useRef(null)
  const [localError, setLocalError] = useState("")

  const openLogin = goToLogin ?? (() => navigate("/login"))
  const openCatalogo = goToCatalogo ?? (() => navigate("/catalogo"))
  const openMisPublicaciones = goToMisPublicaciones ?? (() => navigate("/mis-publicaciones"))
  const order = data?.order
  const amount = order?.totalFinal ?? order?.totalPrice
  const checkoutUrl = getMercadoPagoCheckoutUrl(data)
  const checkoutReady = Boolean(order)
  const loading = status === "loading"
  const error = localError || checkoutError
  const completedResult = useMemo(
    () => result ?? (order?.paymentStatus === "PAID" ? { status: "approved", order } : null),
    [order, result],
  )
  const paymentBusy = syncing || balanceProcessing || mercadoPagoProcessing
  const mercadoPagoSelected = Boolean(data?.preferenceId)
  const normalizedCupon = cupon || ""
  const hasReusableCheckout =
    session?.email === currentUser?.email &&
    session?.cupon === normalizedCupon &&
    session?.data?.order?.id

  useEffect(() => {
    if (!currentUser || hasReusableCheckout || completedResult?.status === "approved") return
    dispatch(iniciarCheckout({
      cupon: normalizedCupon,
      email: currentUser.email,
    }))
  }, [completedResult?.status, currentUser, dispatch, hasReusableCheckout, normalizedCupon])

  useEffect(() => {
    if (completedResult?.status !== "approved") return
    const confirmedOrderId = completedResult.order?.id ?? order?.id
    if (!confirmedOrderId || notifiedOrderRef.current === confirmedOrderId) return

    notifiedOrderRef.current = confirmedOrderId
    dispatch(mostrarNotificacion(
      `Orden #${confirmedOrderId} confirmada. El vendedor ya fue notificado.`,
      "success",
    ))
  }, [completedResult, dispatch, order?.id])

  const syncPaymentStatus = useCallback(async () => {
    if (!order?.id || completedResult || syncingRef.current) return
    syncingRef.current = true
    setLocalError("")
    try {
      await dispatch(sincronizarPagoCheckout()).unwrap()
    } catch (syncError) {
      setLocalError(syncError.message || "No se pudo verificar el pago todavía.")
    } finally {
      syncingRef.current = false
    }
  }, [completedResult, dispatch, order?.id])

  useEffect(() => {
    if (!order?.id || completedResult || !checkoutUrl) return

    const handleFocus = () => syncPaymentStatus()
    const handleVisibility = () => {
      if (!document.hidden) syncPaymentStatus()
    }
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [checkoutUrl, completedResult, order?.id, syncPaymentStatus])

  const handleBalancePayment = async () => {
    if (completedResult || paymentBusy) return
    if (mercadoPagoSelected) {
      setLocalError("Ya iniciaste el pago con Mercado Pago para esta orden.")
      return
    }
    setLocalError("")
    try {
      await dispatch(pagarCheckoutConSaldo()).unwrap()
    } catch (paymentError) {
      setLocalError(paymentError.message)
    }
  }

  const handleMercadoPagoPayment = async () => {
    if (completedResult || paymentBusy) return
    setLocalError("")
    const paymentWindow = window.open("", "_blank")

    try {
      const preparedCheckout = await dispatch(prepararMercadoPagoCheckout()).unwrap()
      const paymentUrl = getMercadoPagoCheckoutUrl(preparedCheckout)

      if (paymentUrl) {
        if (paymentWindow) {
          paymentWindow.location.href = paymentUrl
        } else {
          window.location.assign(paymentUrl)
        }
      } else {
        paymentWindow?.close()
        throw new Error("Mercado Pago no devolvió una URL de Checkout Pro.")
      }
    } catch (paymentError) {
      paymentWindow?.close()
      setLocalError(paymentError.message)
    }
  }

  if (!currentUser) {
    return (
      <main className="checkout-page">
        <div className="checkout-box">
          <h1>Checkout</h1>
          <p>Necesitás iniciar sesión para pagar.</p>
          <button type="button" onClick={openLogin}>Iniciar sesión</button>
        </div>
      </main>
    )
  }

  if (completedResult) {
    const approved = completedResult.status === "approved"
    const pending = completedResult.status === "in_process" || completedResult.status === "pending"
    const confirmedOrder = completedResult.order ?? order
    return (
      <main className="checkout-page">
        <div className="checkout-box checkout-result-box">
          {approved && (
            <>
              <div className="checkout-success-icon" aria-hidden="true"><FaCheck /></div>
              <h1 className="checkout-ok">Compra exitosa</h1>
              <p className="checkout-success-desc">
                El pago fue aprobado y la orden qued&oacute; confirmada correctamente.
              </p>
              {confirmedOrder?.id && (
                <div className="checkout-confirmed-order">
                  <span>Orden #{confirmedOrder.id}</span>
                  <strong>{getConfirmedTradeStatus(confirmedOrder.tradeStatus)}</strong>
                </div>
              )}
              <button type="button" className="checkout-action-primary" onClick={openMisPublicaciones}>
                Ver mis publicaciones
              </button>
              <button type="button" className="checkout-secondary" onClick={openCatalogo}>
                Seguir comprando
              </button>
            </>
          )}
          {pending && (
            <>
              <h1 className="checkout-pending">Pago pendiente</h1>
              <p>El pago quedó en revisión. Te avisaremos cuando se confirme.</p>
              <button type="button" className="checkout-action-primary" onClick={openMisPublicaciones}>
                Ver en Mis publicaciones
              </button>
              <button type="button" className="checkout-secondary" onClick={openCatalogo}>
                Volver al catálogo
              </button>
            </>
          )}
          {!approved && !pending && (
            <>
              <h1 className="checkout-fail">Pago rechazado</h1>
              <p>No se pudo procesar el pago ({completedResult.statusDetail || completedResult.status}).</p>
              <button type="button" onClick={() => dispatch(clearCheckoutResult())}>Reintentar</button>
              <button type="button" className="checkout-secondary" onClick={openCatalogo}>
                Volver al catálogo
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

        {!loading && checkoutReady && amount != null && (
          <>
            <div className="checkout-resumen">
              <span>Orden #{order.id}</span>
              <strong>Total: {formatPrice(amount)}</strong>
            </div>

            <div className="checkout-payment-list">
              <CheckoutBalancePayment
                balance={currentUser.saldo}
                total={amount}
                loading={balanceProcessing}
                disabled={paymentBusy || mercadoPagoSelected}
                onPay={handleBalancePayment}
                formatPrice={formatPrice}
              />

              <CheckoutMercadoPagoPayment
                checkoutUrl={checkoutUrl}
                localMode={data?.checkoutMode === "local"}
                preparing={mercadoPagoProcessing}
                syncing={syncing}
                disabled={paymentBusy}
                onPrepare={handleMercadoPagoPayment}
                onSync={syncPaymentStatus}
              />
            </div>
          </>
        )}

        {!loading && !checkoutReady && !error && (
          <p className="checkout-message">No se pudo iniciar el checkout.</p>
        )}
      </div>
    </main>
  )
}

export default Checkout
