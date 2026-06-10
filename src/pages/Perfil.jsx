import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateCurrentUser } from "../Redux/authSlice"
import { isValidSteamTradeUrl } from "../utils/tradeProfile"
import "./Perfil.css"

const emptyProfile = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  steamId64: "",
  tradeUrl: "",
  aliasCobro: "",
  password: "",
}

function Perfil({ goToLogin }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
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
      aliasCobro: currentUser.aliasCobro ?? currentUser.aliasMercadoPago ?? "",
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

    if (form.tradeUrl.trim() && !isValidSteamTradeUrl(form.tradeUrl)) {
      setError("Steam Trade URL debe ser un link valido de Steam con partner y token.")
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
        aliasCobro: form.aliasCobro.trim(),
      }

      if (form.password.trim()) {
        payload.password = form.password
      }

      await dispatch(updateCurrentUser(payload)).unwrap()
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

            <div className="trade-url-guide">
              <h3>Instructivo para conseguir tu Steam Trade URL</h3>
              <p>
                Para poder vender, comprar o intercambiar skins dentro de la plataforma, necesitas cargar tu Steam Trade URL. Este enlace permite que nuestro bot pueda enviarte una oferta de intercambio de forma segura.
              </p>

              <ol>
                <li>
                  <strong>Entra a Steam.</strong>
                  <span> Ingresa a tu cuenta desde Steam o desde el navegador: </span>
                  <a href="https://steamcommunity.com" target="_blank" rel="noreferrer">
                    https://steamcommunity.com
                  </a>
                </li>
                <li>
                  <strong>Abri tu inventario.</strong>
                  <span> Una vez dentro de tu cuenta, entra a Perfil y despues Inventario.</span>
                </li>
                <li>
                  <strong>Entra a Ofertas de intercambio.</strong>
                  <span> Dentro del inventario, busca Ofertas de intercambio o Trade Offers.</span>
                </li>
                <li>
                  <strong>Entra a Quien puede enviarme ofertas.</strong>
                  <span> En Trade Offers, selecciona Quien puede enviarme ofertas de intercambio o Who can send me Trade Offers?</span>
                </li>
                <li>
                  <strong>Copia tu Trade URL.</strong>
                  <span> Baja hasta la seccion de sitios de terceros y copia el enlace completo.</span>
                </li>
              </ol>

              <div className="trade-url-example">
                <span>Ejemplo correcto</span>
                <code>https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcDEF</code>
              </div>

              <p>
                Tenes que pegar el enlace completo, incluyendo <strong>partner</strong> y <strong>token</strong>. Steam usa esta URL para que otras personas o servicios puedan enviarte ofertas de intercambio, incluso sin estar en tu lista de amigos.
              </p>
            </div>
          </div>

          <div className="steam-section">
            <h2>Cobros</h2>
            <p>
              Alias de CBU, CVU o billetera virtual donde queres recibir el dinero cuando vendas una skin.
              Lo podes cambiar cuando quieras. Cuando el marketplace opere con pagos reales, se usara este dato para gestionar la transferencia.
            </p>

            <div className="profile-grid">
              <label>
                Alias de cobro
                <input
                  type="text"
                  value={form.aliasCobro}
                  onChange={(event) => updateField("aliasCobro", event.target.value)}
                  placeholder="tu.alias.cbu"
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
