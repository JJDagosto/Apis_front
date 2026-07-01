import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loginUser, resendVerificationEmail } from "../Redux/authSlice"
import PasswordInput from "../components/PasswordInput.jsx"
import SteamLoginButton from "../components/SteamLoginButton.jsx"
import "./Login.css"

function Login({ goToCatalogo, goToRegister, goToForgot }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentUser, loading, error: authError, message } = useSelector((state) => state.auth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const openCatalogo = useCallback(() => {
    if (goToCatalogo) {
      goToCatalogo()
      return
    }

    navigate("/catalogo")
  }, [goToCatalogo, navigate])
  const openRegister = goToRegister ?? (() => navigate("/register"))
  const openForgot = goToForgot ?? (() => navigate("/olvidar-contrasena"))

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")
    dispatch(loginUser({ email, password }))
  }

  const handleResendVerification = () => {
    setError("")
    if (!email.trim()) {
      setError("Ingresá tu email para reenviar la verificación.")
      return
    }

    dispatch(resendVerificationEmail(email.trim()))
  }

  useEffect(() => {
    if (currentUser) {
      openCatalogo()
    }
  }, [currentUser, openCatalogo])

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

        {(error || authError) && <p className="login-error">{error || authError}</p>}
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
