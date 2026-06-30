import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { resetUserPassword } from "../../Redux/authSlice"
import { getResetPasswordError } from "../../utils/validations.jsx"
import PasswordInput from "../PasswordInput.jsx"
import "../../pages/Login.css"

function ResetPassword({ token, goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const { loading, error: authError, message } = useSelector((state) => state.auth)
  const [password, setPassword] = useState("")
  const [passwordRepeat, setPasswordRepeat] = useState("")
  const [error, setError] = useState("")

  if (!token) {
    return (
      <main className="login-page">
        <div className="login-form">
          <h1>Link inválido</h1>
          <p style={{ color: "#b9b9c6" }}>
            El link no tiene un token válido. Pedí de nuevo el mail de recuperación.
          </p>
          <button className="login-secondary" type="button" onClick={openLogin}>
            Volver al login
          </button>
        </div>
      </main>
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")

    const passwordError = getResetPasswordError(password, passwordRepeat)
    if (passwordError) {
      setError(passwordError)
      return
    }

    dispatch(resetUserPassword({ token, password, passwordRepeat }))
  }

  if (message && !authError) {
    return (
      <main className="login-page">
        <div className="login-form">
          <h1>Listo</h1>
          <p style={{ color: "#3bd17f" }}>
            Tu contraseña se actualizó correctamente. Ya podés iniciar sesión.
          </p>
          <button type="button" onClick={openLogin}>
            Ir al login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Nueva contraseña</h1>

        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Repetir contraseña"
          value={passwordRepeat}
          onChange={(event) => setPasswordRepeat(event.target.value)}
          autoComplete="new-password"
          required
        />

        {(error || authError) && <p className="login-error">{error || authError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>

        <button className="login-secondary" type="button" onClick={openLogin}>
          Volver al login
        </button>
      </form>
    </main>
  )
}

export default ResetPassword
