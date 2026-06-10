import { useEffect, useState } from "react"
import { FaPen, FaPause, FaPlay, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import {
  activarPublicacion,
  despublicarPublicacion,
  editarPublicacion,
  fetchDetallePublicaciones,
  fetchMisPublicaciones,
} from "../Redux/publicacionesSlice"
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
  if (estado === "ELIMINADA_ADMIN") return "Eliminada por admin"
  return "Publicada"
}

const getEstadoClass = (estado) => {
  if (estado === "PAUSADA") return "badge-pausada"
  if (estado === "RESERVADA") return "badge-reservada"
  if (estado === "VENDIDA") return "badge-vendida"
  if (estado === "ELIMINADA_ADMIN") return "badge-eliminada-admin"
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

function MisPublicaciones({ goToLogin }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const {
    items: publicaciones,
    historial,
    compras,
    status,
    detailStatus,
    error: reduxError,
  } = useSelector((state) => state.publicaciones)
  const loading = status === "loading" || detailStatus === "loading"
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editPrice, setEditPrice] = useState("")
  const [editVendible, setEditVendible] = useState(true)
  const [editIntercambiable, setEditIntercambiable] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchMisPublicaciones())
      dispatch(fetchDetallePublicaciones())
    }
  }, [currentUser, dispatch])

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
      const result = await dispatch(despublicarPublicacion(skin.id)).unwrap()
      setSuccess(result.message || "Publicacion dada de baja.")
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
      const result = await dispatch(activarPublicacion(skin.id)).unwrap()
      setSuccess(result.message || "Publicacion reactivada.")
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
    setEditVendible(skin.vendible !== false)
    setEditIntercambiable(skin.intercambiable !== false)
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
    if (!editVendible && !editIntercambiable) {
      setError("La skin debe ser vendible, intercambiable o ambas.")
      return
    }

    setSaving(true)
    try {
      await dispatch(editarPublicacion({
        skinId: editItem.id,
        price,
        discount: editItem.discount ?? 0,
        vendible: editVendible,
        intercambiable: editIntercambiable,
      })).unwrap()
      setSuccess("Publicacion actualizada.")
      setEditItem(null)
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
            <FaPlay /> {disabled ? "..." : "Activar"}
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

  const renderCompraCard = (orden) => {
    return orden.orderDetailResponses?.map((item) => (
      <article className="pub-card" key={`${orden.id}-${item.skinId}`}>
        <div className="pub-image-wrap">
          {item.imageUrl && <img src={item.imageUrl} alt={item.skinName} />}
          <span className="pub-badge badge-comprada">Comprada</span>
        </div>
        <div className="pub-card-body">
          <h2>{limpiarNombreSkin(item.skinName ?? "")}</h2>
          <strong>${(item.unitPrice ?? 0).toFixed(2)}</strong>
          <p className="pub-exterior" style={{ marginTop: 4, fontSize: "0.8rem", color: "#b9b9c6" }}>
            Orden #{orden.id}
          </p>
        </div>
      </article>
    ))
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

      {(error || reduxError) && <p className="pub-error">{error || reduxError}</p>}
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
            <h2>Mis compras ({compras.reduce((acc, o) => acc + (o.orderDetailResponses?.length ?? 0), 0)})</h2>
            {compras.length === 0 ? (
              <p className="pub-message">Todavia no compraste ninguna skin.</p>
            ) : (
              <div className="pub-grid">
                {compras.map((orden) => renderCompraCard(orden))}
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

            <div className="pub-modal-checks">
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={editVendible}
                  onChange={(e) => setEditVendible(e.target.checked)}
                />
                Vendible
              </label>
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={editIntercambiable}
                  onChange={(e) => setEditIntercambiable(e.target.checked)}
                />
                Intercambiable
              </label>
            </div>

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
