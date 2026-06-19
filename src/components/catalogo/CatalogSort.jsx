import { FaChevronDown } from "react-icons/fa"
import { sortOptions } from "./catalogFilterOptions"

function CatalogSort({ value, onChange }) {
  return (
    <label className="catalog-sort-control">
      <span>Ordenar por</span>
      <div className="catalog-sort-select">
        <select
          id="ordenar"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FaChevronDown aria-hidden="true" />
      </div>
    </label>
  )
}

export default CatalogSort
