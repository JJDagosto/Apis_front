import { FaExchangeAlt, FaShoppingBag } from "react-icons/fa"
import { NavLink } from "react-router-dom"

function CatalogModeTabs() {
  return (
    <div className="catalog-mode-tabs" aria-label="Modo de catálogo">
      <NavLink
        className={({ isActive }) => `catalog-mode-tab ${isActive ? "active" : ""}`}
        to="/catalogo"
        end
      >
        <FaShoppingBag /> Skins
      </NavLink>
      <NavLink
        className={({ isActive }) => `catalog-mode-tab ${isActive ? "active" : ""}`}
        to="/intercambiar"
      >
        <FaExchangeAlt /> Intercambiar
      </NavLink>
    </div>
  )
}

export default CatalogModeTabs
