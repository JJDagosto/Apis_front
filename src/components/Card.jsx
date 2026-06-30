import "./Card.css"
import "./Global.css"
import { FaPen, FaShoppingCart } from "react-icons/fa"
import { Link } from "react-router-dom"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter"

const Card = ({
  arma,
  nombreSkin,
  estado,
  precio,
  precioOriginal,
  descuento,
  imagen,
  to,
  addToCart,
  addingToCart,
  inCart = false,
  isOwnPublication = false,
}) => {
  const { formatPrice } = useCurrencyFormatter()
  const discountRate = Number(descuento ?? 0)
  const hasDiscount = discountRate > 0
  const originalPrice = Number(precioOriginal ?? precio)

  const handleActionClick = (event) => {
    if (isOwnPublication) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    addToCart?.()
  }

  return (
    <Link
      className="card align-items-center flex-shrink-0 text-decoration-none"
      to={to}
    >
      <div className="contenedorImagen m-3">
        <img src={imagen} className="card-img-top" alt={nombreSkin} />
      </div>
      <div className="card-body d-flex flex-column align-items-start w-100 mx-5">
        <div id="infoText" className="d-flex flex-column align-items-start align-content-start w-100">
          <h6 className="card-title ">{arma}</h6>
          <span className="m-0" id="nombre">{nombreSkin}</span>
          <span className="text1 m-0">{estado}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center w-100 mt-3">
          <div className="card-price-stack">
            {hasDiscount && (
              <span className="card-old-price">{formatPrice(originalPrice)}</span>
            )}
            <span className="" id="precio">{formatPrice(precio)}</span>
            {hasDiscount && (
              <span className="card-discount-badge">
                {Math.round(discountRate * 100)}% OFF
              </span>
            )}
          </div>
          <button
            type="button"
            className={`btn d-flex align-items-center justify-content-center cart-card-button ${inCart ? "in-cart" : ""} ${isOwnPublication ? "own-publication" : ""}`}
            id="cart"
            disabled={addingToCart}
            onClick={handleActionClick}
            title={
              isOwnPublication
                ? "Administrar publicación"
                : addingToCart
                  ? "Actualizando..."
                  : (inCart ? "Remover del carrito" : "Agregar al carrito")
            }
          >
            {isOwnPublication ? <FaPen /> : <FaShoppingCart />}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default Card

