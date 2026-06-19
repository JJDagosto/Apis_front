import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../../Redux/authSlice"
import { getRegisterPasswordError, isValidEmail } from "../../utils/validations.jsx"
import PasswordInput from "../PasswordInput.jsx"
import "../../pages/Register.css"

function Register({ goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordRepeat: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!isValidEmail(form.email)) {
      setError("Ingresá un email válido.")
      return
    }

    const passwordError = getRegisterPasswordError(form.password, form.passwordRepeat)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const msg = await dispatch(registerUser({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordRepeat: form.passwordRepeat,
      })).unwrap()
      setMessage(msg || "Cuenta creada. Verificá tu email antes de iniciar sesión.")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>

        <div className="register-grid">
          <label>
            Usuario
            <input
              type="text"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Nombre
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              autoComplete="given-name"
              required
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              autoComplete="family-name"
              required
            />
          </label>

          <PasswordInput
            label="Contraseña"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            autoComplete="new-password"
            required
          />

          <PasswordInput
            label="Repetir contraseña"
            value={form.passwordRepeat}
            onChange={(event) => updateField("passwordRepeat", event.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p className="register-error">{error}</p>}
        {message && <p className="register-success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button className="register-secondary" type="button" onClick={openLogin}>
          Ya tengo cuenta
        </button>
      </form>
    </main>
  )
}

export default Register
