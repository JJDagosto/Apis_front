import { useState } from "react"
import { FaCreditCard, FaPen, FaPause, FaPlay, FaTimes, FaTrash } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { marcarInventarioItemDisponible } from "../../Redux/inventarioSlice"
import {
  activarPublicacion,
  activarPublicacionLocal,
  cancelarPagoPendiente,
  despublicarPublicacion,
  despublicarPublicacionLocal,
  editarPublicacionLocal,
  editarPublicacion,
  pausarPublicacion,
  pausarPublicacionLocal,
} from "../../Redux/publicacionesSlice"
import { resetCheckout, retomarCheckoutPendiente } from "../../Redux/checkoutSlice"
import { fetchMisOperaciones } from "../../Redux/intercambioSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import ExchangeOperationsSection from "../publicaciones/ExchangeOperationsSection.jsx"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"
import { actionErrorMessage, isRejectedAction } from "../../utils/reduxResult"
import { getPositivePriceError } from "../../utils/validations.jsx"
import "../../pages/MisPublicaciones.css"

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

const getTradeStatusLabel = (tradeStatus) => {
  const labels = {
    WAITING_PAYMENT: "Pago confirmado",
    WAITING_UNLOCK: "Esperando desbloqueo de Steam",
    PREPARING_TRADE: "Preparando intercambio",
    BOT_SENT: "Oferta de intercambio enviada",
    COMPLETED: "Intercambio completado",
    CANCELLED: "Intercambio cancelado",
    FAILED: "Intercambio con error",
    EXPIRED: "Oferta de intercambio vencida",
  }
  return labels[tradeStatus] ?? "Compra confirmada"
}

const parseDecimalInput = (value) => Number(String(value).replace(",", "."))

function EstadoBadge({ estado }) {
  return (
    <span className={`pub-badge ${getEstadoClass(estado)}`}>
      {getEstadoLabel(estado)}
    </span>
  )
}

function MisPublicaciones({ goToLogin }) {
  const { formatPrice } = useCurrencyFormatter()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const currentUser = useSelector((state) => state.auth.currentUser)
  const {
    items: publicaciones,
    historial,
    compras,
    pagosPendientes,
    salesNotifications,
    status,
    detailStatus,
    error: reduxError,
  } = useSelector((state) => state.publicaciones)
  const {
    operations,
    operationsStatus,
    operationsError,
  } = useSelector((state) => state.intercambio)
  const intercambios = operations.filter(
    (operation) => operation.operationType === "EXCHANGE",
  )
  const loading = status === "loading" || detailStatus === "loading"
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editPrice, setEditPrice] = useState("")
  const [editDiscount, setEditDiscount] = useState("0")
  const [saving, setSaving] = useState(false)
  const [pendingActionId, setPendingActionId] = useState(null)

  if (!currentUser) {
    return (
      <main className="pub-page">
        <section className="pub-empty">
          <h1>Mis publicaciones</h1>
          <p>Necesitás iniciar sesión para ver tus publicaciones.</p>
          <button type="button" onClick={openLogin}>Iniciar sesión</button>
        </section>
      </main>
    )
  }

  const activas = publicaciones.filter((skin) => getEstadoPublicacion(skin) === "PUBLICADA")
  const pausadas = publicaciones.filter((skin) => getEstadoPublicacion(skin) === "PAUSADA")
  const activityCount =
    compras.reduce((acc, order) => acc + (order.orderDetailResponses?.length ?? 0), 0) +
    intercambios.length +
    historial.length

  const handleDespublicar = async (skin) => {
    setError("")
    setActionId(skin.id)
    if (skin.localOptimistic) {
      dispatch(despublicarPublicacionLocal(skin))
      dispatch(mostrarNotificacion("Publicación retirada."))
      setActionId(null)
      return
    }

    const action = await dispatch(despublicarPublicacion(skin.id))
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      setActionId(null)
      return
    }

    dispatch(marcarInventarioItemDisponible({
      itemId: skin.inventarioItem?.id,
      steamAssetId: skin.steamAssetId,
      catalogoId: skin.catalogo?.id,
      name: skin.name,
    }))
    dispatch(mostrarNotificacion(
      action.payload?.message || "Publicación retirada. El bot devolverá la skin al inventario.",
    ))
    setActionId(null)
  }

  const handlePausar = async (skin) => {
    setError("")
    setActionId(skin.id)
    if (skin.localOptimistic) {
      dispatch(pausarPublicacionLocal(skin))
      dispatch(mostrarNotificacion("Publicación pausada. Podés reactivarla desde Mis publicaciones."))
      setActionId(null)
      return
    }

    const action = await dispatch(pausarPublicacion(skin.id))
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      setActionId(null)
      return
    }

    dispatch(mostrarNotificacion(
      action.payload?.message || "Publicacion pausada. Podés reactivarla desde Mis publicaciones.",
    ))
    setActionId(null)
  }

  const handleActivar = async (skin) => {
    setError("")
    setActionId(skin.id)
    if (skin.localOptimistic) {
      dispatch(activarPublicacionLocal(skin))
      dispatch(mostrarNotificacion("Publicación reactivada."))
      setActionId(null)
      return
    }

    const action = await dispatch(activarPublicacion(skin.id))
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      setActionId(null)
      return
    }

    dispatch(mostrarNotificacion(
      action.payload?.message || "Publicación reactivada.",
    ))
    setActionId(null)
  }

  const openEdit = (skin) => {
    setError("")
    setEditItem(skin)
    setEditPrice(String(skin.price ?? ""))
    setEditDiscount(String(Math.round(Number(skin.discount ?? 0) * 100)))
  }

  const closeEdit = () => {
    if (saving) return
    setEditItem(null)
    setEditDiscount("0")
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    setError("")

    const priceError = getPositivePriceError(editPrice)
    if (priceError) {
      setError(priceError)
      return
    }

    const priceNumber = parseDecimalInput(editPrice)
    const discountNumber = parseDecimalInput(editDiscount)
    if (!Number.isFinite(discountNumber) || discountNumber < 0 || discountNumber > 100) {
      setError("El descuento debe estar entre 0 y 100.")
      return
    }

    setSaving(true)
    if (editItem.localOptimistic) {
      const discount = discountNumber / 100
      dispatch(editarPublicacionLocal({
        skinId: editItem.id,
        changes: {
          price: priceNumber,
          discount,
          finalPrice: priceNumber - (priceNumber * discount),
          vendible: true,
          intercambiable: false,
        },
      }))
      dispatch(mostrarNotificacion("Publicación actualizada correctamente."))
      setEditItem(null)
      setSaving(false)
      return
    }

    const action = await dispatch(editarPublicacion({
      skinId: editItem.id,
      price: priceNumber,
      discount: discountNumber / 100,
      vendible: true,
      intercambiable: false,
    }))

    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      setSaving(false)
      return
    }

    dispatch(mostrarNotificacion("Publicación actualizada correctamente."))
    setEditItem(null)
    setSaving(false)
  }

  const renderAcciones = (skin) => {
    const disabled = actionId === skin.id
    const estado = getEstadoPublicacion(skin)

    if (estado === "PAUSADA") {
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
            className="pub-btn pub-btn-play"
            disabled={disabled}
            onClick={() => handleActivar(skin)}
          >
            <FaPlay /> {disabled ? "..." : "Activar"}
          </button>
          <button
            type="button"
            className="pub-btn pub-btn-danger"
            disabled={disabled}
            onClick={() => handleDespublicar(skin)}
          >
            <FaTrash /> {disabled ? "..." : "Retirar"}
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
          onClick={() => handlePausar(skin)}
        >
          <FaPause /> {disabled ? "..." : "Pausar"}
        </button>

        <button
          type="button"
          className="pub-btn pub-btn-danger"
          disabled={disabled}
          onClick={() => handleDespublicar(skin)}
        >
          <FaTrash /> {disabled ? "..." : "Retirar"}
        </button>
      </div>
    )
  }

  const handleRetomarPago = (orden) => {
    dispatch(retomarCheckoutPendiente({
      order: orden,
      email: currentUser.email,
    }))
    navigate("/checkout")
  }

  const handleCancelarPagoPendiente = async (orden) => {
    setError("")

    const confirmed = window.confirm(
      `¿Cancelar la reserva de la orden #${orden.id}? La skin vuelve a estar publicada para otros compradores.`,
    )
    if (!confirmed) return

    setPendingActionId(orden.id)
    const action = await dispatch(cancelarPagoPendiente(orden.id))
    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
      setPendingActionId(null)
      return
    }

    dispatch(resetCheckout())
    dispatch(mostrarNotificacion("Pago pendiente cancelado. La publicación volvió al catálogo."))
    setPendingActionId(null)
  }

  const renderCompraCard = (orden, pagoPendiente = false) => {
    const pendingBusy = pendingActionId === orden.id

    return orden.orderDetailResponses?.map((item) => (
      <article
        className={`pub-card${pagoPendiente ? " pub-card-payment-pending" : ""}`}
        key={`${orden.id}-${item.skinId}`}
      >
        <div className="pub-image-wrap">
          {item.imageUrl && <img src={item.imageUrl} alt={item.skinName} />}
          <span className={`pub-badge ${pagoPendiente ? "badge-pago-pendiente" : "badge-comprada"}`}>
            {pagoPendiente ? "Pago pendiente" : "Comprada"}
          </span>
        </div>
        <div className="pub-card-body">
          <h2>{limpiarNombreSkin(item.skinName ?? "")}</h2>
          <strong>{formatPrice(item.unitPrice ?? 0)}</strong>
          <p className="pub-exterior" style={{ marginTop: 4, fontSize: "0.8rem", color: "#b9b9c6" }}>
            Orden #{orden.id}
          </p>
          <div className="pub-trade-state">
            <span>{pagoPendiente ? "Estado del pago" : "Estado del intercambio"}</span>
            <strong>
              {pagoPendiente
                ? "Mercado Pago está revisando la operación"
                : getTradeStatusLabel(orden.tradeStatus)}
            </strong>
            {pagoPendiente && (
              <small>La publicación permanece reservada hasta que pagues o canceles la reserva.</small>
            )}
          </div>
        </div>

        {pagoPendiente && (
          <div className="pub-actions pub-pending-actions">
            <button
              type="button"
              className="pub-btn pub-btn-edit"
              disabled={pendingBusy}
              onClick={() => handleRetomarPago(orden)}
            >
              <FaCreditCard /> Pagar ahora
            </button>
            <button
              type="button"
              className="pub-btn pub-btn-danger"
              disabled={pendingBusy}
              onClick={() => handleCancelarPagoPendiente(orden)}
            >
              <FaTrash /> {pendingBusy ? "Cancelando..." : "Cancelar reserva"}
            </button>
          </div>
        )}
      </article>
    ))
  }

  const renderCard = (skin, conAcciones) => {
    const precioFinal = skin.finalPrice ?? skin.price
    const tieneDescuento = (skin.discount ?? 0) > 0
    const estado = getEstadoPublicacion(skin)
    const sale = salesNotifications.find((item) => item.skinId === skin.id)

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
              <span className="pub-old-price">{formatPrice(skin.price)}</span>
            )}
            <strong>{formatPrice(precioFinal)}</strong>
          </div>

          {["RESERVADA", "VENDIDA"].includes(estado) && (
            <div className="pub-trade-state">
              <span>Estado del intercambio</span>
              <strong>
                {sale
                  ? getTradeStatusLabel(sale.tradeStatus)
                  : estado === "RESERVADA"
                    ? "Esperando confirmación del pago"
                    : "Intercambio completado"}
              </strong>
              {sale && <small>Orden #{sale.orderId}</small>}
            </div>
          )}
        </div>

        {conAcciones && renderAcciones(skin)}
      </article>
    )
  }

  return (
    <main className="pub-page">
      <header className="pub-header">
        <h1>Mis publicaciones</h1>
        <p>Gestioná precio y estado de las skins que pusiste a la venta.</p>
      </header>

      {(error || reduxError) && <p className="pub-error">{error || reduxError}</p>}
      {operationsError && <p className="pub-error">{operationsError}</p>}
      {loading && <p className="pub-message">Cargando publicaciones...</p>}

      {!loading && (
        <>
          <section className="pub-section">
            <h2>Activas ({activas.length})</h2>
            {activas.length === 0 ? (
              <p className="pub-message">Todavía no tenés publicaciones activas.</p>
            ) : (
              <div className="pub-grid">
                {activas.map((skin) => renderCard(skin, true))}
              </div>
            )}
          </section>

          <section className="pub-section">
            <h2>Pausadas ({pausadas.length})</h2>
            {pausadas.length === 0 ? (
              <p className="pub-message">No tenés publicaciones pausadas.</p>
            ) : (
              <div className="pub-grid">
                {pausadas.map((skin) => renderCard(skin, true))}
              </div>
            )}
          </section>

          <section className="pub-section">
            <h2>
              Pagos pendientes ({pagosPendientes.reduce(
                (acc, order) => acc + (order.orderDetailResponses?.length ?? 0),
                0,
              )})
            </h2>
            {pagosPendientes.length === 0 ? (
              <p className="pub-message">No tenés pagos pendientes.</p>
            ) : (
              <div className="pub-grid">
                {pagosPendientes.map((orden) => renderCompraCard(orden, true))}
              </div>
            )}
          </section>

          <details className="pub-activity">
            <summary>Actividad anterior ({activityCount})</summary>

            <section className="pub-section">
              <h2>Mis compras ({compras.reduce((acc, o) => acc + (o.orderDetailResponses?.length ?? 0), 0)})</h2>
              {compras.length === 0 ? (
                <p className="pub-message">Todavía no compraste ninguna skin.</p>
              ) : (
                <div className="pub-grid">
                  {compras.map((orden) => renderCompraCard(orden))}
                </div>
              )}
            </section>

            <ExchangeOperationsSection
              operations={intercambios}
              loading={operationsStatus === "loading"}
              onRefresh={() => dispatch(fetchMisOperaciones({ force: true }))}
            />

            <section className="pub-section">
              <h2>Historial ({historial.length})</h2>
              {historial.length === 0 ? (
                <p className="pub-message">Todavía no tenés publicaciones vendidas o reservadas.</p>
              ) : (
                <div className="pub-grid">
                  {historial.map((skin) => renderCard(skin, false))}
                </div>
              )}
            </section>
          </details>
        </>
      )}

      {editItem && (
        <div className="pub-modal-backdrop" role="presentation">
          <form className="pub-modal" onSubmit={handleEditSubmit}>
            <button type="button" className="pub-modal-close" onClick={closeEdit}>
              <FaTimes />
            </button>

            <h2>Editar publicación</h2>
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

            <label>
              Descuento (%)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={editDiscount}
                onChange={(e) => setEditDiscount(e.target.value)}
              />
            </label>

            <p className="pub-modal-hint">
              Precio final: {formatPrice((parseDecimalInput(editPrice) || 0) * (1 - ((parseDecimalInput(editDiscount) || 0) / 100)))}
            </p>

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
