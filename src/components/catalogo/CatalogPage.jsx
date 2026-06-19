import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  selectFilteredCatalogItems,
} from "../../Redux/catalogoSlice"
import CatalogFilters from "../CatalogFilters.jsx"
import CatalogModeTabs from "./CatalogModeTabs.jsx"
import CatalogGrid from "./CatalogGrid.jsx"
import CatalogSearchNotice from "./CatalogSearchNotice.jsx"
import CatalogToolbar from "./CatalogToolbar.jsx"
import { useCatalogCartActions } from "../../hooks/useCatalogCartActions"

function CatalogPage() {
  const navigate = useNavigate()
  const skins = useSelector(selectFilteredCatalogItems)
  const { loading, error: catalogError } = useSelector((state) => state.catalogo)
  const {
    error: cartError,
    addingSkinId,
    getCartItemBySkinId,
    isOwnPublication,
    handleCartClick,
  } = useCatalogCartActions()

  const openPublication = (skinId) => {
    navigate(`/publicacion/${skinId}`)
  }

  return (
    <div className="catalogo mt-4">
      <CatalogModeTabs />
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3">
            <CatalogFilters />
          </div>

          <div className="col-sm-9">
            <CatalogToolbar />
            <CatalogSearchNotice />
            <CatalogGrid
              skins={skins}
              loading={loading}
              error={cartError || catalogError}
              addingSkinId={addingSkinId}
              getCartItemBySkinId={getCartItemBySkinId}
              isOwnPublication={isOwnPublication}
              onCartClick={handleCartClick}
              onOpenPublication={openPublication}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
