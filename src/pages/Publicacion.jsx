import { useEffect, useState } from "react"
import { FaArrowLeft, FaShoppingCart, FaCreditCard } from "react-icons/fa"
import { agregarAlCarrito } from "../api/carrito"
import "./Publicacion.css"

const URL = "http://localhost:4003"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function Publicacion({ skinId, currentUser, goToLogin, goToCarrito, volverAlCatalogo }) {
  const [skin, setSkin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingCart, setAddingCart] = useState(false)
  const [error, setError] = useState("")
  const [cartMessage, setCartMessage] = useState("")

  useEffect(() => {
    if (!skinId) {
      setError("No se encontro la publicacion.")
      setLoading(false)
      return
    }

    setLoading(true)

    fetch(`${URL}/skins/get/${skinId}`)
      .then((res) => res.json())
      .then((json) => setSkin(json.data))
      .catch((error) => {
        console.error(error)
        setError("No se pudo cargar la publicacion.")
      })
      .finally(() => setLoading(false))
  }, [skinId])

  const handleAddToCart = async () => {
    setError("")
    setCartMessage("")

    if (!currentUser) {
      goToLogin()
      return
    }

    setAddingCart(true)

    try {
      await agregarAlCarrito(skin.id, 1)
      setCartMessage("Skin agregada al carrito.")
    } catch (error) {
      setError(error.message)
    } finally {
      setAddingCart(false)
    }
  }

  if (loading) {
    return <p className="publication-message">Cargando publicacion...</p>
  }

  if (error && !skin) {
    return (
      <main className="publication-page">
        <button className="publication-back" onClick={volverAlCatalogo}>
          <FaArrowLeft /> Volver
        </button>
        <p className="publication-message">{error}</p>
      </main>
    )
  }

  if (!skin) {
    return (
      <main className="publication-page">
        <button className="publication-back" onClick={volverAlCatalogo}>
          <FaArrowLeft /> Volver
        </button>
        <p className="publication-message">No se encontro la publicacion.</p>
      </main>
    )
  }

  const nombreLimpio = limpiarNombreSkin(skin.name)
  const precioFinal = skin.finalPrice ?? skin.price
  const tieneDescuento = skin.discount > 0
  const vendedor =
    skin.vendedor?.username ??
    skin.vendedor?.realUsername ??
    skin.vendedor?.email ??
    "Vendedor no disponible"

  return (
    <main className="publication-page">
      <button className="publication-back" onClick={volverAlCatalogo}>
        <FaArrowLeft /> Volver al catalogo
      </button>

      <section className="publication-layout">
        <div className="publication-media">
          <div className="publication-image-wrap">
            <img src={skin.imageUrl} alt={skin.name} />
          </div>
        </div>

        <aside className="publication-info">
          <span className="publication-category">{skin.catalogo?.categoryName}</span>
          <h1>{nombreLimpio}</h1>
          <p className="publication-weapon">{skin.catalogo?.weaponName}</p>

          <div className="publication-price-block">
            {tieneDescuento && (
              <span className="publication-old-price">${skin.price.toFixed(2)}</span>
            )}
            <strong>${precioFinal.toFixed(2)}</strong>
            {tieneDescuento && (
              <span className="publication-discount">
                {Math.round(skin.discount * 100)}% OFF
              </span>
            )}
          </div>

          {error && <p className="publication-error">{error}</p>}
          {cartMessage && <p className="publication-success">{cartMessage}</p>}

          <div className="publication-actions">
            <button className="publication-buy" onClick={goToCarrito}>
              <FaCreditCard /> Comprar ahora
            </button>
            <button className="publication-cart" onClick={handleAddToCart} disabled={addingCart}>
              <FaShoppingCart /> {addingCart ? "Agregando..." : "Agregar al carrito"}
            </button>
          </div>

          <dl className="publication-specs">
            <div>
              <dt>Estado</dt>
              <dd>{skin.catalogo?.exteriorName ?? skin.exterior}</dd>
            </div>
            <div>
              <dt>Rareza</dt>
              <dd style={{ color: skin.catalogo?.rarezaColor ?? "inherit" }}>
                {skin.catalogo?.rarezaName ?? skin.rareza}
              </dd>
            </div>
            <div>
              <dt>Vendedor</dt>
              <dd>{vendedor}</dd>
            </div>
            <div>
              <dt>Stattrak</dt>
              <dd>{skin.stattrak ? "Si" : "No"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="publication-description">
        <h2>Descripcion</h2>
        <p>{skin.description}</p>
      </section>
    </main>
  )
}

export default Publicacion