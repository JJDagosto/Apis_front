import { useMemo } from "react"
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
  exteriorFilters,
  rarityFilters,
} from "./catalogo/catalogFilterOptions"
import PriceMinMax from "./PriceMinMax"

function CatalogFilters({ showAvailability = true }) {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)
  const catalogItems = useSelector((state) => state.catalogo.items)
  const weaponFilters = useMemo(() => (
    Array.from(new Set(
      catalogItems
        .map((skin) => skin.catalogo?.weaponName)
        .filter(Boolean),
    ))
      .sort((a, b) => a.localeCompare(b))
      .map((weapon) => ({ label: weapon, value: weapon }))
  ), [catalogItems])

  return (
    <div className="d-flex flex-column align-items-start catalog-filters">
      {showAvailability && (
        <BooleanFilterList
          title="Disponibilidad"
          filters={filters}
          options={[
            { label: "Intercambiable", value: "intercambiable" },
            { label: "Vendible", value: "vendible" },
          ]}
          onToggle={(filterName) => dispatch(toggleCatalogBoolFilter(filterName))}
        />
      )}

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
        title="Arma"
        filterName="arma"
        filters={filters}
        options={weaponFilters}
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
