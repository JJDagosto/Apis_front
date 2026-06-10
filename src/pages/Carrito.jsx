import { useState } from "react"
import { FaTrash, FaShoppingCart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { eliminarItemCarrito, vaciarCarrito } from "../Redux/carritoSlice"
import { resetCheckout } from "../Redux/checkoutSlice"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Carrito.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function Carrito({ goToLogin, goToCatalogo, goToPerfil, goToCheckout }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const { data: carrito, loading, updating, error: cartError } = useSelector(
    (state) => state.carrito,
  )
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [cupon, setCupon] = useState("")

  if (!currentUser) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <h1>Carrito</h1>
          <p>Necesitas iniciar sesion para ver tu carrito.</p>
          <button type="button" onClick={goToLogin}>Iniciar sesion</button>
        </section>
      </main>
    )
  }

  const items = carrito?.items ?? []
  const total = items.reduce((sum, item) => sum + item.precioUnitario, 0)
  const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
  const displayError = error || cartError

  const handleRemove = async (itemId) => {
    setError("")
    setSuccess("")

    try {
      await dispatch(eliminarItemCarrito(itemId)).unwrap()
      dispatch(resetCheckout())
    } catch (error) {
      setError(error.message)
    }
  }

  const handleClear = async () => {
    setError("")
    setSuccess("")

    try {
      await dispatch(vaciarCarrito()).unwrap()
      dispatch(resetCheckout())
      setSuccess("Carrito vaciado.")
    } catch (error) {
      setError(error.message)
    }
  }

  const handleCheckout = () => {
    setError("")
    setSuccess("")

    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.`)
      return
    }

    goToCheckout(cupon)
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
      {success && <p className="cart-success">{success}</p>}

      {!loading && items.length === 0 && (
        <section className="cart-empty">
          <FaShoppingCart size={34} />
          <h2>Tu carrito esta vacio</h2>
          <p>Agrega una skin desde el catalogo para verla aca.</p>
          <button type="button" onClick={goToCatalogo}>Ir al catalogo</button>
        </section>
      )}

      {!loading && items.length > 0 && (
        <section className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const skin = item.skin

              return (
                <article className="cart-item" key={item.id}>
                  <div className="cart-image-wrap">
                    <img src={skin.imageUrl} alt={skin.name} />
                  </div>

                  <div className="cart-item-info">
                    <span>{skin.catalogo?.weaponName}</span>
                    <h2>{limpiarNombreSkin(skin.name)}</h2>
                    <p>{skin.catalogo?.exteriorName ?? skin.exterior}</p>
                  </div>

                  <div className="cart-price">
                    <strong>${item.precioUnitario.toFixed(2)}</strong>
                  </div>

                  <button
                    className="cart-remove"
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={updating}
                  >
                    <FaTrash />
                  </button>
                </article>
              )
            })}
          </div>

          <aside className="cart-summary">
            <h2>Resumen</h2>
            {tradeUrlIssue && (
              <div className="cart-setup-warning">
                <strong>Falta Steam Trade URL</strong>
                <p>{tradeUrlIssue} El bot necesita ese enlace para entregarte las skins.</p>
                <button type="button" onClick={goToPerfil}>Completar perfil</button>
              </div>
            )}
            <div>
              <span>Items</span>
              <strong>{items.length}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <label className="cart-cupon">
              Cupon (opcional)
              <input
                type="text"
                value={cupon}
                onChange={(e) => setCupon(e.target.value.trim())}
                placeholder="Ingresa un codigo"
              />
            </label>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={updating || Boolean(tradeUrlIssue)}
            >
              Continuar compra
            </button>
            <small>El descuento del cupon se valida al crear la orden.</small>
          </aside>
        </section>
      )}
    </main>
  )
}

export default Carrito
