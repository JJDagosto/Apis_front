import logo from "../images/logo.png"
import { FaShoppingCart } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import SteamLoginButton from "./SteamLoginButton.jsx"
import BalanceWidget from "./BalanceWidget.jsx"
import CurrencySelector from "./CurrencySelector.jsx"
import SalesNotificationBell from "./SalesNotificationBell.jsx"
import "./NavBar.css"

const NavBar = ({ currentUser, onLogout, cartCount = 0 }) => {
  const navigate = useNavigate()
  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <nav className={`custom-navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <Link className="navbar-brand-button" to="/" aria-label="Inicio">
        <div id="logo"><img src={logo} alt="logo" width="92" /></div>
      </Link>

      <ul className="navbar-nav custom-nav-links">
        <li><Link className="nav-link blanco" to="/">Inicio</Link></li>
        <li><Link className="nav-link blanco" to="/catalogo">Market</Link></li>
        <li><Link className="nav-link blanco" to="/intercambiar">Intercambiar</Link></li>
        <li><Link className="nav-link blanco" to={currentUser ? "/vender" : "/login"}>Inventario</Link></li>
        {currentUser && (
          <li><Link className="nav-link blanco" to="/mis-publicaciones">Mis publicaciones</Link></li>
        )}
        {currentUser?.role === "ADMIN" && (
          <li><Link className="nav-link blanco" to="/admin">Panel admin</Link></li>
        )}
        <li><Link className="nav-link blanco" to="/como-funciona">Cómo funciona</Link></li>
        <li><Link className="nav-link blanco" to="/soporte">Soporte</Link></li>
      </ul>

      <div className="nav-actions">
        <button className="nav-icon-button cart-nav-button" type="button" onClick={() => navigate(currentUser ? "/carrito" : "/login")} title="Carrito">
          <FaShoppingCart size={20} className="blanco" />
          {currentUser && cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
        </button>

        {currentUser && <SalesNotificationBell />}
        <CurrencySelector />

        {currentUser ? (
          <div className="nav-user">
            <BalanceWidget currentUser={currentUser} />
            <button
              className="nav-username"
              type="button"
              onClick={() => navigate("/perfil")}
            >
              {currentUser.steamAvatarUrl && (
                <img
                  className="nav-user-avatar"
                  src={currentUser.steamAvatarUrl}
                  alt="Avatar de Steam"
                />
              )}
              {isAdmin && <span className="admin-user-pill">ADMIN</span>}
              <span>{currentUser.steamUsername || currentUser.username}</span>
            </button>
            <button className="btn btn-outline-warning nav-session-button" type="button" onClick={onLogout}>
              Salir
            </button>
          </div>
        ) : (
          <div className="nav-auth-actions">
            <button
              className="btn btn-outline-warning nav-session-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
            <SteamLoginButton
              className="btn btn-warning nav-session-button nav-steam-button"
            />
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar
