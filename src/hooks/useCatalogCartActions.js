import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { agregarAlCarrito, eliminarItemCarrito } from "../Redux/carritoSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { actionErrorMessage, isRejectedAction } from "../utils/reduxResult"
import { getTradeUrlIssue } from "../utils/tradeProfile"

export const useCatalogCartActions = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []
  const myPublications = useSelector((state) => state.publicaciones.items)
  const [error, setError] = useState("")
  const [addingSkinId, setAddingSkinId] = useState(null)

  const getCartItemBySkinId = (skinId) => {
    return cartItems.find((item) => item.skin?.id === skinId)
  }

  const isOwnPublication = (skinId) => {
    return myPublications.some((publication) => publication.id === skinId)
  }

  const handleCartClick = async (skinId) => {
    setError("")

    if (!currentUser) {
      navigate("/login")
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil antes de agregar skins al carrito.`)
      dispatch(mostrarNotificacion(
        "Completa tu perfil antes de agregar skins al carrito.",
        "error",
      ))
      navigate("/perfil")
      return
    }

    const cartItem = getCartItemBySkinId(skinId)
    setAddingSkinId(skinId)

    const action = cartItem
      ? await dispatch(eliminarItemCarrito(cartItem.id))
      : await dispatch(agregarAlCarrito(skinId))

    if (isRejectedAction(action)) {
      const message = actionErrorMessage(action)
      setError(message)
      dispatch(mostrarNotificacion(message, "error"))
    } else if (cartItem) {
      dispatch(mostrarNotificacion("Item eliminado del carrito."))
    } else {
      dispatch(mostrarNotificacion("Item agregado al carrito con exito."))
    }

    setAddingSkinId(null)
  }

  return {
    error,
    addingSkinId,
    getCartItemBySkinId,
    isOwnPublication,
    handleCartClick,
  }
}
