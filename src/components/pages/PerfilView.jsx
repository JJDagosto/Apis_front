import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateCurrentUser } from "../../Redux/authSlice"
import { getTradeUrlError } from "../../utils/validations.jsx"
import SteamLoginButton from "../SteamLoginButton.jsx"
import "../../pages/Perfil.css"

const emptyProfile = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  tradeUrl: "",
  aliasCobro: "",
  password: "",
}

function Perfil({ goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const { currentUser, loading, error: authError } = useSelector((state) => state.auth)
  const [form, setForm] = useState(emptyProfile)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!currentUser) return

    setForm({
      username: currentUser.steamUsername ?? currentUser.username ?? "",
      email: currentUser.email ?? "",
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
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
          <p>Necesitás iniciar sesión para ver tu perfil.</p>
          <button type="button" onClick={openLogin}>Iniciar sesión</button>
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

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")

    const tradeUrlError = getTradeUrlError(form.tradeUrl)
    if (tradeUrlError) {
      setError(tradeUrlError)
      return
    }

    const payload = {
      username: currentUser.steamId64
        ? currentUser.username
        : form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      tradeUrl: form.tradeUrl.trim(),
      aliasCobro: form.aliasCobro.trim(),
    }

    if (form.password.trim()) {
      payload.password = form.password
    }

    dispatch(updateCurrentUser(payload))
    setForm((currentForm) => ({ ...currentForm, password: "" }))
  }

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <div className="profile-header">
          <h1>Mi cuenta</h1>
          <p>Gestioná tus datos y la conexión con Steam.</p>
          {currentUser.steamId64 && (
            <div className="steam-profile-summary">
              {currentUser.steamAvatarUrl && (
                <img src={currentUser.steamAvatarUrl} alt="Avatar de Steam" />
              )}
              <div>
                <span>Cuenta de Steam</span>
                <strong>{currentUser.steamUsername || currentUser.username}</strong>
              </div>
            </div>
          )}
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-grid">
            <label>
              Username
              <input
                type="text"
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                disabled={Boolean(currentUser.steamId64)}
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
            {!currentUser.steamId64 && (
              <SteamLoginButton
                className="profile-steam-link"
                label="Vincular cuenta de Steam"
              />
            )}
            <p>
              El login con Steam carga tu cuenta automáticamente. La Trade URL no la expone Steam por OpenID, por eso se carga manualmente.
            </p>

            <div className="profile-grid">
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
                  <strong>Entrá a Steam.</strong>
                  <span> Ingresá a tu cuenta desde Steam o desde el navegador: </span>
                  <a href="https://steamcommunity.com" target="_blank" rel="noreferrer">
                    https://steamcommunity.com
                  </a>
                </li>
                <li>
                  <strong>Abrí tu inventario.</strong>
                  <span> Una vez dentro de tu cuenta, entrá a Perfil y después Inventario.</span>
                </li>
                <li>
                  <strong>Entrá a Ofertas de intercambio.</strong>
                  <span> Dentro del inventario, buscá Ofertas de intercambio o Trade Offers.</span>
                </li>
                <li>
                  <strong>Entrá a Quién puede enviarme ofertas.</strong>
                  <span> En Trade Offers, seleccioná Quién puede enviarme ofertas de intercambio o Who can send me Trade Offers?</span>
                </li>
                <li>
                  <strong>Copia tu Trade URL.</strong>
                  <span> Bajá hasta la sección de sitios de terceros y copiá el enlace completo.</span>
                </li>
              </ol>

              <div className="trade-url-example">
                <span>Ejemplo correcto</span>
                <code>https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcDEF</code>
              </div>

              <p>
                Tenés que pegar el enlace completo, incluyendo <strong>partner</strong> y <strong>token</strong>. Steam usa esta URL para que otras personas o servicios puedan enviarte ofertas de intercambio, incluso sin estar en tu lista de amigos.
              </p>
            </div>
          </div>

          <div className="steam-section">
            <h2>Cobros</h2>
            <p>
              Alias de CBU, CVU o billetera virtual donde querés recibir el dinero cuando vendas una skin.
              Lo podés cambiar cuando quieras. Cuando el marketplace opere con pagos reales, se usará este dato para gestionar la transferencia.
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

          {(error || authError) && <p className="profile-error">{error || authError}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Perfil
