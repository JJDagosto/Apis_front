import { useEffect, useState } from "react"
import { FaPen, FaSyncAlt, FaTag, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchInventario,
  publicarInventarioItem,
  sincronizarInventario,
} from "../Redux/inventarioSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { getSellingSetupIssues } from "../utils/tradeProfile"
import "./InventarioVenta.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function InventarioVenta({ goToLogin, goToPerfil, openPublicacion }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const myPublications = useSelector((state) => state.publicaciones.items)
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
      dispatch(fetchInventario())
    }
  }, [currentUser, dispatch])

  if (!currentUser) {
    return (
      <main className="inventory-page">
        <section className="inventory-empty-state">
          <h1>Vender skins</h1>
          <p>Necesitas iniciar sesion para ver tu inventario de Steam.</p>
          <button type="button" onClick={goToLogin}>Iniciar sesion</button>
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
      setError("Completa tu Steam Trade URL y alias de cobro en Mi cuenta antes de publicar.")
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

    const parsedPrice = Number(price)
    if (!canSellFromProfile) {
      setError("Completa tu Steam Trade URL y alias de cobro en Mi cuenta antes de publicar.")
      return
    }

    if (!parsedPrice || parsedPrice <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    if (!vendible && !intercambiable) {
      setError("La skin debe ser vendible, intercambiable o ambas.")
      return
    }

    try {
      const result = await dispatch(publicarInventarioItem({
        itemId: selectedItem.id,
        price: parsedPrice,
        vendible,
        intercambiable,
      })).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Publicacion creada correctamente.",
      ))
      setSelectedItem(null)
      setPrice("")
    } catch (error) {
      setError(error.message)
      dispatch(mostrarNotificacion(error.message, "error"))
    }
  }

  const getItemStatus = (item) => {
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

    return myPublications.find((publication) => (
      publication.active !== false &&
      item.catalogo?.id &&
      publication.catalogo?.id === item.catalogo.id
    )) ?? myPublications.find((publication) => (
      publication.active !== false &&
      publication.name === item.name
    ))
  }

  const handlePublishedItem = (item) => {
    const publication = getPublicationForItem(item)

    if (!publication) {
      setError("No pude encontrar la publicacion asociada. Proba refrescar la pagina o entrar desde Mis publicaciones.")
      return
    }

    openPublicacion?.(publication.id)
  }

  return (
    <main className="inventory-page">
      <section className="inventory-header">
        <div>
          <h1>Vender skins</h1>
          <p>Selecciona una skin de CS2 de tu inventario de Steam para publicarla.</p>
        </div>

        <button className="inventory-sync" type="button" onClick={handleSync} disabled={syncing}>
          <FaSyncAlt /> {syncing ? "Sincronizando..." : "Sincronizar inventario"}
        </button>
      </section>

      <section className="inventory-warning">
        <strong>Importante sobre Steam</strong>
        <p>
          Por normativas de Steam, las skins publicadas podran ser compradas recien 7 dias despues de su publicacion. Al publicar, la skin sera retirada de tu inventario. Si luego decidis retirar la publicacion, la devolucion tambien podria realizarse recien 7 dias despues de la publicacion. Esta espera corresponde a reglas de Steam, no a una restriccion nuestra.
        </p>
      </section>

      {!canSellFromProfile && (
        <section className="inventory-setup-warning">
          <strong>Faltan datos para vender</strong>
          <p>
            Para publicar skins, el bot necesita tu Steam Trade URL y tambien necesitamos tu alias de cobro para liquidar ventas.
          </p>
          <ul>
            {sellingSetupIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <button type="button" onClick={goToPerfil}>Completar perfil</button>
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
            Verifica que tu SteamID64 este configurado, que tu inventario sea publico y que hayas sincronizado el inventario.
          </p>
        </section>
      )}

      {!loading && cs2Items.length > 0 && (
        <section className="inventory-grid">
          {cs2Items.map((item) => (
            <article className="inventory-card" key={item.id}>
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
                <span>{getItemStatus(item)}</span>
                <button
                  type="button"
                  className={item.publicado ? "inventory-manage" : ""}
                  disabled={!item.publicado && (!canPublish(item) || !canSellFromProfile)}
                  onClick={() => item.publicado ? handlePublishedItem(item) : openPublishModal(item)}
                >
                  {item.publicado ? <FaPen /> : <FaTag />}
                  {item.publicado ? "Administrar" : "Publicar"}
                </button>
              </div>
            </article>
          ))}
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
              Precio de publicacion
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
                La skin sera retirada de tu inventario al publicarla. Por normativas de Steam, podra ser comprada recien 7 dias despues de la publicacion. Si retiraras la publicacion, la devolucion tambien podria quedar sujeta a esa espera de 7 dias. Esta condicion depende de Steam, no de nuestro marketplace.
              </p>
            </div>

            <button type="submit" disabled={publishing}>
              {publishing ? "Publicando..." : "Confirmar publicacion"}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}

export default InventarioVenta
