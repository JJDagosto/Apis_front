import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  setCatalogFilter,
} from "../../../Redux/catalogoSlice"
import { rarityFilters } from "../catalogFilterOptions"
import FilterOptionList from "../FilterOptionList.jsx"

function RarezaFilter() {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)

  return (
    <FilterOptionList
      title="Rarity"
      filterName="rareza"
      filters={filters}
      options={rarityFilters.map((value) => ({ label: value, value }))}
      onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
    />
  )
}

export default RarezaFilter
