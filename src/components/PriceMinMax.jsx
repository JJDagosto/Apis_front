import "./PriceMinMax.css"

const PriceMinMax = ({ precioMin, setPrecioMin, precioMax, setPrecioMax }) => {
  return (
    <div className="price-filter">
      <h6>Precio</h6>
      <div className="price-filter-row">
        <label>
          <span>Min.</span>
          <input
            type="number"
            placeholder="$0.00"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
          />
        </label>
        <label>
          <span>Max.</span>
          <input
            type="number"
            placeholder="$0.00"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default PriceMinMax
