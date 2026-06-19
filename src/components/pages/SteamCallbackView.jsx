import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { loginWithSteamToken } from "../../Redux/authSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import "../../pages/Login.css"

function SteamCallbackView() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("Conectando con Steam...")

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      setMessage(error)
      dispatch(mostrarNotificacion(error, "error"))
      return
    }

    if (!token) {
      const missingToken = "Steam no devolvió un token de sesión."
      setMessage(missingToken)
      dispatch(mostrarNotificacion(missingToken, "error"))
      return
    }

    const finishSteamLogin = async () => {
      try {
        const result = await dispatch(loginWithSteamToken(token)).unwrap()
        dispatch(mostrarNotificacion("Sesión iniciada con Steam."))
        navigate(result.user?.tradeUrl ? "/catalogo" : "/perfil", { replace: true })
      } catch (loginError) {
        setMessage(loginError.message)
        dispatch(mostrarNotificacion(loginError.message, "error"))
      }
    }

    finishSteamLogin()
  }, [dispatch, navigate, searchParams])

  return (
    <main className="login-page">
      <section className="login-form">
        <h1>Login con Steam</h1>
        <p>{message}</p>
        {message !== "Conectando con Steam..." && (
          <button className="login-secondary" type="button" onClick={() => navigate("/login")}>
            Volver al login
          </button>
        )}
      </section>
    </main>
  )
}

export default SteamCallbackView
