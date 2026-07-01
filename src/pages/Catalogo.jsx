import { useSelector } from "react-redux"
import {
  selectFilteredCatalogItems,
} from "../Redux/catalogoSlice"
import CatalogFilters from "../components/CatalogFilters.jsx"
import CatalogModeTabs from "../components/catalogo/CatalogModeTabs.jsx"
import CatalogGrid from "../components/catalogo/CatalogGrid.jsx"
import CatalogSearchNotice from "../components/catalogo/CatalogSearchNotice.jsx"
import CatalogSearchBar from "../components/catalogo/CatalogSearchBar.jsx"
import CatalogToolbar from "../components/catalogo/CatalogToolbar.jsx"
import { useCatalogCartActions } from "../hooks/useCatalogCartActions"
import "./Catalogo.css"

function Catalogo() {
  const skins = useSelector(selectFilteredCatalogItems)
  const { loading, error: catalogError } = useSelector((state) => state.catalogo)
  const {
    error: cartError,
    addingSkinId,
    getCartItemBySkinId,
    isOwnPublication,
    handleCartClick,
  } = useCatalogCartActions()

  return (
    <div className="catalogo mt-4">
      <CatalogModeTabs />
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3">
            <CatalogFilters showAvailability={false} />
          </div>

          <div className="col-sm-9">
            <CatalogSearchBar />
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalogo
