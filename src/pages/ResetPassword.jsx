import { useState } from "react"
import { useDispatch } from "react-redux"
import { resetUserPassword } from "../Redux/authSlice"
import "./Login.css"

function ResetPassword({ token, goToLogin }) {
  const dispatch = useDispatch()
  const [password, setPassword] = useState("")
  const [passwordRepeat, setPasswordRepeat] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  // Si se entro a esta pantalla sin token (link mal copiado, etc.), no tiene sentido seguir.
  if (!token) {
    return (
      <main className="login-page">
        <div className="login-form">
          <h1>Link invalido</h1>
          <p style={{ color: "#b9b9c6" }}>
            El link no tiene un token valido. Pedi de nuevo el mail de recuperacion.
          </p>
          <button className="login-secondary" type="button" onClick={goToLogin}>
            Volver al login
          </button>
        </div>
      </main>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    // Validacion espejo: el back tambien chequea que coincidan.
    if (password !== passwordRepeat) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    try {
      await dispatch(resetUserPassword({ token, password, passwordRepeat })).unwrap()
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main className="login-page">
        <div className="login-form">
          <h1>Listo</h1>
          <p style={{ color: "#3bd17f" }}>
            Tu contraseña se actualizo correctamente. Ya podes iniciar sesion.
          </p>
          <button type="button" onClick={goToLogin}>
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

        <label>
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Repetir contraseña
          <input
            type="password"
            value={passwordRepeat}
            onChange={(event) => setPasswordRepeat(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>

        <button className="login-secondary" type="button" onClick={goToLogin}>
          Volver al login
        </button>
      </form>
    </main>
  )
}

export default ResetPassword
