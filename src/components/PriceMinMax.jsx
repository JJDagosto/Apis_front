import "./PriceMinMax.css"
import FilterGroup from "./catalogo/FilterGroup.jsx"

const PriceMinMax = ({ precioMin, setPrecioMin, precioMax, setPrecioMax }) => {
  const activeCount = [precioMin, precioMax].filter(Boolean).length

  return (
    <FilterGroup title="Precio" activeCount={activeCount}>
      <div className="price-filter">
        <div className="price-filter-row">
          <label>
            <span>Min.</span>
            <input
              type="number"
              placeholder="$0.00"
              value={precioMin}
              onChange={(event) => setPrecioMin(event.target.value)}
            />
          </label>
          <label>
            <span>Max.</span>
            <input
              type="number"
              placeholder="$0.00"
              value={precioMax}
              onChange={(event) => setPrecioMax(event.target.value)}
            />
          </label>
        </div>
      </div>
    </FilterGroup>
  )
}

export default PriceMinMax
