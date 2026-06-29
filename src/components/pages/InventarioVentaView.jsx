import { useState } from "react"
import { FaPen, FaSyncAlt, FaTag, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  publicarInventarioItem,
  sincronizarInventario,
} from "../../Redux/inventarioSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import { getSellingSetupIssues } from "../../utils/tradeProfile"
import { actionErrorMessage, isRejectedAction } from "../../utils/reduxResult"
import { getPositivePriceError } from "../../utils/validations.jsx"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"
import "../../pages/InventarioVenta.css"

function InventarioVenta({ goToLogin, goToPerfil }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currency, rate, formatPrice } = useCurrencyFormatter()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const openPerfil = goToPerfil ?? (() => navigate("/perfil"))
  const currentUser = useSelector((state) => state.auth.currentUser)
  const myPublications = useSelector((state) => state.publicaciones.items)
  const publicationHistory = useSelector((state) => state.publicaciones.historial)
  const sales = useSelector((state) => state.publicaciones.salesNotifications)
  const {
    items,
    status,
    syncing,
    publishing,
    error: reduxError,
  } = useSelector((state) => state.inventario)
  const loading = status === "loading"
  const [selectedItem, setSelectedItem] = useState(null)
  const [price, setPrice] = useState("")
  const [discount, setDiscount] = useState("0")
  const [error, setError] = useState("")

  if (!currentUser) {
    return (
      <main className="inventory-page">
        <section className="inventory-empty-state">
          <h1>Inventario</h1>
          <p>Necesitás iniciar sesión para ver tu inventario de Steam.</p>
          <button type="button" onClick={openLogin}>Iniciar sesión</button>
        </section>
      </main>
    )
  }

  const cs2Items = items.filter((item) => item.catalogo)
  const sellingSetupIssues = getSellingSetupIssues(currentUser)
  const canSellFromProfile = sellingSetupIssues.length === 0

  const getSuggestedPriceUsd = (item) => (
    Number(item?.estimatedPrice ?? item?.catalogo?.estimatedPrice ?? 0) || 0
  )

  const formatInputPrice = (priceUsd) => {
    if (!priceUsd) return ""
    const displayValue = currency === "ARS" ? priceUsd * rate : priceUsd
    return displayValue.toFixed(2)
  }

  const inputPriceToUsd = (value) => {
    const numericValue = Number(String(value).replace(",", "."))
    if (!Number.isFinite(numericValue)) return 0
    return currency === "ARS" ? numericValue / rate : numericValue
  }

  const selectedPriceUsd = inputPriceToUsd(price)
  const selectedDiscountRate = Math.max(0, Math.min(Number(String(discount).replace(",", ".")) || 0, 100)) / 100
  const selectedFinalPriceUsd = selectedPriceUsd * (1 - selectedDiscountRate)

  const handleSync = async () => {
    setError("")

    const action = await dispatch(sincronizarInventario())
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      return
    }

    dispatch(mostrarNotificacion(
      action.payload?.message || "Inventario actualizado correctamente.",
    ))
  }

  const openPublishModal = (item) => {
    if (!canSellFromProfile) {
      setError("Completá tu Steam Trade URL y alias de cobro en Mi cuenta antes de publicar.")
      return
    }

    setSelectedItem(item)
    setPrice(formatInputPrice(getSuggestedPriceUsd(item)))
    setDiscount("0")
    setError("")
  }

  const closePublishModal = () => {
    if (publishing) return
    setSelectedItem(null)
    setPrice("")
    setDiscount("0")
  }

  const handlePublish = async (event) => {
    event.preventDefault()
    setError("")

    if (!canSellFromProfile) {
      setError("Completá tu Steam Trade URL y alias de cobro en Mi cuenta antes de publicar.")
      return
    }

    const priceError = getPositivePriceError(price)
    if (priceError) {
      setError(priceError)
      return
    }
    const discountNumber = Number(String(discount).replace(",", "."))
    if (!Number.isFinite(discountNumber) || discountNumber < 0 || discountNumber > 100) {
      setError("El descuento debe estar entre 0 y 100.")
      return
    }

    const action = await dispatch(publicarInventarioItem({
      itemId: selectedItem.id,
      price: inputPriceToUsd(price),
      discount: discountNumber / 100,
      vendible: true,
      intercambiable: false,
    }))

    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      return
    }

    dispatch(mostrarNotificacion(
      action.payload?.message || "Publicación creada correctamente.",
    ))
    setSelectedItem(null)
    setPrice("")
    setDiscount("0")
  }

  const getItemStatus = (item, publication, sale) => {
    if (sale) {
      if (sale.tradeStatus === "COMPLETED") return "Vendida · Intercambio completado"
      if (sale.tradeStatus === "BOT_SENT") return "Reservada · Oferta enviada"
      if (sale.tradeStatus === "PREPARING_TRADE") return "Reservada · Preparando intercambio"
      if (sale.tradeStatus === "WAITING_UNLOCK") return "Reservada · Esperando desbloqueo"
      return "Reservada · Pago confirmado"
    }
    if (publication?.estadoPublicacion === "RESERVADA") {
      return "Reservada · Esperando pago"
    }
    if (publication?.estadoPublicacion === "VENDIDA") {
      return "Vendida · Intercambio completado"
    }
    if (item.publicado) return "Publicado para venta"
    if (item.pending) return "Pendiente"
    if (item.tradable === false) return "No tradeable"
    return "Disponible"
  }

  const canPublish = (item) => {
    return !item.publicado && !item.pending && item.tradable !== false
  }

  const getPublicationForItem = (item) => {
    if (!item.publicado) return null

    const publications = [...myPublications, ...publicationHistory]
    return publications.find((publication) => (
      publication.inventarioItem?.id === item.id ||
      (publication.steamAssetId && publication.steamAssetId === item.assetId)
    )) ?? publications.find((publication) => (
      item.catalogo?.id && publication.catalogo?.id === item.catalogo.id
    )) ?? publications.find((publication) => publication.name === item.name)
  }

  const handlePublishedItem = (item, knownPublication) => {
    const publication = knownPublication ?? getPublicationForItem(item)

    if (!publication) {
      setError("No pude encontrar la publicación asociada. Probá refrescar la página o entrar desde Mis publicaciones.")
      return
    }

    navigate(`/publicacion/${publication.id}`)
  }

  return (
    <main className="inventory-page">
      <section className="inventory-header">
        <div>
          <h1>Inventario</h1>
          <p>Seleccioná una skin de CS2 de tu inventario de Steam para publicarla.</p>
        </div>

        <button className="inventory-sync" type="button" onClick={handleSync} disabled={syncing}>
          <FaSyncAlt /> {syncing ? "Sincronizando..." : "Sincronizar inventario"}
        </button>
      </section>

      <section className="inventory-warning">
        <strong>Importante sobre Steam</strong>
        <p>
          Por normativas de Steam, las skins publicadas podrán ser compradas recién 7 días después de su publicación. Al publicar, la skin será retirada de tu inventario. Si luego decidís retirar la publicación, la devolución también podría realizarse recién 7 días después de la publicación. Esta espera corresponde a reglas de Steam, no a una restricción nuestra.
        </p>
      </section>

      {!canSellFromProfile && (
        <section className="inventory-setup-warning">
          <strong>Faltan datos para vender</strong>
          <p>
            Para publicar skins, el bot necesita tu Steam Trade URL y también necesitamos tu alias de cobro para liquidar ventas.
          </p>
          <ul>
            {sellingSetupIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <button type="button" onClick={openPerfil}>Completar perfil</button>
        </section>
      )}

      {(error || reduxError) && (
        <p className="inventory-error">{error || reduxError}</p>
      )}

      {loading && <p className="inventory-message">Cargando inventario...</p>}

      {!loading && cs2Items.length === 0 && (
        <section className="inventory-empty-state">
          <h2>No encontramos skins de CS2 publicables</h2>
          <p>
            Verificá que hayas iniciado sesión con Steam, que tu inventario sea público y que hayas sincronizado el inventario.
          </p>
        </section>
      )}

      {!loading && cs2Items.length > 0 && (
        <section className="inventory-grid">
          {cs2Items.map((item) => {
            const publication = getPublicationForItem(item)
            const sale = publication
              ? sales.find((itemSale) => itemSale.skinId === publication.id)
              : null
            const reserved = publication?.estadoPublicacion === "RESERVADA"
            const sold = publication?.estadoPublicacion === "VENDIDA"

            return (
            <article className={`inventory-card ${reserved ? "inventory-card-reserved" : ""}`} key={item.id}>
              <div className="inventory-image-wrap">
                <img src={item.iconUrl || item.catalogo?.imageUrl} alt={item.name} />
              </div>

              <div className="inventory-card-body">
                <span className="inventory-weapon">{item.catalogo?.weaponName}</span>
                <h2>{limpiarNombreSkin(item.name)}</h2>
                <p>{item.catalogo?.exteriorName}</p>
                <span className="inventory-rarity" style={{ color: item.catalogo?.rarezaColor }}>
                  {item.catalogo?.rarezaName}
                </span>
              </div>

              <div className="inventory-card-footer">
                <span className={reserved ? "inventory-status-reserved" : ""}>
                  {getItemStatus(item, publication, sale)}
                </span>
                <button
                  type="button"
                  className={item.publicado ? "inventory-manage" : ""}
                  disabled={!item.publicado && (!canPublish(item) || !canSellFromProfile)}
                  onClick={() => item.publicado ? handlePublishedItem(item, publication) : openPublishModal(item)}
                >
                  {item.publicado ? <FaPen /> : <FaTag />}
                  {reserved || sold ? "Ver estado" : item.publicado ? "Administrar" : "Publicar"}
                </button>
              </div>
            </article>
            )
          })}
        </section>
      )}

      {selectedItem && (
        <div className="publish-modal-backdrop" role="presentation">
          <form className="publish-modal" onSubmit={handlePublish}>
            <button className="publish-close" type="button" onClick={closePublishModal}>
              <FaTimes />
            </button>

            <h2>Publicar skin</h2>
            <p className="publish-item-name">{selectedItem.name}</p>
            {getSuggestedPriceUsd(selectedItem) > 0 && (
              <div className="publish-price-hint">
                <span>Precio sugerido Steam -8%</span>
                <strong>{formatPrice(getSuggestedPriceUsd(selectedItem))}</strong>
              </div>
            )}

            <label>
              Precio de publicación ({currency})
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                autoFocus
                required
              />
            </label>

            <label>
              Descuento adicional (%)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </label>

            {selectedPriceUsd > 0 && (
              <div className="publish-final-price">
                <span>Precio final publicado</span>
                <strong>{formatPrice(selectedFinalPriceUsd)}</strong>
              </div>
            )}

            <div className="publish-warning">
              <strong>Antes de publicar</strong>
              <p>
                La skin será retirada de tu inventario al publicarla para venta y no podrá usarse en intercambios mientras esté publicada. Si retirás la publicación, el bot te la devuelve al inventario y vuelve a quedar disponible para intercambio.
              </p>
            </div>

            <button type="submit" disabled={publishing}>
              {publishing ? "Publicando..." : "Confirmar publicación"}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}

export default InventarioVenta
