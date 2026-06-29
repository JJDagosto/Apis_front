import { useState } from "react"
import { FaSteam } from "react-icons/fa"
import { useDispatch } from "react-redux"
import { fetchSteamLoginUrl } from "../Redux/authSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { actionErrorMessage, isRejectedAction } from "../utils/reduxResult"

function SteamLoginButton({
  className = "",
  label = "Iniciar sesión con Steam",
  disabled = false,
}) {
  const dispatch = useDispatch()
  const [starting, setStarting] = useState(false)

  const handleSteamLogin = async () => {
    setStarting(true)

    const redirectUrl = `${window.location.origin}/login/steam/callback`
    const action = await dispatch(fetchSteamLoginUrl({ redirectUrl }))

    if (isRejectedAction(action)) {
      setStarting(false)
      dispatch(mostrarNotificacion(
        actionErrorMessage(action, "No se pudo iniciar sesión con Steam."),
        "error",
      ))
      return
    }

    window.location.assign(action.payload)
  }

  return (
    <button
      className={className}
      type="button"
      onClick={handleSteamLogin}
      disabled={disabled || starting}
    >
      <FaSteam />
      {starting ? "Conectando con Steam..." : label}
    </button>
  )
}

export default SteamLoginButton
