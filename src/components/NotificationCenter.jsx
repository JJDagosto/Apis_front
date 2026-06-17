import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa"
import { cerrarNotificacion } from "../Redux/notificacionesSlice"
import "./NotificationCenter.css"

const notificationIcons = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  info: <FaInfoCircle />,
}

function Notification({ notification }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(cerrarNotificacion(notification.id))
    }, notification.duration)

    return () => window.clearTimeout(timer)
  }, [dispatch, notification.duration, notification.id])

  return (
    <article
      className={`app-notification app-notification-${notification.type}`}
      role={notification.type === "error" ? "alert" : "status"}
    >
      <span className="app-notification-icon">
        {notificationIcons[notification.type] ?? notificationIcons.info}
      </span>
      <p>{notification.message}</p>
      <button
        type="button"
        onClick={() => dispatch(cerrarNotificacion(notification.id))}
        aria-label="Cerrar notificacion"
      >
        <FaTimes />
      </button>
    </article>
  )
}

function NotificationCenter() {
  const notifications = useSelector((state) => state.notificaciones.items)

  return (
    <aside
      className="app-notification-center"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </aside>
  )
}

export default NotificationCenter
