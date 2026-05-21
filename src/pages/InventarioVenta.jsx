import { useEffect, useState } from "react"
import { FaSyncAlt, FaTag, FaTimes } from "react-icons/fa"
import { getInventario, publicarInventarioItem, syncInventario } from "../api/inventario"
import "./InventarioVenta.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function InventarioVenta({ currentUser, goToLogin }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadInventory = async () => {
    setError("")
    setLoading(true)

    try {
      const inventario = await getInventario()
      setItems(inventario)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadInventory()
    }
  }, [currentUser])

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

  const handleSync = async () => {
    setError("")
    setSuccess("")
    setSyncing(true)

    try {
      const message = await syncInventario()
      setSuccess(message)
      await loadInventory()
    } catch (error) {
      setError(error.message)
    } finally {
      setSyncing(false)
    }
  }

  const openPublishModal = (item) => {
    setSelectedItem(item)
    setPrice("")
    setError("")
    setSuccess("")
  }

  const closePublishModal = () => {
    if (publishing) return
    setSelectedItem(null)
    setPrice("")
  }

  const handlePublish = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    const parsedPrice = Number(price)
    if (!parsedPrice || parsedPrice <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    setPublishing(true)

    try {
      await publicarInventarioItem(selectedItem.id, { price: parsedPrice })
      setSuccess("Publicacion creada correctamente.")
      closePublishModal()
      await loadInventory()
    } catch (error) {
      setError(error.message)
    } finally {
      setPublishing(false)
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

      {error && <p className="inventory-error">{error}</p>}
      {success && <p className="inventory-success">{success}</p>}

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
                  disabled={!canPublish(item)}
                  onClick={() => openPublishModal(item)}
                >
                  <FaTag /> Publicar
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