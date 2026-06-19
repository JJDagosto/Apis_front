import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogSortOrder,
  setCatalogSort,
} from "../../Redux/catalogoSlice"
import CatalogSort from "./CatalogSort.jsx"

function CatalogToolbar() {
  const dispatch = useDispatch()
  const sortOrder = useSelector(selectCatalogSortOrder)

  return (
    <div className="catalog-results-toolbar">
      <CatalogSort
        value={sortOrder}
        onChange={(value) => dispatch(setCatalogSort(value))}
      />
    </div>
  )
}

export default CatalogToolbar
