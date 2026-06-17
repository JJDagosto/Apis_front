import { useEffect, useState } from "react"
import { FaArrowLeft, FaBan, FaCreditCard, FaPen, FaShoppingCart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { agregarAlCarrito, eliminarItemCarrito } from "../Redux/carritoSlice"
import { resetCheckout } from "../Redux/checkoutSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { despublicarPublicacion, editarPublicacion } from "../Redux/publicacionesSlice"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Publicacion.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function Publicacion({
  skinId,
  goToLogin,
  goToPerfil,
  goToCarrito,
  volverAlCatalogo,
}) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []
  const myPublications = useSelector((state) => state.publicaciones.items)
  const loading = useSelector((state) => state.catalogo.loading)
  const skin = useSelector((state) =>
    state.catalogo.items.find((item) => item.id === skinId),
  )
  const [addingCart, setAddingCart] = useState(false)
  const [savingOwner, setSavingOwner] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [ownerPrice, setOwnerPrice] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (skin?.price != null) {
      setOwnerPrice(String(skin.price))
    }
  }, [skin])

  const cartItem = cartItems.find((item) => item.skin?.id === skin?.id)
  const isInCart = Boolean(cartItem)
  const ownPublication = myPublications.find((publication) => publication.id === skin?.id)
  const isOwnPublication = Boolean(ownPublication)

  const handleCartAction = async () => {
    setError("")

    if (!currentUser) {
      goToLogin()
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil para que el bot pueda enviarte la oferta de intercambio.`)
      dispatch(mostrarNotificacion(
        "Completa tu perfil antes de agregar skins al carrito.",
        "error",
      ))
      return
    }

    setAddingCart(true)

    try {
      if (isInCart) {
        await dispatch(eliminarItemCarrito(cartItem.id)).unwrap()
        dispatch(mostrarNotificacion("Item eliminado del carrito."))
      } else {
        await dispatch(agregarAlCarrito(skin.id)).unwrap()
        dispatch(mostrarNotificacion("Item agregado al carrito con exito."))
      }

      dispatch(resetCheckout())
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    } finally {
      setAddingCart(false)
    }
  }

  const handleOwnerEdit = async (event) => {
    event.preventDefault()
    setError("")

    const price = Number(ownerPrice)
    if (!price || price <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    setSavingOwner(true)
    try {
      await dispatch(editarPublicacion({
        skinId: skin.id,
        price,
        discount: skin.discount ?? 0,
        vendible: skin.vendible !== false,
        intercambiable: skin.intercambiable !== false,
      })).unwrap()
      dispatch(mostrarNotificacion("Precio actualizado correctamente."))
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    } finally {
      setSavingOwner(false)
    }
  }

  const handleDeactivate = async () => {
    setError("")

    const confirmed = window.confirm("Seguro que queres dar de baja esta publicacion?")
    if (!confirmed) return

    setDeactivating(true)
    try {
      const result = await dispatch(despublicarPublicacion(skin.id)).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Publicacion dada de baja.",
      ))
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    } finally {
      setDeactivating(false)
    }
  }

  const handleBuyNow = () => {
    setError("")

    if (!currentUser) {
      goToLogin()
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil para que el bot pueda enviarte la oferta de intercambio.`)
      return
    }

    goToCarrito()
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
    skin.vendedorUsername ??
    (isOwnPublication ? "Tu publicacion" : "Vendedor no disponible")

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

          {isOwnPublication ? (
            <form className="publication-owner-panel" onSubmit={handleOwnerEdit}>
              <div>
                <span>Administrar publicacion</span>
                <p>{skin.active === false ? "Esta publicacion esta dada de baja." : "Esta publicacion es tuya."}</p>
              </div>

              <label>
                Precio
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={ownerPrice}
                  onChange={(event) => setOwnerPrice(event.target.value)}
                  disabled={skin.active === false || savingOwner || deactivating}
                  required
                />
              </label>

              <div className="publication-owner-actions">
                <button
                  type="submit"
                  className="publication-owner-save"
                  disabled={skin.active === false || savingOwner || deactivating}
                >
                  <FaPen /> {savingOwner ? "Guardando..." : "Guardar precio"}
                </button>
                <button
                  type="button"
                  className="publication-owner-delete"
                  onClick={handleDeactivate}
                  disabled={skin.active === false || savingOwner || deactivating}
                >
                  <FaBan /> {deactivating ? "Dando de baja..." : "Dar de baja"}
                </button>
              </div>
            </form>
          ) : (
            <div className="publication-actions">
              <button className="publication-buy" onClick={handleBuyNow}>
                <FaCreditCard /> Comprar ahora
              </button>
              <button
                className={`publication-cart ${isInCart ? "publication-cart-active" : ""}`}
                onClick={handleCartAction}
                disabled={addingCart}
              >
                <FaShoppingCart />
                {addingCart
                  ? (isInCart ? "Removiendo..." : "Agregando...")
                  : (isInCart ? "Remover del carrito" : "Agregar al carrito")}
              </button>
            </div>
          )}

          {error?.includes("Steam Trade URL") && (
            <button className="publication-profile-link" type="button" onClick={goToPerfil}>
              Completar perfil
            </button>
          )}

          <dl className="publication-specs">
            <div>
              <dt>Estado</dt>
              <dd>{skin.catalogo?.exteriorName ?? skin.exterior ?? "-"}</dd>
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
