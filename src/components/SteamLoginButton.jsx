import { useState } from "react"
import { FaSteam } from "react-icons/fa"
import { useDispatch } from "react-redux"
import { fetchSteamLoginUrl } from "../Redux/authSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"

function SteamLoginButton({
  className = "",
  label = "Iniciar sesión con Steam",
  disabled = false,
}) {
  const dispatch = useDispatch()
  const [starting, setStarting] = useState(false)

  const handleSteamLogin = async () => {
    setStarting(true)

    try {
      const redirectUrl = `${window.location.origin}/login/steam/callback`
      const loginUrl = await dispatch(fetchSteamLoginUrl({ redirectUrl })).unwrap()
      window.location.assign(loginUrl)
    } catch (error) {
      setStarting(false)
      dispatch(mostrarNotificacion(
        error.message || "No se pudo iniciar sesión con Steam.",
        "error",
      ))
    }
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
