import { FaChevronDown } from "react-icons/fa"

function FilterGroup({ title, activeCount = 0, children }) {
  return (
    <details className="filter-group">
      <summary>
        <span>{title}</span>
        {activeCount > 0 && <em>{activeCount}</em>}
        <FaChevronDown aria-hidden="true" />
      </summary>
      {children}
    </details>
  )
}

export default FilterGroup
