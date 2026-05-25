import { useState } from "react"
import { login, resendVerification } from "../api/auth"
import "./Login.css"

function Login({ onLoginSuccess, goToRegister, goToForgot }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      await login({ email, password })
      await onLoginSuccess()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError("")
    setMessage("")
    if (!email.trim()) {
      setError("Ingresa tu email para reenviar la verificacion.")
      return
    }

    setLoading(true)
    try {
      const msg = await resendVerification(email.trim())
      setMessage(msg || "Si tu cuenta esta pendiente, reenviamos el link.")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesion</h1>

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

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}
        {message && <p className="login-success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button className="login-secondary" type="button" onClick={goToForgot}>
          Olvide mi contraseña
        </button>

        <button className="login-secondary" type="button" onClick={handleResendVerification}>
          Reenviar verificacion
        </button>

        <button className="login-secondary" type="button" onClick={goToRegister}>
          Crear cuenta
        </button>
      </form>
    </main>
  )
}

export default Login
