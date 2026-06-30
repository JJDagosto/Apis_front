import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  setCatalogPriceFilter,
} from "../../../Redux/catalogoSlice"
import PriceMinMax from "../../PriceMinMax"

function PrecioFilter() {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)

  return (
    <PriceMinMax
      precioMin={filters.precioMin}
      precioMax={filters.precioMax}
      setPrecioMin={(value) => dispatch(setCatalogPriceFilter({
        filterName: "precioMin",
        value,
      }))}
      setPrecioMax={(value) => dispatch(setCatalogPriceFilter({
        filterName: "precioMax",
        value,
      }))}
    />
  )
}

export default PrecioFilter
