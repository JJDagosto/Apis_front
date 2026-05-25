import { useState } from "react"
import { register } from "../api/auth"
import "./Register.css"

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const getPasswordError = (password, passwordRepeat) => {
  if (password !== passwordRepeat) return "Las passwords no coinciden."
  if (password.length < 5) return "La password debe tener al menos 5 caracteres."
  if (!/[a-zA-Z]/.test(password)) return "La password debe incluir al menos una letra."
  if (!/\d/.test(password)) return "La password debe incluir al menos un numero."
  return ""
}

function Register({ goToLogin }) {
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
      setError("Ingresa un email valido.")
      return
    }

    const passwordError = getPasswordError(form.password, form.passwordRepeat)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const msg = await register({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordRepeat: form.passwordRepeat,
      })
      setMessage(msg || "Cuenta creada. Verifica tu email antes de iniciar sesion.")
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
            Username
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

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Repetir password
            <input
              type="password"
              value={form.passwordRepeat}
              onChange={(event) => updateField("passwordRepeat", event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {error && <p className="register-error">{error}</p>}
        {message && <p className="register-success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button className="register-secondary" type="button" onClick={goToLogin}>
          Ya tengo cuenta
        </button>
      </form>
    </main>
  )
}

export default Register
