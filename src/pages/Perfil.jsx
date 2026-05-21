import { useEffect, useState } from "react"
import { updateCurrentUser } from "../api/auth"
import "./Perfil.css"

const emptyProfile = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  steamId64: "",
  tradeUrl: "",
  password: "",
}

function Perfil({ currentUser, onProfileUpdated, goToLogin }) {
  const [form, setForm] = useState(emptyProfile)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!currentUser) return

    setForm({
      username: currentUser.username ?? "",
      email: currentUser.email ?? "",
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      steamId64: currentUser.steamId64 ?? "",
      tradeUrl: currentUser.tradeUrl ?? "",
      password: "",
    })
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="profile-page">
        <section className="profile-panel">
          <h1>Mi cuenta</h1>
          <p>Necesitas iniciar sesion para ver tu perfil.</p>
          <button type="button" onClick={goToLogin}>Iniciar sesion</button>
        </section>
      </main>
    )
  }

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess("")
    setError("")

    if (form.steamId64.trim() && !/^\d{17}$/.test(form.steamId64.trim())) {
      setError("SteamID64 debe ser un numero de 17 digitos.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        steamId64: form.steamId64.trim(),
        tradeUrl: form.tradeUrl.trim(),
      }

      if (form.password.trim()) {
        payload.password = form.password
      }

      const updatedUser = await updateCurrentUser(payload)
      onProfileUpdated(updatedUser)
      setForm((currentForm) => ({ ...currentForm, password: "" }))
      setSuccess("Perfil actualizado correctamente.")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <div className="profile-header">
          <h1>Mi cuenta</h1>
          <p>Gestiona tus datos y la conexion con Steam.</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-grid">
            <label>
              Username
              <input
                type="text"
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </label>

            <label>
              Nombre
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                required
              />
            </label>

            <label>
              Apellido
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                required
              />
            </label>

            
          </div>

          <div className="steam-section">
            <h2>Steam</h2>
            <p>
              SteamID64 permite sincronizar el inventario. Trade URL se usara para ofertas de intercambio.
            </p>

            <div className="profile-grid">
              <label>
                SteamID64
                <input
                  type="text"
                  value={form.steamId64}
                  onChange={(event) => updateField("steamId64", event.target.value)}
                  placeholder="7656119..."
                />
              </label>

              <label>
                Trade URL
                <input
                  type="url"
                  value={form.tradeUrl}
                  onChange={(event) => updateField("tradeUrl", event.target.value)}
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                />
              </label>
            </div>
          </div>

          {error && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Perfil