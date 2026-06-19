import { useState } from "react"
import logo from "../images/logo.png"
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import SteamLoginButton from "./SteamLoginButton.jsx"
import "./NavBar.css"

const NavBar = ({ currentUser, onLogout, cartCount = 0, onSearch }) => {
  const navigate = useNavigate()
  const [term, setTerm] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const isAdmin = currentUser?.role === "ADMIN"

  const handleSearch = (event) => {
    event.preventDefault()

    if (!searchOpen) {
      setSearchOpen(true)
      return
    }

    onSearch?.(term.trim())
    navigate("/catalogo")
  }

  return (
    <nav className={`custom-navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <Link className="navbar-brand-button" to="/" aria-label="Inicio">
        <div id="logo"><img src={logo} alt="logo" width="92" /></div>
      </Link>

      <ul className="navbar-nav custom-nav-links">
        <li><Link className="nav-link blanco" to="/">Inicio</Link></li>
        <li><Link className="nav-link blanco" to="/catalogo">Skins</Link></li>
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
        <form onSubmit={handleSearch} className={`nav-search ${searchOpen ? "open" : ""}`}>
          {searchOpen && (
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar skin..."
              autoFocus
              onBlur={() => {
                if (!term.trim()) setSearchOpen(false)
              }}
            />
          )}
          <button type="submit" className="nav-icon-button" title="Buscar">
            <FaSearch size={18} className="blanco" />
          </button>
        </form>

        <button className="nav-icon-button cart-nav-button" type="button" onClick={() => navigate(currentUser ? "/carrito" : "/login")} title="Carrito">
          <FaShoppingCart size={20} className="blanco" />
          {currentUser && cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
        </button>

        {currentUser ? (
          <div className="nav-user">
            <span className="nav-saldo blanco">${Number(currentUser.saldo ?? 0).toFixed(2)}</span>
            <button
              className="nav-username"
              type="button"
              onClick={() => navigate("/perfil")}
            >
              {isAdmin && <span className="admin-user-pill">ADMIN</span>}
              {currentUser.username}
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
