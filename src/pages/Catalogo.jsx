import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { agregarAlCarrito, eliminarItemCarrito } from "../Redux/carritoSlice"
import { resetCheckout } from "../Redux/checkoutSlice"
import CatalogFilters from "../components/CatalogFilters.jsx"
import Card from "../components/Card.jsx"
import { getTradeUrlIssue } from "../utils/tradeProfile"
import "./Catalogo.css"

function Catalogo({
  openPublicacion,
  goToLogin,
  goToPerfil,
  searchTerm = "",
  onClearSearch,
}) {
  const dispatch = useDispatch()
  const { items: allSkins, loading, error: catalogError } = useSelector(
    (state) => state.catalogo,
  )
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []
  const myPublications = useSelector((state) => state.publicaciones.items)
  const [error, setError] = useState("")
  const [cartMessage, setCartMessage] = useState("")
  const [addingSkinId, setAddingSkinId] = useState(null)
  const [filters, setFilters] = useState({
    exterior: "",
    rareza: "",
    categoria: "",
    precioMin: "",
    precioMax: "",
    intercambiable: false,
    vendible: false,
  })
  const [orden, setOrden] = useState("")

  const limpiarNombreSkin = (nombre = "") => {
    return nombre
      .replace(/^.*\|\s*/, "")
      .replace(/\s*\([^)]*\)$/, "")
  }

  const setFilter = (filterName, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: currentFilters[filterName] === value ? "" : value,
    }))
  }

  const setPriceFilter = (filterName, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }))
  }

  const toggleBoolFilter = (filterName) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: !currentFilters[filterName],
    }))
  }

  const getCartItemBySkinId = (skinId) => {
    return cartItems.find((item) => item.skin?.id === skinId)
  }

  const isOwnPublication = (skinId) => {
    return myPublications.some((publication) => publication.id === skinId)
  }

  const handleCartClick = async (skinId) => {
    setError("")
    setCartMessage("")

    if (!currentUser) {
      goToLogin()
      return
    }

    const tradeUrlIssue = getTradeUrlIssue(currentUser, "comprar")
    if (tradeUrlIssue) {
      setError(`${tradeUrlIssue} Completa tu perfil antes de agregar skins al carrito.`)
      goToPerfil?.()
      return
    }

    const cartItem = getCartItemBySkinId(skinId)
    setAddingSkinId(skinId)

    try {
      if (cartItem) {
        await dispatch(eliminarItemCarrito(cartItem.id)).unwrap()
        setCartMessage("Skin removida del carrito.")
      } else {
        await dispatch(agregarAlCarrito(skinId)).unwrap()
        setCartMessage("Skin agregada al carrito.")
      }

      dispatch(resetCheckout())
    } catch (error) {
      setError(error.message)
    } finally {
      setAddingSkinId(null)
    }
  }

  const skinsFiltradas = allSkins.filter((skin) => {
    const termino = (searchTerm ?? "").trim().toLowerCase()
    const cumpleBusqueda =
      termino === "" ||
      (skin.name ?? "").toLowerCase().includes(termino) ||
      (skin.catalogo?.weaponName ?? "").toLowerCase().includes(termino)

    const cumpleExterior =
      !filters.exterior || skin.catalogo?.exteriorName === filters.exterior

    const cumpleRareza =
      !filters.rareza || skin.catalogo?.rarezaName === filters.rareza

    const cumpleCategoria =
      !filters.categoria || skin.catalogo?.categoryName === filters.categoria

    const cumplePrecioMin =
      filters.precioMin === "" || skin.price >= Number(filters.precioMin)

    const cumplePrecioMax =
      filters.precioMax === "" || skin.price <= Number(filters.precioMax)

    const cumpleIntercambiable =
      !filters.intercambiable || skin.intercambiable === true

    const cumpleVendible =
      !filters.vendible || skin.vendible === true

    return skin.active !== false && (
      cumpleBusqueda &&
      cumpleExterior &&
      cumpleRareza &&
      cumpleCategoria &&
      cumplePrecioMin &&
      cumplePrecioMax &&
      cumpleIntercambiable &&
      cumpleVendible
    )
  })

  const displayError = error || catalogError

  const skinsOrdenadas = skinsFiltradas.slice().sort((a, b) => {
    switch (orden) {
      case "precio_asc":
        return (a.price ?? 0) - (b.price ?? 0)
      case "precio_desc":
        return (b.price ?? 0) - (a.price ?? 0)
      case "nombre_az":
        return limpiarNombreSkin(a.name).localeCompare(limpiarNombreSkin(b.name))
      case "nombre_za":
        return limpiarNombreSkin(b.name).localeCompare(limpiarNombreSkin(a.name))
      default:
        return 0
    }
  })

  return (
    <div className="catalogo mt-4">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3">
            <CatalogFilters
              filters={filters}
              setFilter={setFilter}
              setPriceFilter={setPriceFilter}
              toggleBoolFilter={toggleBoolFilter}
              orden={orden}
              setOrden={setOrden}
            />
          </div>

          <div className="col-sm-9">
            {searchTerm?.trim() && (
              <p className="catalog-success">
                Resultados para «{searchTerm}»{" "}
                <button
                  type="button"
                  onClick={onClearSearch}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ffca2c",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  limpiar
                </button>
              </p>
            )}
            {cartMessage && <p className="catalog-success">{cartMessage}</p>}
            <div className="d-flex overflow-auto gap-3 flex-wrap justify-content-start">
              {loading && <p className="catalog-message">Cargando catalogo...</p>}

              {!loading && displayError && <p className="catalog-message">{displayError}</p>}

              {!loading && !displayError && skinsOrdenadas.length === 0 && (
                <p className="catalog-message">No se encontraron resultados.</p>
              )}

              {!loading &&
                !displayError &&
                skinsOrdenadas.map((skin) => (
                  <Card
                    key={skin.id}
                    nombreSkin={limpiarNombreSkin(skin.name)}
                    id={skin.id}
                    arma={skin.catalogo?.weaponName}
                    estado={skin.catalogo?.exteriorName ?? skin.exterior}
                    precio={skin.price}
                    imagen={skin.imageUrl}
                    onClick={() => openPublicacion(skin.id)}
                    addToCart={() => handleCartClick(skin.id)}
                    addingToCart={addingSkinId === skin.id}
                    inCart={Boolean(getCartItemBySkinId(skin.id))}
                    isOwnPublication={isOwnPublication(skin.id)}
                    onManage={() => openPublicacion(skin.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalogo
