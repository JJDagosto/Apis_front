import { useEffect, useState } from "react"
import { FaPen, FaPause, FaPlay, FaTimes } from "react-icons/fa"
import {
  activarPublicacion,
  despublicarPublicacion,
  editarPublicacion,
  getHistorialPublicaciones,
  getMisPublicaciones,
} from "../api/skins"
import "./MisPublicaciones.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

const getEstadoPublicacion = (skin) => {
  if (skin.estadoPublicacion) return skin.estadoPublicacion
  return skin.active === false ? "PAUSADA" : "PUBLICADA"
}

const getEstadoLabel = (estado) => {
  if (estado === "PAUSADA") return "Pausada"
  if (estado === "RESERVADA") return "Reservada"
  if (estado === "VENDIDA") return "Vendida"
  return "Publicada"
}

const getEstadoClass = (estado) => {
  if (estado === "PAUSADA") return "badge-pausada"
  if (estado === "RESERVADA") return "badge-reservada"
  if (estado === "VENDIDA") return "badge-vendida"
  if (estado === "PUBLICADA") return "badge-publicada"
  return "badge-default"
}

function EstadoBadge({ estado }) {
  return (
    <span className={`pub-badge ${getEstadoClass(estado)}`}>
      {getEstadoLabel(estado)}
    </span>
  )
}

function MisPublicaciones({ currentUser, goToLogin, onPublicationsChange }) {
  const [publicaciones, setPublicaciones] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editPrice, setEditPrice] = useState("")
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setError("")
    setLoading(true)
    try {
      const [publicacionesData, historialData] = await Promise.all([
        getMisPublicaciones(),
        getHistorialPublicaciones(),
      ])
      setPublicaciones(publicacionesData)
      setHistorial(historialData)
      await onPublicationsChange?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="pub-page">
        <section className="pub-empty">
          <h1>Mis publicaciones</h1>
          <p>Necesitas iniciar sesion para ver tus publicaciones.</p>
          <button type="button" onClick={goToLogin}>Iniciar sesion</button>
        </section>
      </main>
    )
  }

  const activas = publicaciones.filter((skin) => getEstadoPublicacion(skin) === "PUBLICADA")
  const pausadas = publicaciones.filter((skin) => getEstadoPublicacion(skin) === "PAUSADA")

  const handleDespublicar = async (skin) => {
    setError("")
    setSuccess("")
    setActionId(skin.id)
    try {
      const msg = await despublicarPublicacion(skin.id)
      setSuccess(msg || "Publicacion dada de baja.")
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleActivar = async (skin) => {
    setError("")
    setSuccess("")
    setActionId(skin.id)
    try {
      const msg = await activarPublicacion(skin.id)
      setSuccess(msg || "Publicacion reactivada.")
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const openEdit = (skin) => {
    setError("")
    setSuccess("")
    setEditItem(skin)
    setEditPrice(String(skin.price ?? ""))
  }

  const closeEdit = () => {
    if (saving) return
    setEditItem(null)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    const price = Number(editPrice)
    if (!price || price <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    setSaving(true)
    try {
      await editarPublicacion(editItem.id, {
        price,
        discount: editItem.discount ?? 0,
      })
      setSuccess("Publicacion actualizada.")
      setEditItem(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const renderAcciones = (skin) => {
    const disabled = actionId === skin.id
    const estado = getEstadoPublicacion(skin)

    if (estado === "PAUSADA") {
      return (
        <div className="pub-actions">
          <button
            type="button"
            className="pub-btn pub-btn-play"
            disabled={disabled}
            onClick={() => handleActivar(skin)}
          >
            <FaPlay /> {disabled ? "..." : "Reactivar"}
          </button>
        </div>
      )
    }

    return (
      <div className="pub-actions">
        <button
          type="button"
          className="pub-btn pub-btn-edit"
          disabled={disabled}
          onClick={() => openEdit(skin)}
        >
          <FaPen /> Editar
        </button>

        <button
          type="button"
          className="pub-btn pub-btn-pause"
          disabled={disabled}
          onClick={() => handleDespublicar(skin)}
        >
          <FaPause /> {disabled ? "..." : "Dar de baja"}
        </button>
      </div>
    )
  }

  const renderCard = (skin, conAcciones) => {
    const precioFinal = skin.finalPrice ?? skin.price
    const tieneDescuento = (skin.discount ?? 0) > 0
    const estado = getEstadoPublicacion(skin)

    return (
      <article className="pub-card" key={skin.id}>
        <div className="pub-image-wrap">
          <img src={skin.imageUrl} alt={skin.name} />
          <EstadoBadge estado={estado} />
        </div>

        <div className="pub-card-body">
          <span className="pub-weapon">{skin.catalogo?.weaponName}</span>
          <h2>{limpiarNombreSkin(skin.name)}</h2>
          <p className="pub-exterior">{skin.catalogo?.exteriorName ?? skin.exterior}</p>

          <div className="pub-price-row">
            {tieneDescuento && (
              <span className="pub-old-price">${skin.price.toFixed(2)}</span>
            )}
            <strong>${precioFinal.toFixed(2)}</strong>
          </div>
        </div>

        {conAcciones && renderAcciones(skin)}
      </article>
    )
  }

  return (
    <main className="pub-page">
      <header className="pub-header">
        <h1>Mis publicaciones</h1>
        <p>Gestiona precio y estado de las skins que pusiste a la venta.</p>
      </header>

      {error && <p className="pub-error">{error}</p>}
      {success && <p className="pub-success">{success}</p>}
      {loading && <p className="pub-message">Cargando publicaciones...</p>}

      {!loading && (
        <>
          <section className="pub-section">
            <h2>Activas ({activas.length})</h2>
            {activas.length === 0 ? (
              <p className="pub-message">Todavia no tenes publicaciones activas.</p>
            ) : (
              <div className="pub-grid">
                {activas.map((skin) => renderCard(skin, true))}
              </div>
            )}
          </section>

          <section className="pub-section">
            <h2>Pausadas ({pausadas.length})</h2>
            {pausadas.length === 0 ? (
              <p className="pub-message">No tenes publicaciones pausadas.</p>
            ) : (
              <div className="pub-grid">
                {pausadas.map((skin) => renderCard(skin, true))}
              </div>
            )}
          </section>

          <section className="pub-section">
            <h2>Historial ({historial.length})</h2>
            {historial.length === 0 ? (
              <p className="pub-message">Todavia no tenes publicaciones vendidas o reservadas.</p>
            ) : (
              <div className="pub-grid">
                {historial.map((skin) => renderCard(skin, false))}
              </div>
            )}
          </section>
        </>
      )}

      {editItem && (
        <div className="pub-modal-backdrop" role="presentation">
          <form className="pub-modal" onSubmit={handleEditSubmit}>
            <button type="button" className="pub-modal-close" onClick={closeEdit}>
              <FaTimes />
            </button>

            <h2>Editar publicacion</h2>
            <p className="pub-modal-name">{limpiarNombreSkin(editItem.name)}</p>

            <label>
              Precio
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="pub-btn pub-btn-save" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}

export default MisPublicaciones
