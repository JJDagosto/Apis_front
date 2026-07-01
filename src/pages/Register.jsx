import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../Redux/authSlice"
import { getRegisterPasswordError, isValidEmail } from "../utils/validations.jsx"
import PasswordInput from "../components/PasswordInput.jsx"
import "./Register.css"

function Register({ goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const { loading, error: authError, message } = useSelector((state) => state.auth)
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordRepeat: "",
  })
  const [error, setError] = useState("")

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")

    if (!isValidEmail(form.email)) {
      setError("Ingresá un email válido.")
      return
    }

    const passwordError = getRegisterPasswordError(form.password, form.passwordRepeat)
    if (passwordError) {
      setError(passwordError)
      return
    }

    dispatch(registerUser({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordRepeat: form.passwordRepeat,
    }))
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

        {(error || authError) && <p className="register-error">{error || authError}</p>}
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
