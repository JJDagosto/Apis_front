import { useState } from "react"
import { FaBell } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { markSalesNotificationsRead } from "../Redux/publicacionesSlice"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter"
import { limpiarNombreSkin } from "../utils/skinFormat"

function SalesNotificationBell() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { formatPrice } = useCurrencyFormatter()
  const [open, setOpen] = useState(false)
  const { salesNotifications, readSaleNotificationIds } = useSelector(
    (state) => state.publicaciones,
  )
  const readIds = new Set(readSaleNotificationIds.map(String))
  const unreadCount = salesNotifications.filter(
    (sale) => !readIds.has(`${sale.orderId}-${sale.skinId}`),
  ).length

  const toggleNotifications = () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      dispatch(markSalesNotificationsRead())
    }
  }

  return (
    <div className="sales-notifications">
      <button
        type="button"
        className="nav-icon-button notification-bell-button"
        onClick={toggleNotifications}
        aria-expanded={open}
        title="Ventas y notificaciones"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="sales-notification-menu">
          <header>
            <strong>Notificaciones</strong>
            <span>{salesNotifications.length} ventas</span>
          </header>

          {salesNotifications.length === 0 ? (
            <p className="sales-notification-empty">Todavía no vendiste ninguna skin.</p>
          ) : (
            <div className="sales-notification-list">
              {salesNotifications.slice(0, 5).map((sale) => (
                <article key={`${sale.orderId}-${sale.skinId}`}>
                  {sale.imageUrl && <img src={sale.imageUrl} alt="" />}
                  <div>
                    <strong>{limpiarNombreSkin(sale.skinName)}</strong>
                    <span>
                      {sale.tradeStatus === "COMPLETED"
                        ? "Venta e intercambio completados"
                        : "Venta confirmada. Entrega pendiente"}
                    </span>
                    <span>{formatPrice(sale.unitPrice)} · Orden #{sale.orderId}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <button
            type="button"
            className="sales-notification-link"
            onClick={() => {
              setOpen(false)
              navigate("/mis-publicaciones")
            }}
          >
            Ver mis publicaciones
          </button>
        </section>
      )}
    </div>
  )
}

export default SalesNotificationBell
