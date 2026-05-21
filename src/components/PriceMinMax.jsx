import "./PriceMinMax.css"

const PriceMinMax = ({ precioMin, setPrecioMin, precioMax, setPrecioMax }) => {
  return (
    <div className="text-start text-light body">
      <h6>Precio</h6>
      <div className="d-flex flex-row gap-2">
        <div>
          <span>Min.</span>
          <input
            type="number"
            placeholder="$0.00"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
          />
        </div>
        <div>
          <span>Max.</span>
          <input
            type="number"
            placeholder="$0.00"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default PriceMinMax
