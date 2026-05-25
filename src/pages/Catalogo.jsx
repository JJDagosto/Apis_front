import { useEffect, useState } from "react"
import { agregarAlCarrito } from "../api/carrito"
import CatalogFilters from "../components/CatalogFilters.jsx"
import Card from "../components/Card.jsx"
import "./Catalogo.css"

const URL = "http://localhost:4003"

function Catalogo({ openPublicacion, currentUser, goToLogin, onCartChange, searchTerm = "", onClearSearch }) {
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
    intercambiable: false, // toggle: si true, solo skins intercambiables
    vendible: false,       // toggle: si true, solo skins vendibles
  })
  const [orden, setOrden] = useState("") // "", precio_asc, precio_desc, nombre_az, nombre_za

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

  // Filtros de selección única (string): vuelven a vacío si se clickea el activo.
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

  // Toggle booleano para intercambiable / vendible.
  const toggleBoolFilter = (filterName) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: !currentFilters[filterName],
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
      onCartChange?.() // actualiza el badge del navbar
    } catch (error) {
      setError(error.message)
    } finally {
      setAddingSkinId(null)
    }
  }

  const skinsFiltradas = allSkins.filter((skin) => {
    // Busqueda de la lupita: matchea contra el nombre completo y el arma.
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

    // Si el toggle está activo, exigimos el flag en true. Si está apagado, no filtra.
    const cumpleIntercambiable =
      !filters.intercambiable || skin.intercambiable === true

    const cumpleVendible =
      !filters.vendible || skin.vendible === true

    return (
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

  // Ordenamiento sobre el resultado ya filtrado.
  // Copia con slice() para no mutar el array original de estado.
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
        return 0 // relevancia: mantiene el orden del back
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

              {!loading && error && <p className="catalog-message">{error}</p>}

              {!loading && !error && skinsOrdenadas.length === 0 && (
                <p className="catalog-message">No se encontraron resultados.</p>
              )}

              {!loading &&
                !error &&
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
