import { useState } from "react"
import logo from "../images/logo.png"
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import "./NavBar.css"

const NavBar = ({ setCurrentPage, currentUser, onLogout, cartCount = 0, onSearch }) => {
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
  }

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  return (
    <nav className={`custom-navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <button className="navbar-brand-button" type="button" onClick={() => goToPage("home")}>
        <div id="logo"><img src={logo} alt="logo" width="92" /></div>
      </button>

      <ul className="navbar-nav custom-nav-links">
        <li><button type="button" className="nav-link blanco" onClick={() => goToPage("home")}>Inicio</button></li>
        <li><button type="button" className="nav-link blanco" onClick={() => goToPage("catalogo")}>Comprar</button></li>
        <li><button type="button" className="nav-link blanco" onClick={() => goToPage(currentUser ? "inventarioVenta" : "login")}>Vender</button></li>
        {currentUser && (
          <li><button type="button" className="nav-link blanco" onClick={() => goToPage("misPublicaciones")}>Mis publicaciones</button></li>
        )}
        {currentUser?.role === "ADMIN" && (
          <li><button type="button" className="nav-link blanco" onClick={() => goToPage("adminDevTools")}>Panel admin</button></li>
        )}
        <li><button type="button" className="nav-link blanco" onClick={() => goToPage("comoFunciona")}>Como funciona</button></li>
        <li><button type="button" className="nav-link blanco" onClick={() => goToPage("soporte")}>Soporte</button></li>
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

        <button className="nav-icon-button cart-nav-button" type="button" onClick={() => goToPage(currentUser ? "carrito" : "login")} title="Carrito">
          <FaShoppingCart size={20} className="blanco" />
          {currentUser && cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
        </button>

        {currentUser ? (
          <div className="nav-user">
            <span className="nav-saldo blanco">${Number(currentUser.saldo ?? 0).toFixed(2)}</span>
            <button
              className="nav-username"
              type="button"
              onClick={() => goToPage("perfil")}
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
              onClick={() => goToPage("register")}
            >
              Registrarse
            </button>
            <button
              className="btn btn-warning nav-session-button"
              type="button"
              onClick={() => goToPage("login")}
            >
              Iniciar sesion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar
