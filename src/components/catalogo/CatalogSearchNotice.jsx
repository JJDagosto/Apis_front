import { useDispatch, useSelector } from "react-redux"
import {
  clearCatalogSearch,
  selectCatalogSearchTerm,
} from "../../Redux/catalogoSlice"

function CatalogSearchNotice() {
  const dispatch = useDispatch()
  const searchTerm = useSelector(selectCatalogSearchTerm)

  if (!searchTerm?.trim()) return null

  return (
    <p className="catalog-success">
      Resultados para "{searchTerm}"{" "}
      <button
        type="button"
        className="catalog-clear-search"
        onClick={() => dispatch(clearCatalogSearch())}
      >
        limpiar
      </button>
    </p>
  )
}

export default CatalogSearchNotice
