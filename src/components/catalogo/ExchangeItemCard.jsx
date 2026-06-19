import { FaCheck, FaPlus } from "react-icons/fa"
import { limpiarNombreSkin } from "../../utils/skinFormat"

function ExchangeItemCard({
  image,
  title,
  weapon,
  exterior,
  price,
  status,
  selected,
  disabled = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`exchange-item-card ${selected ? "selected" : ""}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="exchange-item-check">
        {selected ? <FaCheck /> : <FaPlus />}
      </span>
      <span className="exchange-item-image">
        {image && <img src={image} alt={title} />}
      </span>
      <span className="exchange-item-copy">
        <small>{weapon || status || "CS2"}</small>
        <strong>{limpiarNombreSkin(title)}</strong>
        <em>{exterior || status || "Disponible"}</em>
      </span>
      {price != null && (
        <span className="exchange-item-price">
          ${Number(price).toFixed(2)}
        </span>
      )}
    </button>
  )
}

export default ExchangeItemCard
