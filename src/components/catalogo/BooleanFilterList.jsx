import { FaCheck } from "react-icons/fa"
import FilterGroup from "./FilterGroup.jsx"

function BooleanFilterList({ title, filters, options, onToggle }) {
  const boolFilterClass = (filterName) =>
    filters[filterName] ? "filter-item active" : "filter-item"
  const activeCount = options.filter((option) => filters[option.value]).length

  return (
    <FilterGroup title={title} activeCount={activeCount}>
      <ul className="filter-list">
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              className={boolFilterClass(option.value)}
              onClick={() => onToggle(option.value)}
            >
              <span>{option.label}</span>
              {filters[option.value] && <FaCheck aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </FilterGroup>
  )
}

export default BooleanFilterList
