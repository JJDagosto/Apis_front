import { useEffect, useMemo, useState } from "react"
import { FaChevronLeft, FaChevronRight, FaPlus, FaSearch, FaTicketAlt, FaTrash } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  buscarCatalogoAdmin,
  crearCuponAdmin,
  crearSkinAdminParaUsuario,
  eliminarCuponAdmin,
  fetchAdminDashboard,
  inactivarSkinAdmin,
} from "../../Redux/adminSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import useCurrencyFormatter from "../../hooks/useCurrencyFormatter"
import { DEFAULT_USD_TO_ARS } from "../../utils/currency"
import { limpiarNombreSkin } from "../../utils/skinFormat"
import { getPercentRangeError, getPositivePriceError } from "../../utils/validations.jsx"
import "../../pages/AdminDevTools.css"

const getUserLabel = (user) => {
  const nombre = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return `${user.username || nombre || user.email} - ${user.email}`
}

const getCatalogExteriorLabel = (item) => item.exteriorName || "Sin desgaste"

const isCatalogStattrak = (item) => {
  return /stattrak/i.test(`${item.name ?? ""} ${item.marketHashName ?? ""}`)
}

const exteriorOrder = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]
const PUBLICACIONES_POR_PAGINA = 10
const CLAIM_PAYMENT_STATUSES = new Set(["REJECTED", "CANCELLED", "REFUNDED", "CHARGED_BACK"])
const CLAIM_TRADE_STATUSES = new Set(["CANCELLED", "FAILED", "RETURN_PENDING", "RETURN_FAILED"])

const parseDecimalInput = (value) => Number(String(value).replace(",", "."))

const getExteriorSortValue = (item) => {
  const index = exteriorOrder.indexOf(item.exteriorName)
  return index === -1 ? exteriorOrder.length : index
}

const getOrderPaymentStatus = (order) => order.paymentStatus ?? order.status ?? "SIN_ESTADO"

const getClaimReason = (order) => {
  const paymentStatus = getOrderPaymentStatus(order)
  const tradeStatus = order.tradeStatus ?? ""

  if (CLAIM_PAYMENT_STATUSES.has(paymentStatus)) return `Pago ${paymentStatus.toLowerCase()}`
  if (CLAIM_TRADE_STATUSES.has(tradeStatus)) return `Trade ${tradeStatus.toLowerCase()}`
  return "Revisión manual"
}

function AdminDevTools({ goToCatalogo }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openCatalogo = goToCatalogo ?? (() => navigate("/catalogo"))
  const currentUser = useSelector((state) => state.auth.currentUser)
  const { rate, formatPrice } = useCurrencyFormatter()
  const {
    publicaciones,
    cupones,
    usuarios,
    ordenes,
    catalogResults,
    status,
    searching,
    error: reduxError,
  } = useSelector((state) => state.admin)
  const [skinSearch, setSkinSearch] = useState("")
  const [catalogSearch, setCatalogSearch] = useState("ak-47")
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [price, setPrice] = useState("1000")
  const [sellerSearch, setSellerSearch] = useState("")
  const [couponForm, setCouponForm] = useState({
    codigo: "",
    descuentoPct: "10",
    fechaExpiracion: "",
    multiUso: true,
  })
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState("")
  const [publicacionesPage, setPublicacionesPage] = useState(1)

  const isAdmin = currentUser?.role === "ADMIN"
  const loading = status === "loading"
  const usdToArs = Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_USD_TO_ARS

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminDashboard())
    }
  }, [dispatch, isAdmin])

  const skinsFiltradas = useMemo(() => {
    const term = skinSearch.trim().toLowerCase()
    return publicaciones.filter((skin) => {
      if (!term) return true
      return (
        (skin.name ?? "").toLowerCase().includes(term) ||
        (skin.catalogo?.weaponName ?? "").toLowerCase().includes(term) ||
        String(skin.id).includes(term)
      )
    })
  }, [publicaciones, skinSearch])

  const publicacionesTotalPages = Math.max(1, Math.ceil(skinsFiltradas.length / PUBLICACIONES_POR_PAGINA))

  useEffect(() => {
    setPublicacionesPage(1)
  }, [skinSearch])

  useEffect(() => {
    setPublicacionesPage((page) => Math.min(page, publicacionesTotalPages))
  }, [publicacionesTotalPages])

  const publicacionesPaginadas = useMemo(() => {
    const start = (publicacionesPage - 1) * PUBLICACIONES_POR_PAGINA
    return skinsFiltradas.slice(start, start + PUBLICACIONES_POR_PAGINA)
  }, [skinsFiltradas, publicacionesPage])

  const publicacionesDesde = skinsFiltradas.length === 0
    ? 0
    : (publicacionesPage - 1) * PUBLICACIONES_POR_PAGINA + 1
  const publicacionesHasta = Math.min(
    publicacionesPage * PUBLICACIONES_POR_PAGINA,
    skinsFiltradas.length,
  )

  const stats = {
    skinsPublicadas: publicaciones.length,
    transacciones: ordenes.length,
    cuponesActivos: cupones.filter((cupon) => cupon.activo !== false).length,
    usuarios: usuarios.length,
    reclamos: ordenes.filter((order) => (
      CLAIM_PAYMENT_STATUSES.has(getOrderPaymentStatus(order)) ||
      CLAIM_TRADE_STATUSES.has(order.tradeStatus)
    )).length,
  }

  const reclamos = useMemo(() => {
    return ordenes.filter((order) => (
      CLAIM_PAYMENT_STATUSES.has(getOrderPaymentStatus(order)) ||
      CLAIM_TRADE_STATUSES.has(order.tradeStatus)
    ))
  }, [ordenes])

  const sellerOptions = useMemo(() => {
    return usuarios.filter((user) => user.email)
  }, [usuarios])

  const catalogResultsOrdenados = useMemo(() => {
    return catalogResults.slice().sort((a, b) => {
      const aTieneDesgaste = Boolean(a.exteriorName)
      const bTieneDesgaste = Boolean(b.exteriorName)
      if (aTieneDesgaste !== bTieneDesgaste) return aTieneDesgaste ? -1 : 1

      const armaCompare = (a.weaponName ?? "").localeCompare(b.weaponName ?? "")
      if (armaCompare !== 0) return armaCompare

      const nombreCompare = limpiarNombreSkin(a.name).localeCompare(limpiarNombreSkin(b.name))
      if (nombreCompare !== 0) return nombreCompare

      const stattrakCompare = Number(isCatalogStattrak(a)) - Number(isCatalogStattrak(b))
      if (stattrakCompare !== 0) return stattrakCompare

      return getExteriorSortValue(a) - getExteriorSortValue(b)
    })
  }, [catalogResults])

  const resolveSeller = () => {
    const term = sellerSearch.trim().toLowerCase()
    if (!term) return null

    const exactMatch = sellerOptions.find((user) => (
      user.email?.toLowerCase() === term ||
      user.username?.toLowerCase() === term ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim().toLowerCase() === term
    ))
    if (exactMatch) return exactMatch

    const matches = sellerOptions.filter((user) => getUserLabel(user).toLowerCase().includes(term))
    return matches.length === 1 ? matches[0] : null
  }

  const handleCatalogSearch = (event) => {
    event.preventDefault()
    setError("")
    setSelectedCatalog(null)

    if (!catalogSearch.trim()) {
      dispatch(mostrarNotificacion("Escribí un nombre para buscar en el catálogo.", "error"))
      return
    }

    dispatch(buscarCatalogoAdmin(catalogSearch.trim()))
  }

  const handleCreateSkin = (event) => {
    event.preventDefault()
    setError("")

    const seller = resolveSeller()
    if (!selectedCatalog) {
      dispatch(mostrarNotificacion("Elegí una skin del catálogo.", "error"))
      return
    }
    if (!seller) {
      dispatch(mostrarNotificacion("Elegí un vendedor de la lista de usuarios.", "error"))
      return
    }
    const priceError = getPositivePriceError(price)
    if (priceError) {
      dispatch(mostrarNotificacion(priceError, "error"))
      return
    }
    const priceArs = parseDecimalInput(price)

    setActionId("create-skin")
    dispatch(crearSkinAdminParaUsuario({
      vendedorEmail: seller.email,
      payload: {
        catalogoId: selectedCatalog.id,
        price: priceArs / usdToArs,
        discount: 0,
        stock: 1,
      },
    }))
    setActionId(null)
  }

  const handleDeactivateSkin = (skin) => {
    const confirmed = window.confirm(
      `¿Eliminar la publicación #${skin.id} del catálogo? La skin no se elimina del inventario del usuario.`
    )
    if (!confirmed) return

    setError("")
    setActionId(`skin-${skin.id}`)
    dispatch(inactivarSkinAdmin(skin.id))
    setActionId(null)
  }

  const handleCreateCoupon = (event) => {
    event.preventDefault()
    setError("")

    if (!couponForm.codigo.trim()) {
      dispatch(mostrarNotificacion("El cupón necesita código.", "error"))
      return
    }

    const discountError = getPercentRangeError(couponForm.descuentoPct)
    if (discountError) {
      dispatch(mostrarNotificacion(discountError, "error"))
      return
    }

    setActionId("create-coupon")
    dispatch(crearCuponAdmin(couponForm))
    setCouponForm({ codigo: "", descuentoPct: "10", fechaExpiracion: "", multiUso: true })
    setActionId(null)
  }

  const handleDeleteCoupon = (cupon) => {
    const confirmed = window.confirm(`¿Eliminar el cupón ${cupon.codigo}?`)
    if (!confirmed) return

    setError("")
    setActionId(`coupon-${cupon.id}`)
    dispatch(eliminarCuponAdmin(cupon.id))
    setActionId(null)
  }

  if (!isAdmin) {
    return (
      <main className="admin-dev-page">
        <section className="admin-dev-panel">
          <h1>Panel admin</h1>
          <p>Necesitás iniciar sesión con una cuenta ADMIN para entrar a esta vista.</p>
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
            <p>Gestioná publicaciones globales, cupones y datos generales del marketplace.</p>
          </div>
          <button type="button" onClick={openCatalogo}>Ver catálogo</button>
        </div>

        <div className="admin-stats">
          <div><span>Publicadas</span><strong>{stats.skinsPublicadas}</strong></div>
          <div><span>Transacciones</span><strong>{stats.transacciones}</strong></div>
          <div><span>Cupones</span><strong>{stats.cuponesActivos}</strong></div>
          <div><span>Usuarios</span><strong>{stats.usuarios}</strong></div>
          <div><span>Reclamos</span><strong>{stats.reclamos}</strong></div>
        </div>

        {(error || reduxError) && (
          <p className="admin-dev-error">{error || reduxError}</p>
        )}
        {loading && <p className="admin-dev-message">Cargando datos admin...</p>}

        {!loading && (
          <div className="admin-dashboard">
            <section className="admin-card admin-mini-list">
              <h2>Resumen</h2>
              <p>Órdenes registradas: <strong>{ordenes.length}</strong></p>
              <p>Admins: <strong>{usuarios.filter((user) => user.role === "ADMIN").length}</strong></p>
            </section>

            <section className="admin-card admin-claims-card">
              <div className="admin-section-header">
                <div>
                  <h2>Tabla de reclamos</h2>
                  <p>Órdenes con pago rechazado, devolución o trade fallido.</p>
                </div>
              </div>

              <div className="admin-claims-list">
                {reclamos.map((order) => (
                  <article className="admin-claim-row" key={order.id}>
                    <div>
                      <span>Orden #{order.id}</span>
                      <strong>{order.userEmail}</strong>
                    </div>
                    <span>{getClaimReason(order)}</span>
                    <span>{getOrderPaymentStatus(order)}</span>
                  </article>
                ))}

                {reclamos.length === 0 && (
                  <p className="admin-empty-state">
                    No hay reclamos abiertos.
                  </p>
                )}
              </div>
            </section>

            <section className="admin-card admin-wide">
              <div className="admin-section-header">
                <div>
                  <h2>Publicaciones</h2>
                  <p>Solo se muestran skins activas y publicadas.</p>
                </div>
                <input
                  type="search"
                  value={skinSearch}
                  onChange={(event) => setSkinSearch(event.target.value)}
                  placeholder="Buscar por id, arma o nombre"
                />
              </div>

              <div className="admin-table">
                {publicacionesPaginadas.map((skin) => (
                  <article className="admin-row" key={skin.id}>
                    <img src={skin.imageUrl} alt={skin.name} />
                    <div>
                      <span>#{skin.id} - {skin.catalogo?.weaponName ?? skin.game}</span>
                      <strong>{limpiarNombreSkin(skin.name)}</strong>
                    </div>
                    <span>{formatPrice(skin.finalPrice ?? skin.price)}</span>
                    <span className={skin.active === false ? "admin-status off" : "admin-status on"}>
                      {skin.active === false ? "Inactiva" : "Activa"}
                    </span>
                    <button
                      type="button"
                      disabled={skin.active === false || actionId === `skin-${skin.id}`}
                      onClick={() => handleDeactivateSkin(skin)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </article>
                ))}
                {skinsFiltradas.length === 0 && (
                  <p className="admin-empty-state">
                    No hay publicaciones activas que coincidan con la búsqueda.
                  </p>
                )}
              </div>

              {skinsFiltradas.length > 0 && (
                <div className="admin-pagination">
                  <span>
                    {publicacionesDesde}-{publicacionesHasta} de {skinsFiltradas.length}
                  </span>
                  <div>
                    <button
                      type="button"
                      disabled={publicacionesPage === 1}
                      onClick={() => setPublicacionesPage((page) => Math.max(1, page - 1))}
                      title="Página anterior"
                    >
                      <FaChevronLeft />
                    </button>
                    <strong>{publicacionesPage} / {publicacionesTotalPages}</strong>
                    <button
                      type="button"
                      disabled={publicacionesPage === publicacionesTotalPages}
                      onClick={() => setPublicacionesPage((page) => Math.min(publicacionesTotalPages, page + 1))}
                      title="Página siguiente"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="admin-card admin-coupons-card">
              <div className="admin-section-header">
                <div>
                  <h2>Cupones</h2>
                  <p>Crear y eliminar códigos de descuento.</p>
                </div>
              </div>

              <form className="admin-coupon-form" onSubmit={handleCreateCoupon}>
                <input
                  className="admin-coupon-code"
                  type="text"
                  value={couponForm.codigo}
                  onChange={(event) => setCouponForm((form) => ({ ...form, codigo: event.target.value }))}
                  placeholder="CÓDIGO"
                />
                <input
                  className="admin-coupon-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={couponForm.descuentoPct}
                  onChange={(event) => setCouponForm((form) => ({ ...form, descuentoPct: event.target.value }))}
                  placeholder="%"
                />
                <input
                  className="admin-coupon-date"
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
                  <FaTicketAlt /> Crear cupón
                </button>
              </form>

              <div className="admin-coupon-list">
                {cupones.map((cupon) => (
                  <article key={cupon.id} className="admin-coupon-row">
                    <div>
                      <strong>{cupon.codigo}</strong>
                      <span>{Math.round((cupon.descuento ?? 0) * 100)}% - {cupon.multiUso ? "multiuso" : "uso único"}</span>
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

            <section className="admin-card admin-create-card">
              <div className="admin-section-header">
                <div>
                  <h2>Crear publicación admin</h2>
                  <p>Alta rápida desde catálogo, sin inventario Steam.</p>
                </div>
              </div>

              <form className="admin-dev-search compact" onSubmit={handleCatalogSearch}>
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  placeholder="AK-47, Karambit..."
                />
                <button type="submit" disabled={searching}>
                  <FaSearch /> Buscar
                </button>
              </form>

              <div className="admin-catalog-results">
                {catalogResultsOrdenados.slice(0, 8).map((item) => (
                  <button
                    type="button"
                    className={selectedCatalog?.id === item.id ? "admin-catalog-item selected" : "admin-catalog-item"}
                    key={item.id}
                    onClick={() => setSelectedCatalog(item)}
                  >
                    <img src={item.imageUrl} alt={item.name} />
                    <div className="admin-catalog-main">
                      <span>{item.weaponName}</span>
                      <strong>{limpiarNombreSkin(item.name)}</strong>
                    </div>
                    <div className="admin-catalog-meta">
                      <span>{getCatalogExteriorLabel(item)}</span>
                      {isCatalogStattrak(item) && <span>StatTrak</span>}
                      {item.rarezaName && <span>{item.rarezaName}</span>}
                    </div>
                  </button>
                ))}
              </div>

              <form className="admin-create-skin" onSubmit={handleCreateSkin}>
                <label className="admin-seller-field">
                  Vendedor
                  <input
                    type="text"
                    list="admin-seller-options"
                    value={sellerSearch}
                    onChange={(event) => setSellerSearch(event.target.value)}
                    placeholder="Username, nombre o email"
                  />
                </label>
                <datalist id="admin-seller-options">
                  {sellerOptions.map((user) => (
                    <option key={user.id ?? user.email} value={user.email}>
                      {getUserLabel(user)}
                    </option>
                  ))}
                </datalist>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Precio ARS"
                />
                <button type="submit" disabled={actionId === "create-skin"}>
                  <FaPlus /> Crear skin
                </button>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDevTools
