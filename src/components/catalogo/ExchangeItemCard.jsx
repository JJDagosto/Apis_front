import { FaBan, FaCheck, FaPlus } from "react-icons/fa"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"

function ExchangeItemCard({
  image,
  title,
  weapon,
  exterior,
  price,
  status,
  selected,
  disabled = false,
  unavailableLabel,
  onSelect,
}) {
  const { formatPrice } = useCurrencyFormatter()

  return (
    <button
      type="button"
      className={`exchange-item-card ${selected ? "selected" : ""} ${disabled ? "unavailable" : ""}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="exchange-item-check">
        {disabled ? <FaBan /> : selected ? <FaCheck /> : <FaPlus />}
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
          {formatPrice(price)}
        </span>
      )}
      {disabled && unavailableLabel && (
        <span className="exchange-item-unavailable">{unavailableLabel}</span>
      )}
    </button>
  )
}

export default ExchangeItemCard
