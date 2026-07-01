import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { loginWithSteamToken } from "../Redux/authSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import "./Login.css"

const processedSteamCallbacks = new Set()

function SteamCallbackView() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser, error } = useSelector((state) => state.auth)
  const [message, setMessage] = useState("Conectando con Steam...")

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.tradeUrl ? "/catalogo" : "/perfil", { replace: true })
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (error) {
      setMessage(error)
    }
  }, [error])

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")
    const callbackKey = token ? `token:${token}` : `error:${error ?? "missing-token"}`

    if (processedSteamCallbacks.has(callbackKey)) return
    processedSteamCallbacks.add(callbackKey)

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

    dispatch(loginWithSteamToken(token))
  }, [dispatch, searchParams])

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
