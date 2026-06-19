import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchInventario, sincronizarInventario } from "../../Redux/inventarioSlice"
import {
  clearExchangeSelection,
  toggleOfferedInventoryItem,
  toggleRequestedSkin,
} from "../../Redux/intercambioSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import {
  selectExchangeCatalogItems,
} from "../../Redux/catalogoSlice"
import CatalogFilters from "../CatalogFilters.jsx"
import CatalogModeTabs from "../catalogo/CatalogModeTabs.jsx"
import CatalogSearchNotice from "../catalogo/CatalogSearchNotice.jsx"
import CatalogToolbar from "../catalogo/CatalogToolbar.jsx"
import ExchangeCatalogPanel from "../catalogo/ExchangeCatalogPanel.jsx"
import ExchangeInventoryPanel from "../catalogo/ExchangeInventoryPanel.jsx"
import ExchangeSummary from "../catalogo/ExchangeSummary.jsx"

function IntercambiarView() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const skins = useSelector(selectExchangeCatalogItems)
  const { loading: catalogLoading, error: catalogError } = useSelector(
    (state) => state.catalogo,
  )
  const {
    items: inventoryItems,
    status: inventoryStatus,
    syncing,
    error: inventoryError,
  } = useSelector((state) => state.inventario)
  const {
    offeredInventoryItemIds,
    requestedSkinIds,
  } = useSelector((state) => state.intercambio)
  const inventoryLoading = inventoryStatus === "loading"
  const canSubmit =
    Boolean(currentUser) &&
    offeredInventoryItemIds.length > 0 &&
    requestedSkinIds.length > 0

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchInventario())
    }
  }, [currentUser, dispatch])

  const handleSyncInventory = async () => {
    try {
      const result = await dispatch(sincronizarInventario()).unwrap()
      dispatch(mostrarNotificacion(
        result.message || "Inventario actualizado correctamente.",
      ))
    } catch (error) {
      dispatch(mostrarNotificacion(error.message, "error"))
    }
  }

  const handleSubmitExchange = () => {
    dispatch(mostrarNotificacion(
      "Selección de intercambio preparada. Falta conectar el endpoint final.",
      "info",
    ))
  }

  return (
    <div className="catalogo catalog-exchange-page">
      <CatalogModeTabs />
      <CatalogSearchNotice />

      <div className="exchange-layout">
        <ExchangeInventoryPanel
          currentUser={currentUser}
          items={inventoryItems}
          loading={inventoryLoading}
          syncing={syncing}
          error={inventoryError}
          selectedIds={offeredInventoryItemIds}
          onLogin={() => navigate("/login")}
          onSync={handleSyncInventory}
          onToggle={(itemId) => dispatch(toggleOfferedInventoryItem(itemId))}
        />

        <div className="exchange-center">
          <ExchangeSummary
            offeredCount={offeredInventoryItemIds.length}
            requestedCount={requestedSkinIds.length}
            canSubmit={canSubmit}
            onClear={() => dispatch(clearExchangeSelection())}
            onSubmit={handleSubmitExchange}
          />
          <div className="exchange-filter-box">
            <CatalogToolbar />
            <CatalogFilters />
          </div>
        </div>

        <ExchangeCatalogPanel
          skins={skins}
          loading={catalogLoading}
          error={catalogError}
          selectedIds={requestedSkinIds}
          onToggle={(skinId) => dispatch(toggleRequestedSkin(skinId))}
        />
      </div>
    </div>
  )
}

export default IntercambiarView
