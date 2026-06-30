import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  toggleCatalogBoolFilter,
} from "../../../Redux/catalogoSlice"
import BooleanFilterList from "../BooleanFilterList.jsx"

function DisponibilidadFilter() {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)

  return (
    <BooleanFilterList
      title="Disponibilidad"
      filters={filters}
      options={[
        { label: "Intercambiable", value: "intercambiable" },
        { label: "Vendible", value: "vendible" },
      ]}
      onToggle={(filterName) => dispatch(toggleCatalogBoolFilter(filterName))}
    />
  )
}

export default DisponibilidadFilter
