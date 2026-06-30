import { useEffect } from "react"
import { FaSteam } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { fetchSteamLoginUrl } from "../Redux/authSlice"

function SteamLoginButton({
  className = "",
  label = "Iniciar sesión con Steam",
  disabled = false,
}) {
  const dispatch = useDispatch()
  const { loading, steamLoginUrl } = useSelector((state) => state.auth)

  useEffect(() => {
    if (steamLoginUrl) {
      window.location.assign(steamLoginUrl)
    }
  }, [steamLoginUrl])

  const handleSteamLogin = () => {
    const redirectUrl = `${window.location.origin}/login/steam/callback`
    dispatch(fetchSteamLoginUrl({ redirectUrl }))
  }

  return (
    <button
      className={className}
      type="button"
      onClick={handleSteamLogin}
      disabled={disabled || loading}
    >
      <FaSteam />
      {loading ? "Conectando con Steam..." : label}
    </button>
  )
}

export default SteamLoginButton
