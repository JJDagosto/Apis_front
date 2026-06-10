import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, resendVerificationEmail } from "../Redux/authSlice"
import "./Login.css"

function Login({ goToCatalogo, goToRegister, goToForgot }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.loading)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    try {
      await dispatch(loginUser({ email, password })).unwrap()
      goToCatalogo()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleResendVerification = async () => {
    setError("")
    setMessage("")
    if (!email.trim()) {
      setError("Ingresa tu email para reenviar la verificacion.")
      return
    }

    try {
      const msg = await dispatch(resendVerificationEmail(email.trim())).unwrap()
      setMessage(msg || "Si tu cuenta esta pendiente, reenviamos el link.")
    } catch (error) {
      setError(error.message)
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
