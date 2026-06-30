import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { requestPasswordReset } from "../../Redux/authSlice"
import "../../pages/Login.css"

function ForgotPassword({ goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const { loading, error: authError, message } = useSelector((state) => state.auth)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")
    dispatch(requestPasswordReset(email))
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Recuperar contraseña</h1>
        <p style={{ margin: 0, color: "#b9b9c6" }}>
          Ingresa tu email y te enviaremos un link para crear una nueva contraseña.
        </p>

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

        {(error || authError) && <p className="login-error">{error || authError}</p>}
        {message && <p style={{ color: "#3bd17f", margin: 0 }}>{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </button>

        <button className="login-secondary" type="button" onClick={openLogin}>
          Volver al login
        </button>
      </form>
    </main>
  )
}

export default ForgotPassword
