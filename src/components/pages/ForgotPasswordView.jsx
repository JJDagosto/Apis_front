import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { requestPasswordReset } from "../../Redux/authSlice"
import { actionErrorMessage, isRejectedAction } from "../../utils/reduxResult"
import "../../pages/Login.css"

function ForgotPassword({ goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    // El back responde el mismo mensaje exista o no el email (por privacidad).
    const action = await dispatch(requestPasswordReset(email))
    if (isRejectedAction(action)) {
      setError(actionErrorMessage(action))
      setLoading(false)
      return
    }

    setMessage(action.payload || "Si el email esta registrado, te enviamos un link para cambiar la contraseña.")
    setLoading(false)
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

        {error && <p className="login-error">{error}</p>}
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
