import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  clearCheckoutCuponValidation,
  setCheckoutCupon,
  validarCheckoutCupon,
} from "../../Redux/appSlice"
import { eliminarItemCarrito, vaciarCarrito } from "../../Redux/carritoSlice"
import { prepararCheckoutCarrito } from "../../Redux/checkoutSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { getCartTotals } from "../../utils/cartTotals"
import { actionErrorMessage, isRejectedAction } from "../../utils/reduxResult"
import { getTradeUrlIssue } from "../../utils/tradeProfile"
import CartEmptyState from "./CartEmptyState.jsx"
import CartList from "./CartList.jsx"
import CartSummary from "./CartSummary.jsx"

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const { data: carrito, loading, updating, error: cartError } = useSelector(
    (state) => state.carrito,
  )
  const {
    couponValidation,
    couponStatus,
    couponError,
  } = useSelector((state) => state.app)
  const checkoutNeedsPreparation = useSelector((state) => {
    const checkout = state.checkout
    return Boolean(
      checkout.instantItem ||
        checkout.session ||
        checkout.data ||
        checkout.result ||
        checkout.error ||
        checkout.status !== "idle" ||
        checkout.syncing ||
        checkout.testProcessing ||
        checkout.balanceProcessing ||
        checkout.mercadoPagoProcessing,
    )
  })
  const [error, setError] = useState("")
  const [cupon, setCupon] = useState("")

  if (!currentUser) {
    return (
      <main className="cart-page">
        <CartEmptyState
          title="Carrito"
          message="Necesitas iniciar sesion para ver tu carrito."
          actionLabel="Iniciar sesion"
          onAction={() => navigate("/login")}
        />
      </main>
    )
  }

  const items = carrito?.items ?? []
  const cartTotals = getCartTotals(items)
  const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
  const displayError = error || cartError

  const handleRemove = async (itemId) => {
    setError("")

    const action = await dispatch(eliminarItemCarrito(itemId))
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      return
    }

    dispatch(mostrarNotificacion("Item eliminado del carrito."))
  }

  const handleClear = async () => {
    setError("")

    const action = await dispatch(vaciarCarrito())
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      return
    }

    dispatch(mostrarNotificacion("Carrito vaciado correctamente."))
  }

  const handleCheckout = () => {
    setError("")

    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.`)
      dispatch(mostrarNotificacion(
        "Completa tu perfil antes de continuar con la compra.",
        "error",
      ))
      return
    }

    if (checkoutNeedsPreparation) {
      dispatch(prepararCheckoutCarrito())
    }
    dispatch(setCheckoutCupon(cupon))
    navigate("/checkout")
  }

  const handleCuponChange = (value) => {
    setCupon(value)
    dispatch(clearCheckoutCuponValidation())
  }

  const handleValidateCupon = async () => {
    const normalizedCupon = cupon.trim()
    if (!normalizedCupon) {
      dispatch(clearCheckoutCuponValidation())
      return
    }

    const action = await dispatch(validarCheckoutCupon(normalizedCupon))
    if (!isRejectedAction(action)) {
      dispatch(mostrarNotificacion("Cupon valido."))
    }
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <div>
          <h1>Carrito</h1>
          <p>Revisa tus skins antes de continuar con la compra.</p>
        </div>
        {items.length > 0 && (
          <button className="cart-clear" type="button" onClick={handleClear} disabled={updating}>
            Vaciar carrito
          </button>
        )}
      </section>

      {loading && <p className="cart-message">Cargando carrito...</p>}
      {displayError && <p className="cart-error">{displayError}</p>}

      {!loading && items.length === 0 && (
        <CartEmptyState
          title="Tu carrito esta vacio"
          message="Agrega una skin desde el catalogo para verla aca."
          actionLabel="Ir al catalogo"
          onAction={() => navigate("/catalogo")}
          showIcon
        />
      )}

      {!loading && items.length > 0 && (
        <section className="cart-layout">
          <CartList
            items={cartTotals.lineItems}
            updating={updating}
            onRemove={handleRemove}
          />

          <CartSummary
            cupon={cupon}
            couponValidation={couponValidation}
            couponStatus={couponStatus}
            couponError={couponError}
            totals={cartTotals}
            tradeUrlIssue={tradeUrlIssue}
            updating={updating}
            onCuponChange={handleCuponChange}
            onValidateCupon={handleValidateCupon}
            onCheckout={handleCheckout}
            onCompleteProfile={() => navigate("/perfil")}
          />
        </section>
      )}
    </main>
  )
}

export default CartPage
