import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  setCatalogFilter,
} from "../../../Redux/catalogoSlice"
import FilterOptionList from "../FilterOptionList.jsx"

function ArmaFilter() {
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
    <FilterOptionList
      title="Arma"
      filterName="arma"
      filters={filters}
      options={weaponFilters}
      onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
    />
  )
}

export default ArmaFilter
