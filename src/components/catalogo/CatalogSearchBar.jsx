import { FaSearch, FaTimes } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import {
  clearCatalogSearch,
  selectCatalogSearchTerm,
  setCatalogSearchTerm,
} from "../../Redux/catalogoSlice"

function CatalogSearchBar() {
  const dispatch = useDispatch()
  const searchTerm = useSelector(selectCatalogSearchTerm)

  return (
    <label className="catalog-search-bar">
      <FaSearch aria-hidden="true" />
      <span className="visually-hidden">Buscar en el Market</span>
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => dispatch(setCatalogSearchTerm(event.target.value))}
        placeholder="Buscar por skin o arma..."
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => dispatch(clearCatalogSearch())}
          title="Limpiar búsqueda"
          aria-label="Limpiar búsqueda"
        >
          <FaTimes />
        </button>
      )}
    </label>
  )
}

export default CatalogSearchBar
