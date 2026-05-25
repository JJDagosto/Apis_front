import { useState } from "react"
import { FaPlus, FaSearch } from "react-icons/fa"
import { buscarCatalogo, crearSkinParaUsuario } from "../api/adminDev"
import "./AdminDevTools.css"

const DEFAULT_EMAIL = "user2@mail.com"

function AdminDevTools({ currentUser, goToCatalogo }) {
  const [sellerEmail, setSellerEmail] = useState(DEFAULT_EMAIL)
  const [search, setSearch] = useState("ak-47")
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [price, setPrice] = useState("1000")
  const [quantity, setQuantity] = useState("3")
  const [vendible, setVendible] = useState(true)
  const [intercambiable, setIntercambiable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const isAdmin = currentUser?.role === "ADMIN"

  const handleSearch = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setSelected(null)

    if (!search.trim()) {
      setError("Escribi un nombre para buscar en el catalogo.")
      return
    }

    setLoading(true)
    try {
      const data = await buscarCatalogo(search.trim())
      setResults(data)
      if (data.length === 0) setMessage("No encontramos skins con ese nombre.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!selected) {
      setError("Elegi una skin del catalogo.")
      return
    }

    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 20) {
      setError("La cantidad debe ser un numero entero entre 1 y 20.")
      return
    }
    if (!vendible && !intercambiable) {
      setError("La skin debe ser vendible, intercambiable o ambas.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        catalogoId: selected.id,
        price: parsedPrice,
        discount: 0,
        vendible,
        intercambiable,
      }

      for (let i = 0; i < parsedQuantity; i += 1) {
        await crearSkinParaUsuario(sellerEmail.trim(), payload)
      }

      setMessage(`${parsedQuantity} publicacion(es) creadas para ${sellerEmail.trim()}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <main className="admin-dev-page">
        <section className="admin-dev-panel">
          <h1>Admin dev</h1>
          <p>Necesitas iniciar sesion con una cuenta ADMIN para cargar skins de prueba.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-dev-page">
      <section className="admin-dev-panel">
        <div className="admin-dev-header">
          <div>
            <h1>Admin dev</h1>
            <p>Crea publicaciones de prueba asignadas a un usuario, sin SteamID.</p>
          </div>
          <button type="button" onClick={goToCatalogo}>
            Ver catalogo
          </button>
        </div>

        <form className="admin-dev-search" onSubmit={handleSearch}>
          <label>
            Buscar en catalogo
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="AK-47, Karambit, Doppler..."
            />
          </label>
          <button type="submit" disabled={loading}>
            <FaSearch /> Buscar
          </button>
        </form>

        <div className="admin-dev-layout">
          <section className="admin-dev-results">
            {results.map((item) => (
              <button
                className={selected?.id === item.id ? "catalog-result selected" : "catalog-result"}
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
              >
                <img src={item.imageUrl} alt={item.name} />
                <span>{item.weaponName || item.categoryName}</span>
                <strong>{item.name}</strong>
              </button>
            ))}
          </section>

          <form className="admin-dev-create" onSubmit={handleCreate}>
            <h2>Crear publicaciones</h2>

            <label>
              Vendedor
              <input
                type="email"
                value={sellerEmail}
                onChange={(event) => setSellerEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Skin elegida
              <input
                type="text"
                value={selected ? selected.name : ""}
                readOnly
                placeholder="Elegi una skin de la lista"
              />
            </label>

            <div className="admin-dev-grid">
              <label>
                Precio
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </label>

              <label>
                Cantidad
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </label>
            </div>

            <label className="admin-dev-check">
              <input
                type="checkbox"
                checked={vendible}
                onChange={(event) => setVendible(event.target.checked)}
              />
              Vendible
            </label>

            <label className="admin-dev-check">
              <input
                type="checkbox"
                checked={intercambiable}
                onChange={(event) => setIntercambiable(event.target.checked)}
              />
              Intercambiable
            </label>

            {error && <p className="admin-dev-error">{error}</p>}
            {message && <p className="admin-dev-success">{message}</p>}

            <button type="submit" disabled={loading}>
              <FaPlus /> {loading ? "Creando..." : "Crear para vendedor"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default AdminDevTools
