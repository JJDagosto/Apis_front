import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setCheckoutCupon } from "../../Redux/appSlice"
import { eliminarItemCarrito, vaciarCarrito } from "../../Redux/carritoSlice"
import { resetCheckout } from "../../Redux/checkoutSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { getCartTotals } from "../../utils/cartTotals"
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
  const [error, setError] = useState("")
  const [cupon, setCupon] = useState("")

  if (!currentUser) {
    return (
      <main className="cart-page">
        <CartEmptyState
          title="Carrito"
          message="Necesitás iniciar sesión para ver tu carrito."
          actionLabel="Iniciar sesión"
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

    try {
      await dispatch(eliminarItemCarrito(itemId)).unwrap()
      dispatch(resetCheckout())
      dispatch(mostrarNotificacion("Ítem eliminado del carrito."))
    } catch (removeError) {
      setError(removeError.message)
      dispatch(mostrarNotificacion(removeError.message, "error"))
    }
  }

  const handleClear = async () => {
    setError("")

    try {
      await dispatch(vaciarCarrito()).unwrap()
      dispatch(resetCheckout())
      dispatch(mostrarNotificacion("Carrito vaciado correctamente."))
    } catch (clearError) {
      setError(clearError.message)
      dispatch(mostrarNotificacion(clearError.message, "error"))
    }
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

    dispatch(setCheckoutCupon(cupon))
    navigate("/checkout")
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
          title="Tu carrito está vacío"
          message="Agregá una skin desde el catálogo para verla acá."
          actionLabel="Ir al catálogo"
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
            totals={cartTotals}
            tradeUrlIssue={tradeUrlIssue}
            updating={updating}
            onCuponChange={setCupon}
            onCheckout={handleCheckout}
            onCompleteProfile={() => navigate("/perfil")}
          />
        </section>
      )}
    </main>
  )
}

export default CartPage
