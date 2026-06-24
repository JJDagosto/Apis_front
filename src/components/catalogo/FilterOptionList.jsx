import { FaCheck } from "react-icons/fa"
import FilterGroup from "./FilterGroup.jsx"

function FilterOptionList({ title, filterName, filters, options, onSelect }) {
  const selectedValues = Array.isArray(filters[filterName])
    ? filters[filterName]
    : filters[filterName]
      ? [filters[filterName]]
      : []
  const filterClass = (value) =>
    selectedValues.includes(value) ? "filter-item active" : "filter-item"
  const activeCount = selectedValues.length

  return (
    <FilterGroup title={title} activeCount={activeCount}>
      <ul className="filter-list">
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              className={filterClass(option.value)}
              onClick={() => onSelect(filterName, option.value)}
            >
              <span>{option.label}</span>
              {selectedValues.includes(option.value) && <FaCheck aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </FilterGroup>
  )
}

export default FilterOptionList
