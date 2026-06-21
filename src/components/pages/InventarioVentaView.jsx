import { useEffect, useState } from "react"
import { FaPen, FaSyncAlt, FaTag, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchInventario,
  publicarInventarioItem,
  sincronizarInventario,
} from "../../Redux/inventarioSlice"
import {
  fetchMisPublicaciones,
  fetchSalesNotifications,
} from "../../Redux/publicacionesSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import { getSellingSetupIssues } from "../../utils/tradeProfile"
import {
  getPositivePriceError,
  getPublicationAvailabilityError,
} from "../../utils/validations.jsx"
import "../../pages/InventarioVenta.css"

function InventarioVenta({ goToLogin, goToPerfil }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
  const [vendible, setVendible] = useState(true)
  const [intercambiable, setIntercambiable] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchInventario({ force: true }))
      dispatch(fetchMisPublicaciones({ force: true }))
      dispatch(fetchSalesNotifications({ force: true }))
    }
  }, [currentUser, dispatch])

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

  const handleSync = async () => {
    setError("")

    try {
      const result = await dispatch(sincronizarInventario()).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Inventario actualizado correctamente.",
      ))
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    }
  }

  const openPublishModal = (item) => {
    if (!canSellFromProfile) {
      setError("Completá tu Steam Trade URL y alias de cobro en Mi cuenta antes de publicar.")
      return
    }

    setSelectedItem(item)
    setPrice("")
    setVendible(true)
    setIntercambiable(true)
    setError("")
  }

  const closePublishModal = () => {
    if (publishing) return
    setSelectedItem(null)
    setPrice("")
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

    const availabilityError = getPublicationAvailabilityError(vendible, intercambiable)
    if (availabilityError) {
      setError(availabilityError)
      return
    }

    try {
      const result = await dispatch(publicarInventarioItem({
        itemId: selectedItem.id,
        price: Number(price),
        vendible,
        intercambiable,
      })).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Publicación creada correctamente.",
      ))
      setSelectedItem(null)
      setPrice("")
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    }
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
    if (item.publicado) return "Ya publicado"
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
            Verificá que tu SteamID64 esté configurado, que tu inventario sea público y que hayas sincronizado el inventario.
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

            <label>
              Precio de publicación
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

            <div className="publish-modal-checks">
              <label className="publish-check">
                <input
                  type="checkbox"
                  checked={vendible}
                  onChange={(event) => setVendible(event.target.checked)}
                />
                Vendible
              </label>
              <label className="publish-check">
                <input
                  type="checkbox"
                  checked={intercambiable}
                  onChange={(event) => setIntercambiable(event.target.checked)}
                />
                Intercambiable
              </label>
            </div>

            <div className="publish-warning">
              <strong>Antes de publicar</strong>
              <p>
                La skin será retirada de tu inventario al publicarla. Por normativas de Steam, podrá ser comprada recién 7 días después de la publicación. Si retiraras la publicación, la devolución también podría quedar sujeta a esa espera de 7 días. Esta condición depende de Steam, no de nuestro marketplace.
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
