import { useEffect, useState } from "react"
import { FaArrowLeft, FaBan, FaCreditCard, FaPen, FaShoppingCart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { agregarAlCarrito, eliminarItemCarrito } from "../../Redux/carritoSlice"
import { resetCheckout } from "../../Redux/checkoutSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { despublicarPublicacion, editarPublicacion } from "../../Redux/publicacionesSlice"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import { getTradeUrlIssue } from "../../utils/tradeProfile"
import { getPositivePriceError } from "../../utils/validations.jsx"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"
import "../../pages/Publicacion.css"

function Publicacion() {
  const { formatPrice } = useCurrencyFormatter()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { skinId } = useParams()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []
  const myPublications = useSelector((state) => state.publicaciones.items)
  const loading = useSelector((state) => state.catalogo.loading)
  const skin = useSelector((state) =>
    state.catalogo.items.find((item) => String(item.id) === String(skinId)),
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
      navigate("/login")
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil para que el bot pueda enviarte la oferta de intercambio.`)
      dispatch(mostrarNotificacion(
        "Completa tu perfil antes de agregar skins al carrito.",
        "error",
      ))
      navigate("/perfil")
      return
    }

    setAddingCart(true)

    try {
      if (isInCart) {
        await dispatch(eliminarItemCarrito(cartItem.id)).unwrap()
        dispatch(mostrarNotificacion("Ítem eliminado del carrito."))
      } else {
        await dispatch(agregarAlCarrito(skin.id)).unwrap()
        dispatch(mostrarNotificacion("Ítem agregado al carrito con éxito."))
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

    const priceError = getPositivePriceError(ownerPrice)
    if (priceError) {
      setError(priceError)
      return
    }

    setSavingOwner(true)
    try {
      await dispatch(editarPublicacion({
        skinId: skin.id,
        price: Number(ownerPrice),
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

    const confirmed = window.confirm("¿Seguro que querés dar de baja esta publicación?")
    if (!confirmed) return

    setDeactivating(true)
    try {
      const result = await dispatch(despublicarPublicacion(skin.id)).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Publicación dada de baja.",
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
      navigate("/login")
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil para que el bot pueda enviarte la oferta de intercambio.`)
      return
    }

    navigate("/carrito")
  }

  if (loading) {
    return <p className="publication-message">Cargando publicación...</p>
  }

  if (error && !skin) {
    return (
      <main className="publication-page">
        <button className="publication-back" onClick={() => navigate("/catalogo")}>
          <FaArrowLeft /> Volver
        </button>
        <p className="publication-message">{error}</p>
      </main>
    )
  }

  if (!skin) {
    return (
      <main className="publication-page">
        <button className="publication-back" onClick={() => navigate("/catalogo")}>
          <FaArrowLeft /> Volver
        </button>
        <p className="publication-message">No se encontró la publicación.</p>
      </main>
    )
  }

  const nombreLimpio = limpiarNombreSkin(skin.name)
  const precioFinal = skin.finalPrice ?? skin.price
  const tieneDescuento = skin.discount > 0
  const vendedor =
    skin.vendedorUsername ??
    (isOwnPublication ? "Tu publicación" : "Vendedor no disponible")
  const canOpenSeller = Boolean(skin.vendedorUsername)
  const openSeller = () => {
    if (!skin.vendedorUsername) return
    navigate(`/vendedor/${encodeURIComponent(skin.vendedorUsername)}`)
  }

  return (
    <main className="publication-page">
      <button className="publication-back" onClick={() => navigate("/catalogo")}>
        <FaArrowLeft /> Volver al catálogo
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
              <span className="publication-old-price">{formatPrice(skin.price)}</span>
            )}
            <strong>{formatPrice(precioFinal)}</strong>
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
                <span>Administrar publicación</span>
                <p>{skin.active === false ? "Esta publicación está dada de baja." : "Esta publicación es tuya."}</p>
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
            <button className="publication-profile-link" type="button" onClick={() => navigate("/perfil")}>
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
              <dd>
                {canOpenSeller ? (
                  <button
                    className="publication-seller-link"
                    type="button"
                    onClick={openSeller}
                    title="Ver armas por vendedor"
                  >
                    {vendedor}
                  </button>
                ) : vendedor}
              </dd>
            </div>
            <div>
              <dt>Stattrak</dt>
              <dd>{skin.stattrak ? "Sí" : "No"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="publication-description">
        <h2>Descripción</h2>
        <p>{skin.description}</p>
      </section>
    </main>
  )
}

export default Publicacion
