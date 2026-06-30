import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { agregarAlCarrito, eliminarItemCarrito } from "../Redux/carritoSlice"
import { mostrarNotificacion } from "../Redux/notificacionesSlice"
import { getTradeUrlIssue } from "../utils/tradeProfile"

export const useCatalogCartActions = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const { data: carrito, updating, error: cartError } = useSelector((state) => state.carrito)
  const cartItems = carrito?.items ?? []
  const myPublications = useSelector((state) => state.publicaciones.items)
  const [error, setError] = useState("")
  const [addingSkinId, setAddingSkinId] = useState(null)

  useEffect(() => {
    if (!updating) {
      setAddingSkinId(null)
    }
  }, [updating])

  const getCartItemBySkinId = (skinId) => {
    return cartItems.find((item) => item.skin?.id === skinId)
  }

  const isOwnPublication = (skinId) => {
    return myPublications.some((publication) => publication.id === skinId)
  }

  const handleCartClick = (skinId) => {
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

    dispatch(cartItem ? eliminarItemCarrito(cartItem.id) : agregarAlCarrito(skinId))
  }

  return {
    error: error || cartError,
    addingSkinId,
    getCartItemBySkinId,
    isOwnPublication,
    handleCartClick,
  }
}
