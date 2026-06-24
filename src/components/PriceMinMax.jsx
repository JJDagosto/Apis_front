import "./PriceMinMax.css"
import FilterGroup from "./catalogo/FilterGroup.jsx"
import { useSelector } from "react-redux"

const PriceMinMax = ({ precioMin, setPrecioMin, precioMax, setPrecioMax }) => {
  const currency = useSelector((state) => state.app.currency)
  const activeCount = [precioMin, precioMax].filter(Boolean).length
  const placeholder = currency === "ARS" ? "ARS 0" : "$0.00"

  return (
    <FilterGroup title="Precio" activeCount={activeCount}>
      <div className="price-filter">
        <div className="price-filter-row">
          <label>
            <span>Min.</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              value={precioMin}
              onChange={(event) => setPrecioMin(event.target.value)}
            />
          </label>
          <label>
            <span>Max.</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
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
