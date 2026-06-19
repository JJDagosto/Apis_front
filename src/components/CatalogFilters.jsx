import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  setCatalogFilter,
  setCatalogPriceFilter,
  toggleCatalogBoolFilter,
} from "../Redux/catalogoSlice"
import BooleanFilterList from "./catalogo/BooleanFilterList.jsx"
import FilterOptionList from "./catalogo/FilterOptionList.jsx"
import {
  categoryFilters,
  exteriorFilters,
  rarityFilters,
} from "./catalogo/catalogFilterOptions"
import PriceMinMax from "./PriceMinMax"

function CatalogFilters() {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)

  return (
    <div className="d-flex flex-column align-items-start catalog-filters">
      <BooleanFilterList
        title="Disponibilidad"
        filters={filters}
        options={[
          { label: "Intercambiable", value: "intercambiable" },
          { label: "Vendible", value: "vendible" },
        ]}
        onToggle={(filterName) => dispatch(toggleCatalogBoolFilter(filterName))}
      />

      <FilterOptionList
        title="Float"
        filterName="exterior"
        filters={filters}
        options={exteriorFilters.map((value) => ({ label: value, value }))}
        onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
      />

      <FilterOptionList
        title="Rarity"
        filterName="rareza"
        filters={filters}
        options={rarityFilters.map((value) => ({ label: value, value }))}
        onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
      />

      <FilterOptionList
        title="Type"
        filterName="categoria"
        filters={filters}
        options={categoryFilters}
        onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
      />

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
    </div>
  )
}

export default CatalogFilters
