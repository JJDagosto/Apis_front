import { FaCheck } from "react-icons/fa"
import FilterGroup from "./FilterGroup.jsx"

function FilterOptionList({ title, filterName, filters, options, onSelect }) {
  const filterClass = (value) =>
    filters[filterName] === value ? "filter-item active" : "filter-item"
  const activeCount = filters[filterName] ? 1 : 0

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
              {filters[filterName] === option.value && <FaCheck aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </FilterGroup>
  )
}

export default FilterOptionList
