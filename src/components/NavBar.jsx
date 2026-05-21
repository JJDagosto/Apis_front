import logo from "../images/logo.png"
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import "./NavBar.css"

const NavBar = ({ setCurrentPage, currentUser, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg d-flex justify-content-around custom-navbar">
      <a href="#" onClick={() => setCurrentPage("home")}>
        <div id="logo"><img src={logo} alt="logo" width="100" /></div>
      </a>

      <ul className="navbar-nav">
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("home")}>Inicio</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("catalogo")}>Comprar</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage(currentUser ? "inventarioVenta" : "login")}>Vender</a></li>
        <li><a className="nav-link blanco" onClick={() => setCurrentPage("prueba")}>Como funciona</a></li>
        <li><a className="nav-link blanco" href="#">Soporte</a></li>
      </ul>

      <div className="column d-flex justify-content-between align-items-center custom-column">
        <a href="#"><FaSearch size={20} className="blanco" /></a>
        <button className="nav-icon-button" type="button" onClick={() => setCurrentPage(currentUser ? "carrito" : "login")}>
          <FaShoppingCart size={20} className="blanco" />
        </button>

        {currentUser ? (
          <div className="nav-user">
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