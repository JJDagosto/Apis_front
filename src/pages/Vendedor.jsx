import { useMemo } from "react"
import { FaArrowLeft, FaUser } from "react-icons/fa"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import CatalogGrid from "../components/catalogo/CatalogGrid.jsx"
import { useCatalogCartActions } from "../hooks/useCatalogCartActions"
import "./Vendedor.css"

const isVisiblePublication = (skin) => {
  const status = skin.estadoPublicacion
  return skin.active !== false && (!status || status === "PUBLICADA")
}

function VendedorView() {
  const navigate = useNavigate()
  const { sellerName = "" } = useParams()
  const seller = decodeURIComponent(sellerName).trim()
  const sellerKey = seller.toLowerCase()
  const { items, loading, error: catalogError } = useSelector((state) => state.catalogo)
  const {
    error: cartError,
    addingSkinId,
    getCartItemBySkinId,
    isOwnPublication,
    handleCartClick,
  } = useCatalogCartActions()

  const sellerSkins = useMemo(() => {
    return items.filter((skin) => (
      isVisiblePublication(skin) &&
      (skin.vendedorUsername ?? "").toLowerCase() === sellerKey
    ))
  }, [items, sellerKey])

  return (
    <main className="seller-page">
      <button className="seller-back" type="button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Volver
      </button>

      <section className="seller-header">
        <div className="seller-avatar">
          <FaUser />
        </div>
        <div>
          <span>Vendedor</span>
          <h1>Armas de {seller || "vendedor"}</h1>
          <p>Publicaciones disponibles de este vendedor.</p>
        </div>
      </section>

      <section className="seller-section">
        <div className="seller-section-title">
          <h2>Ver armas por vendedor</h2>
          <span>{sellerSkins.length} publicaciones</span>
        </div>

        <CatalogGrid
          skins={sellerSkins}
          loading={loading}
          error={cartError || catalogError}
          addingSkinId={addingSkinId}
          getCartItemBySkinId={getCartItemBySkinId}
          isOwnPublication={isOwnPublication}
          onCartClick={handleCartClick}
          onOpenPublication={(skinId) => navigate(`/publicacion/${skinId}`)}
        />
      </section>
    </main>
  )
}

export default VendedorView
