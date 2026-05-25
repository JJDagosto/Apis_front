import { useState } from "react"
import logo from "../images/logo.png"
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import "./NavBar.css"

const NavBar = ({ setCurrentPage, currentUser, onLogout, cartCount = 0, onSearch }) => {
  const [term, setTerm] = useState("")

  const handleSearch = (event) => {
    event.preventDefault()
    onSearch?.(term.trim()) // navega al catalogo y aplica el filtro por nombre
  }

  return (
    <nav className="navbar navbar-expand-lg d-flex justify-content-around custom-navbar">
      <a href="#" onClick={() => setCurrentPage("home")}>
        <div id="logo"><img src={logo} alt="logo" width="100" /></div>
      </a>

      <ul className="navbar-nav">
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("home")}>Inicio</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("catalogo")}>Comprar</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage(currentUser ? "inventarioVenta" : "login")}>Vender</a></li>
        {currentUser && (
          <li><a className="nav-link blanco" onClick={() => setCurrentPage("misPublicaciones")}>Mis publicaciones</a></li>
        )}
        {currentUser?.role === "ADMIN" && (
          <li><a className="nav-link blanco" onClick={() => setCurrentPage("adminDevTools")}>Admin dev</a></li>
        )}
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("comoFunciona")}>Como funciona</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("soporte")}>Soporte</a></li>
      </ul>

      <div className="column d-flex justify-content-between align-items-center custom-column">
        {/* Lupita: ahora es un buscador real */}
        <form onSubmit={handleSearch} className="d-flex align-items-center" style={{ gap: "6px" }}>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar skin..."
            style={{
              background: "#12072f",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "6px",
              color: "#fff",
              padding: "5px 10px",
              fontSize: "0.85rem",
              width: "140px",
            }}
          />
          <button type="submit" className="nav-icon-button" title="Buscar">
            <FaSearch size={18} className="blanco" />
          </button>
        </form>

        {/* Cartelito carrito: icono con badge de cantidad */}
        <button
          className="nav-icon-button"
          type="button"
          style={{ position: "relative" }}
          onClick={() => setCurrentPage(currentUser ? "carrito" : "login")}
        >
          <FaShoppingCart size={20} className="blanco" />
          {currentUser && cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-8px",
                background: "#ffca2c",
                color: "#0c0524",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        {currentUser ? (
          <div className="nav-user">
            {/* Saldo disponible del usuario */}
            <span className="nav-saldo blanco" style={{ marginRight: "10px", fontSize: "0.85rem" }}>
              Saldo: ${Number(currentUser.saldo ?? 0).toFixed(2)}
            </span>
            <button
              className="nav-username"
              type="button"
              onClick={() => setCurrentPage("perfil")}
            >
              {currentUser.username}
            </button>
            <button className="btn btn-outline-warning" type="button" onClick={onLogout}>
              Salir
            </button>
          </div>
        ) : (
          <div className="nav-auth-actions">
            <button
              className="btn btn-outline-warning"
              type="button"
              onClick={() => setCurrentPage("register")}
            >
              Registrarse
            </button>
            <button
              className="btn btn-warning"
              type="button"
              onClick={() => setCurrentPage("login")}
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
