import { useEffect, useState } from "react"
import { FaPen, FaPause, FaPlay, FaTimes } from "react-icons/fa"
import {
  getMisPublicaciones,
  getHistorialPublicaciones,
  editarPublicacion,
  despublicarPublicacion,
  republicarPublicacion,
} from "../api/skins"
import "./MisPublicaciones.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

// Mapa de estado -> etiqueta + clase de color del badge.
const ESTADOS = {
  PUBLICADA: { label: "Publicada", clase: "badge-publicada" },
  PAUSADA: { label: "Pausada", clase: "badge-pausada" },
  RESERVADA: { label: "Reservada", clase: "badge-reservada" },
  VENDIDA: { label: "Vendida", clase: "badge-vendida" },
}

function EstadoBadge({ estado }) {
  const info = ESTADOS[estado] ?? { label: estado, clase: "badge-default" }
  return <span className={`pub-badge ${info.clase}`}>{info.label}</span>
}

function MisPublicaciones({ currentUser, goToLogin }) {
  const [activas, setActivas] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null) // id con accion en curso (deshabilita botones)

  // Estado del modal de edicion.
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({
    price: "",
    discountPct: "",
    intercambiable: true,
    vendible: true,
  })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setError("")
    setLoading(true)
    try {
      // Dos endpoints distintos: activas (PUBLICADA/PAUSADA) e historial (RESERVADA/VENDIDA).
      const [act, hist] = await Promise.all([
        getMisPublicaciones(),
        getHistorialPublicaciones(),
      ])
      setActivas(act)
      setHistorial(hist)
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

  const handleDespublicar = async (skin) => {
    setError("")
    setSuccess("")
    setActionId(skin.id)
    try {
      const msg = await despublicarPublicacion(skin.id)
      setSuccess(msg || "Publicacion pausada.")
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleRepublicar = async (skin) => {
    setError("")
    setSuccess("")
    setActionId(skin.id)
    try {
      const msg = await republicarPublicacion(skin.id)
      setSuccess(msg || "Publicacion reactivada.")
      await loadData()
    } catch (err) {
      // Caso tipico: stock < 1 -> el back devuelve el motivo.
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const openEdit = (skin) => {
    setError("")
    setSuccess("")
    setEditItem(skin)
    setEditForm({
      price: skin.price ?? "",
      discountPct: Math.round((skin.discount ?? 0) * 100),
      intercambiable: skin.intercambiable !== false,
      vendible: skin.vendible !== false,
    })
  }

  const closeEdit = () => {
    if (saving) return
    setEditItem(null)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    const price = Number(editForm.price)
    const pct = Number(editForm.discountPct)

    // Validaciones espejo de las del back, para no mandar requests que sabemos que rebotan.
    if (!price || price <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setError("El descuento debe estar entre 0 y 100.")
      return
    }
    if (!editForm.intercambiable && !editForm.vendible) {
      setError("La skin debe ser intercambiable, vendible o ambas.")
      return
    }

    setSaving(true)
    try {
      await editarPublicacion(editItem.id, {
        price,                       // SIEMPRE se manda (bug del back: setPrice sin null-check)
        discount: pct / 100,         // back espera fraccion 0–1
        intercambiable: editForm.intercambiable,
        vendible: editForm.vendible,
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

  // Acciones disponibles segun estado (solo para las activas).
  const renderAcciones = (skin) => {
    const estado = skin.estadoPublicacion
    const disabled = actionId === skin.id

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

        {estado === "PUBLICADA" && (
          <button
            type="button"
            className="pub-btn pub-btn-pause"
            disabled={disabled}
            onClick={() => handleDespublicar(skin)}
          >
            <FaPause /> {disabled ? "..." : "Despublicar"}
          </button>
        )}

        {estado === "PAUSADA" && (
          <button
            type="button"
            className="pub-btn pub-btn-play"
            disabled={disabled}
            onClick={() => handleRepublicar(skin)}
          >
            <FaPlay /> {disabled ? "..." : "Republicar"}
          </button>
        )}
      </div>
    )
  }

  const renderCard = (skin, conAcciones) => {
    const precioFinal = skin.finalPrice ?? skin.price
    const tieneDescuento = (skin.discount ?? 0) > 0

    return (
      <article className="pub-card" key={skin.id}>
        <div className="pub-image-wrap">
          <img src={skin.imageUrl} alt={skin.name} />
          <EstadoBadge estado={skin.estadoPublicacion} />
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

          <div className="pub-flags">
            <span className={skin.intercambiable ? "flag-on" : "flag-off"}>
              Intercambiable
            </span>
            <span className={skin.vendible ? "flag-on" : "flag-off"}>
              Vendible
            </span>
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
        <p>Gestiona el estado y los datos de las skins que pusiste a la venta.</p>
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
            <h2>Historial ({historial.length})</h2>
            {historial.length === 0 ? (
              <p className="pub-message">Sin ventas ni reservas todavia.</p>
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
                value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </label>

            <label>
              Descuento (%)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={editForm.discountPct}
                onChange={(e) => setEditForm((f) => ({ ...f, discountPct: e.target.value }))}
              />
            </label>

            <div className="pub-modal-toggles">
              <label className="pub-checkbox">
                <input
                  type="checkbox"
                  checked={editForm.intercambiable}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, intercambiable: e.target.checked }))
                  }
                />
                Intercambiable
              </label>
              <label className="pub-checkbox">
                <input
                  type="checkbox"
                  checked={editForm.vendible}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, vendible: e.target.checked }))
                  }
                />
                Vendible
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
