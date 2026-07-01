import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  clearCheckoutResult,
  iniciarCheckout,
  pagarCheckoutConSaldo,
  prepararMercadoPagoCheckout,
  sincronizarPagoCheckout,
} from "../Redux/checkoutSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter"
import CheckoutBalancePayment from "../components/checkout/CheckoutBalancePayment.jsx"
import CheckoutMercadoPagoPayment from "../components/checkout/CheckoutMercadoPagoPayment.jsx"
import CheckoutResult from "../components/checkout/CheckoutResult.jsx"
import { getMercadoPagoCheckoutUrl } from "../utils/mercadoPagoCheckout"
import "./Checkout.css"

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
  const paymentWindowRef = useRef(null)
  const [localError, setLocalError] = useState("")
  const [mercadoPagoRequested, setMercadoPagoRequested] = useState(false)

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
    if (
      !currentUser ||
      order?.id ||
      hasReusableCheckout ||
      completedResult?.status === "approved"
    ) return
    dispatch(iniciarCheckout({
      cupon: normalizedCupon,
      email: currentUser.email,
    }))
  }, [completedResult?.status, currentUser, dispatch, hasReusableCheckout, normalizedCupon, order?.id])

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

  useEffect(() => {
    if (!mercadoPagoRequested || !checkoutUrl) return
    setMercadoPagoRequested(false)

    const paymentWindow = paymentWindowRef.current
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.location.href = checkoutUrl
      paymentWindowRef.current = null
      return
    }

    const newWindow = window.open(checkoutUrl, "_blank")
    if (!newWindow) {
      setLocalError("El navegador bloqueo la pestana de Mercado Pago. Habilita ventanas emergentes e intenta de nuevo.")
      return
    }
    newWindow.opener = null
  }, [checkoutUrl, mercadoPagoRequested])

  const syncPaymentStatus = useCallback(() => {
    if (!order?.id || completedResult || syncingRef.current) return
    syncingRef.current = true
    setLocalError("")
    dispatch(sincronizarPagoCheckout())
    syncingRef.current = false
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

  const handleBalancePayment = () => {
    if (completedResult || paymentBusy) return
    if (mercadoPagoSelected) {
      setLocalError("Ya iniciaste el pago con Mercado Pago para esta orden.")
      return
    }
    setLocalError("")
    dispatch(pagarCheckoutConSaldo())
  }

  const handleMercadoPagoPayment = () => {
    if (completedResult || paymentBusy) return
    setLocalError("")
    const paymentWindow = window.open("", "_blank")
    if (!paymentWindow) {
      setLocalError("El navegador bloqueo la pestana de Mercado Pago. Habilita ventanas emergentes e intenta de nuevo.")
      return
    }

    paymentWindow.opener = null
    paymentWindow.document.title = "Mercado Pago"
    paymentWindow.document.body.innerHTML = "<p style=\"font-family:sans-serif\">Abriendo Mercado Pago...</p>"
    paymentWindowRef.current = paymentWindow
    setMercadoPagoRequested(true)
    dispatch(prepararMercadoPagoCheckout())
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
    return (
      <CheckoutResult
        completedResult={completedResult}
        order={order}
        onRetry={() => dispatch(clearCheckoutResult())}
        onCatalogo={openCatalogo}
        onMisPublicaciones={openMisPublicaciones}
      />
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
