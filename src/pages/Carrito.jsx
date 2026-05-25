import { useEffect, useState } from "react"
import { FaTrash, FaShoppingCart } from "react-icons/fa"
import {
  eliminarItemCarrito,
  getCarrito,
  vaciarCarrito,
} from "../api/carrito"
import "./Carrito.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function Carrito({ currentUser, goToLogin, goToCatalogo, goToCheckout, onCartChange }) {
  const [carrito, setCarrito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [cupon, setCupon] = useState("")

  const loadCart = async () => {
    setError("")
    setLoading(true)

    try {
      const data = await getCarrito()
      setCarrito(data)
      await onCartChange?.()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) loadCart()
  }, [currentUser])

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

  const handleRemove = async (itemId) => {
    setUpdating(true)
    setError("")
    setSuccess("")

    try {
      const updated = await eliminarItemCarrito(itemId)
      setCarrito(updated)
      await onCartChange?.()
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleClear = async () => {
    setUpdating(true)
    setError("")
    setSuccess("")

    try {
      const updated = await vaciarCarrito()
      setCarrito(updated)
      await onCartChange?.()
      setSuccess("Carrito vaciado.")
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdating(false)
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
      {error && <p className="cart-error">{error}</p>}
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
              onClick={() => goToCheckout(cupon)}
              disabled={updating}
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
