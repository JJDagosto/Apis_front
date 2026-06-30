import { useDispatch, useSelector } from "react-redux"
import {
  selectCatalogFilters,
  setCatalogFilter,
} from "../../../Redux/catalogoSlice"
import { exteriorFilters } from "../catalogFilterOptions"
import FilterOptionList from "../FilterOptionList.jsx"

function ExteriorFilter() {
  const dispatch = useDispatch()
  const filters = useSelector(selectCatalogFilters)

  return (
    <FilterOptionList
      title="Float"
      filterName="exterior"
      filters={filters}
      options={exteriorFilters.map((value) => ({ label: value, value }))}
      onSelect={(filterName, value) => dispatch(setCatalogFilter({ filterName, value }))}
    />
  )
}

export default ExteriorFilter
