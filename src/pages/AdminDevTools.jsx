import { useEffect, useMemo, useState } from "react"
import { FaBan, FaPlus, FaSearch, FaTicketAlt, FaTrash } from "react-icons/fa"
import {
  buscarCatalogo,
  crearCuponAdmin,
  crearSkinAdmin,
  eliminarCuponAdmin,
  getCuponesAdmin,
  getOrdenesAdmin,
  getTodasLasSkinsAdmin,
  getUsuariosAdmin,
  inactivarSkinAdmin,
} from "../api/adminDev"
import "./AdminDevTools.css"

const limpiarNombreSkin = (nombre = "") => {
  return nombre
    .replace(/^.*\|\s*/, "")
    .replace(/\s*\([^)]*\)$/, "")
}

function AdminDevTools({ currentUser, goToCatalogo }) {
  const [skins, setSkins] = useState([])
  const [cupones, setCupones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [skinSearch, setSkinSearch] = useState("")
  const [catalogSearch, setCatalogSearch] = useState("ak-47")
  const [catalogResults, setCatalogResults] = useState([])
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [price, setPrice] = useState("1000")
  const [couponForm, setCouponForm] = useState({
    codigo: "",
    descuentoPct: "10",
    fechaExpiracion: "",
    multiUso: true,
  })
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const isAdmin = currentUser?.role === "ADMIN"

  const loadAdminData = async () => {
    setError("")
    setLoading(true)
    try {
      const [skinsData, cuponesData, usuariosData, ordenesData] = await Promise.all([
        getTodasLasSkinsAdmin(),
        getCuponesAdmin(),
        getUsuariosAdmin(),
        getOrdenesAdmin(),
      ])
      setSkins(skinsData)
      setCupones(cuponesData)
      setUsuarios(usuariosData)
      setOrdenes(ordenesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  const skinsFiltradas = useMemo(() => {
    const term = skinSearch.trim().toLowerCase()
    return skins.filter((skin) => {
      if (!term) return true
      return (
        (skin.name ?? "").toLowerCase().includes(term) ||
        (skin.catalogo?.weaponName ?? "").toLowerCase().includes(term) ||
        String(skin.id).includes(term)
      )
    })
  }, [skins, skinSearch])

  const stats = {
    skinsActivas: skins.filter((skin) => skin.active !== false).length,
    skinsInactivas: skins.filter((skin) => skin.active === false).length,
    cuponesActivos: cupones.filter((cupon) => cupon.activo !== false).length,
    usuarios: usuarios.length,
  }

  const handleCatalogSearch = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setSelectedCatalog(null)

    if (!catalogSearch.trim()) {
      setError("Escribi un nombre para buscar en el catalogo.")
      return
    }

    setActionId("catalog-search")
    try {
      const data = await buscarCatalogo(catalogSearch.trim())
      setCatalogResults(data)
      if (data.length === 0) setMessage("No encontramos skins con ese nombre.")
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleCreateSkin = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const parsedPrice = Number(price)
    if (!selectedCatalog) {
      setError("Elegi una skin del catalogo.")
      return
    }
    if (!parsedPrice || parsedPrice <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    setActionId("create-skin")
    try {
      await crearSkinAdmin({
        catalogoId: selectedCatalog.id,
        price: parsedPrice,
        discount: 0,
        stock: 1,
      })
      setMessage("Publicacion admin creada.")
      await loadAdminData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleDeactivateSkin = async (skin) => {
    const confirmed = window.confirm(`Dar de baja la publicacion #${skin.id}?`)
    if (!confirmed) return

    setError("")
    setMessage("")
    setActionId(`skin-${skin.id}`)
    try {
      const msg = await inactivarSkinAdmin(skin.id)
      setMessage(msg || "Skin inactivada.")
      await loadAdminData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleCreateCoupon = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const discount = Number(couponForm.descuentoPct)
    if (!couponForm.codigo.trim()) {
      setError("El cupon necesita codigo.")
      return
    }
    if (!discount || discount <= 0 || discount > 100) {
      setError("El descuento debe estar entre 1 y 100.")
      return
    }

    setActionId("create-coupon")
    try {
      await crearCuponAdmin(couponForm)
      setCouponForm({ codigo: "", descuentoPct: "10", fechaExpiracion: "", multiUso: true })
      setMessage("Cupon creado.")
      await loadAdminData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteCoupon = async (cupon) => {
    const confirmed = window.confirm(`Eliminar el cupon ${cupon.codigo}?`)
    if (!confirmed) return

    setError("")
    setMessage("")
    setActionId(`coupon-${cupon.id}`)
    try {
      const msg = await eliminarCuponAdmin(cupon.id)
      setMessage(msg || "Cupon eliminado.")
      await loadAdminData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  if (!isAdmin) {
    return (
      <main className="admin-dev-page">
        <section className="admin-dev-panel">
          <h1>Panel admin</h1>
          <p>Necesitas iniciar sesion con una cuenta ADMIN para entrar a esta vista.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-dev-page">
      <section className="admin-dev-panel">
        <div className="admin-dev-header">
          <div>
            <span className="admin-dev-kicker">Modo administrador</span>
            <h1>Panel admin</h1>
            <p>Gestiona publicaciones globales, cupones y datos generales del marketplace.</p>
          </div>
          <button type="button" onClick={goToCatalogo}>Ver catalogo</button>
        </div>

        <div className="admin-stats">
          <div><span>Publicadas</span><strong>{stats.skinsActivas}</strong></div>
          <div><span>Inactivas</span><strong>{stats.skinsInactivas}</strong></div>
          <div><span>Cupones</span><strong>{stats.cuponesActivos}</strong></div>
          <div><span>Usuarios</span><strong>{stats.usuarios}</strong></div>
        </div>

        {error && <p className="admin-dev-error">{error}</p>}
        {message && <p className="admin-dev-success">{message}</p>}
        {loading && <p className="admin-dev-message">Cargando datos admin...</p>}

        {!loading && (
          <div className="admin-dashboard">
            <section className="admin-card admin-wide">
              <div className="admin-section-header">
                <div>
                  <h2>Publicaciones</h2>
                  <p>El admin puede dar de baja cualquier skin publicada.</p>
                </div>
                <input
                  type="search"
                  value={skinSearch}
                  onChange={(event) => setSkinSearch(event.target.value)}
                  placeholder="Buscar por id, arma o nombre"
                />
              </div>

              <div className="admin-table">
                {skinsFiltradas.slice(0, 12).map((skin) => (
                  <article className="admin-row" key={skin.id}>
                    <img src={skin.imageUrl} alt={skin.name} />
                    <div>
                      <span>#{skin.id} ? {skin.catalogo?.weaponName ?? skin.game}</span>
                      <strong>{limpiarNombreSkin(skin.name)}</strong>
                    </div>
                    <span>${Number(skin.price ?? 0).toFixed(2)}</span>
                    <span className={skin.active === false ? "admin-status off" : "admin-status on"}>
                      {skin.active === false ? "Inactiva" : "Activa"}
                    </span>
                    <button
                      type="button"
                      disabled={skin.active === false || actionId === `skin-${skin.id}`}
                      onClick={() => handleDeactivateSkin(skin)}
                    >
                      <FaBan /> Baja
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-section-header">
                <div>
                  <h2>Cupones</h2>
                  <p>Crear y eliminar codigos de descuento.</p>
                </div>
              </div>

              <form className="admin-coupon-form" onSubmit={handleCreateCoupon}>
                <input
                  type="text"
                  value={couponForm.codigo}
                  onChange={(event) => setCouponForm((form) => ({ ...form, codigo: event.target.value }))}
                  placeholder="CODIGO"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={couponForm.descuentoPct}
                  onChange={(event) => setCouponForm((form) => ({ ...form, descuentoPct: event.target.value }))}
                  placeholder="%"
                />
                <input
                  type="date"
                  value={couponForm.fechaExpiracion}
                  onChange={(event) => setCouponForm((form) => ({ ...form, fechaExpiracion: event.target.value }))}
                />
                <label className="admin-dev-check">
                  <input
                    type="checkbox"
                    checked={couponForm.multiUso}
                    onChange={(event) => setCouponForm((form) => ({ ...form, multiUso: event.target.checked }))}
                  />
                  Multiuso
                </label>
                <button type="submit" disabled={actionId === "create-coupon"}>
                  <FaTicketAlt /> Crear cupon
                </button>
              </form>

              <div className="admin-coupon-list">
                {cupones.map((cupon) => (
                  <article key={cupon.id} className="admin-coupon-row">
                    <div>
                      <strong>{cupon.codigo}</strong>
                      <span>{Math.round((cupon.descuento ?? 0) * 100)}% ? {cupon.multiUso ? "multiuso" : "uso unico"}</span>
                    </div>
                    <button
                      type="button"
                      disabled={actionId === `coupon-${cupon.id}`}
                      onClick={() => handleDeleteCoupon(cupon)}
                    >
                      <FaTrash />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-section-header">
                <div>
                  <h2>Crear publicacion admin</h2>
                  <p>Alta rapida desde catalogo, sin inventario Steam.</p>
                </div>
              </div>

              <form className="admin-dev-search compact" onSubmit={handleCatalogSearch}>
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  placeholder="AK-47, Karambit..."
                />
                <button type="submit" disabled={actionId === "catalog-search"}>
                  <FaSearch /> Buscar
                </button>
              </form>

              <div className="admin-catalog-results">
                {catalogResults.slice(0, 4).map((item) => (
                  <button
                    type="button"
                    className={selectedCatalog?.id === item.id ? "admin-catalog-item selected" : "admin-catalog-item"}
                    key={item.id}
                    onClick={() => setSelectedCatalog(item)}
                  >
                    <img src={item.imageUrl} alt={item.name} />
                    <span>{item.weaponName}</span>
                    <strong>{limpiarNombreSkin(item.name)}</strong>
                  </button>
                ))}
              </div>

              <form className="admin-create-skin" onSubmit={handleCreateSkin}>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Precio"
                />
                <button type="submit" disabled={actionId === "create-skin"}>
                  <FaPlus /> Crear skin
                </button>
              </form>
            </section>

            <section className="admin-card admin-mini-list">
              <h2>Resumen</h2>
              <p>Ordenes registradas: <strong>{ordenes.length}</strong></p>
              <p>Admins: <strong>{usuarios.filter((user) => user.role === "ADMIN").length}</strong></p>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDevTools
