import { FaTrash } from "react-icons/fa"
import { formatCartPrice } from "../../utils/cartTotals"
import { limpiarNombreSkin } from "../../utils/skinFormat"

function CartList({ items, updating, onRemove }) {
  return (
    <div className="cart-items">
      {items.map((item) => {
        const skin = item.skin

        return (
          <article className="cart-item" key={item.id}>
            <div className="cart-image-wrap">
              <img src={skin.imageUrl} alt={skin.name} />
            </div>

            <div className="cart-item-info">
              <span>{skin.catalogo?.weaponName}</span>
              <h2>{limpiarNombreSkin(skin.name)}</h2>
              <p>{skin.catalogo?.exteriorName ?? skin.exterior}</p>
            </div>

            <div className="cart-price">
              {item.skinDiscountAmount > 0 && (
                <small className="cart-old-price">
                  {formatCartPrice(item.originalLineTotal)}
                </small>
              )}
              <strong>{formatCartPrice(item.finalLineTotal)}</strong>
              {item.quantity > 1 && (
                <small>
                  {item.quantity} x {formatCartPrice(item.finalUnitPrice)}
                </small>
              )}
              {item.discountRate > 0 && (
                <span className="cart-discount-badge">
                  {Math.round(item.discountRate * 100)}% OFF
                </span>
              )}
            </div>

            <button
              className="cart-remove"
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={updating}
            >
              <FaTrash />
            </button>
          </article>
        )
      })}
    </div>
  )
}

export default CartList
