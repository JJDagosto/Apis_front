import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loginUser, resendVerificationEmail } from "../../Redux/authSlice"
import { actionErrorMessage, isRejectedAction } from "../../utils/reduxResult"
import PasswordInput from "../PasswordInput.jsx"
import SteamLoginButton from "../SteamLoginButton.jsx"
import "../../pages/Login.css"

function Login({ goToCatalogo, goToRegister, goToForgot }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector((state) => state.auth.loading)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const openCatalogo = goToCatalogo ?? (() => navigate("/catalogo"))
  const openRegister = goToRegister ?? (() => navigate("/register"))
  const openForgot = goToForgot ?? (() => navigate("/olvidar-contrasena"))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const action = await dispatch(loginUser({ email, password }))
    if (isRejectedAction(action)) {
      setError(actionErrorMessage(action))
      return
    }

    openCatalogo()
  }

  const handleResendVerification = async () => {
    setError("")
    setMessage("")
    if (!email.trim()) {
      setError("Ingresá tu email para reenviar la verificación.")
      return
    }

    const action = await dispatch(resendVerificationEmail(email.trim()))
    if (isRejectedAction(action)) {
      setError(actionErrorMessage(action))
      return
    }

    setMessage(action.payload || "Si tu cuenta está pendiente, reenviamos el link.")
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <SteamLoginButton className="steam-login-button" disabled={loading} />

        <div className="login-divider">
          <span>o entrá con email</span>
        </div>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="login-error">{error}</p>}
        {message && <p className="login-success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button className="login-secondary" type="button" onClick={openForgot}>
          Olvidé mi contraseña
        </button>

        <button className="login-secondary" type="button" onClick={handleResendVerification}>
          Reenviar verificación
        </button>

        <button className="login-secondary" type="button" onClick={openRegister}>
          Crear cuenta
        </button>
      </form>
    </main>
  )
}

export default Login
