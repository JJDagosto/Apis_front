import { useEffect, useState } from "react"
import { agregarAlCarrito } from "../api/carrito"
import CatalogFilters from "../components/CatalogFilters.jsx"
import Card from "../components/Card.jsx"
import "./Catalogo.css"

const URL = "http://localhost:4003"

function Catalogo({ openPublicacion, currentUser, goToLogin }) {
  const [allSkins, setAllSkins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartMessage, setCartMessage] = useState("")
  const [addingSkinId, setAddingSkinId] = useState(null)
  const [filters, setFilters] = useState({
    exterior: "",
    rareza: "",
    categoria: "",
    precioMin: "",
    precioMax: "",
  })

  const limpiarNombreSkin = (nombre = "") => {
    return nombre
      .replace(/^.*\|\s*/, "")
      .replace(/\s*\([^)]*\)$/, "")
  }

  useEffect(() => {
    setLoading(true)

    fetch(`${URL}/skins/get/all`)
      .then((res) => res.json())
      .then((json) => setAllSkins(json.data ?? []))
      .catch((error) => {
        console.error(error)
        setError("No se pudo cargar el catalogo.")
      })
      .finally(() => setLoading(false))
  }, [])

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

  const handleAddToCart = async (skinId) => {
    setError("")
    setCartMessage("")

    if (!currentUser) {
      goToLogin()
      return
    }

    setAddingSkinId(skinId)

    try {
      await agregarAlCarrito(skinId, 1)
      setCartMessage("Skin agregada al carrito.")
    } catch (error) {
      setError(error.message)
    } finally {
      setAddingSkinId(null)
    }
  }

  const skinsFiltradas = allSkins.filter((skin) => {
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

    return (
      cumpleExterior &&
      cumpleRareza &&
      cumpleCategoria &&
      cumplePrecioMin &&
      cumplePrecioMax
    )
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
            />
          </div>

          <div className="col-sm-9">
            {cartMessage && <p className="catalog-success">{cartMessage}</p>}
            <div className="d-flex overflow-auto gap-3 flex-wrap justify-content-start">
              {loading && <p className="catalog-message">Cargando catalogo...</p>}

              {!loading && error && <p className="catalog-message">{error}</p>}

              {!loading && !error && skinsFiltradas.length === 0 && (
                <p className="catalog-message">No se encontraron resultados.</p>
              )}

              {!loading &&
                !error &&
                skinsFiltradas.map((skin) => (
                  <Card
                    key={skin.id}
                    nombreSkin={limpiarNombreSkin(skin.name)}
                    id={skin.id}
                    arma={skin.catalogo?.weaponName}
                    estado={skin.catalogo?.exteriorName ?? skin.exterior}
                    precio={skin.price}
                    imagen={skin.imageUrl}
                    onClick={() => openPublicacion(skin.id)}
                    addToCart={() => handleAddToCart(skin.id)}
                    addingToCart={addingSkinId === skin.id}
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