import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchInventario, sincronizarInventario } from "../../Redux/inventarioSlice"
import {
  clearExchangeSelection,
  cotizarIntercambio,
  crearIntercambio,
  toggleOfferedInventoryItem,
  toggleRequestedSkin,
} from "../../Redux/intercambioSlice"
import { mostrarNotificacion } from "../../Redux/notificacionesSlice"
import { selectExchangeCatalogItems } from "../../Redux/catalogoSlice"
import CatalogFilters from "../CatalogFilters.jsx"
import CatalogModeTabs from "../catalogo/CatalogModeTabs.jsx"
import CatalogToolbar from "../catalogo/CatalogToolbar.jsx"
import ExchangeCatalogPanel from "../catalogo/ExchangeCatalogPanel.jsx"
import ExchangeInventoryPanel from "../catalogo/ExchangeInventoryPanel.jsx"
import ExchangeSummary from "../catalogo/ExchangeSummary.jsx"
import BalanceTopUpModal from "../BalanceTopUpModal.jsx"

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
    quote,
    quoteStatus,
    quoteError,
    submitting,
  } = useSelector((state) => state.intercambio)
  const inventoryLoading = inventoryStatus === "loading"
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const canSubmit =
    Boolean(currentUser) &&
    offeredInventoryItemIds.length > 0 &&
    requestedSkinIds.length > 0 &&
    quoteStatus === "succeeded" &&
    Number(quote?.saldoFaltante ?? 0) === 0

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchInventario())
    }
  }, [currentUser, dispatch])

  useEffect(() => {
    if (
      currentUser &&
      offeredInventoryItemIds.length > 0 &&
      requestedSkinIds.length > 0
    ) {
      dispatch(cotizarIntercambio({
        inventarioItemIds: offeredInventoryItemIds,
        skinIds: requestedSkinIds,
        balance: currentUser.saldo,
      }))
    }
  }, [
    currentUser,
    dispatch,
    offeredInventoryItemIds,
    requestedSkinIds,
    currentUser?.saldo,
  ])

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

  const handleSubmitExchange = async () => {
    try {
      const operation = await dispatch(crearIntercambio({
        inventarioItemIds: offeredInventoryItemIds,
        skinIds: requestedSkinIds,
      })).unwrap()
      dispatch(mostrarNotificacion(
        `Intercambio #${operation.id} creado correctamente. Revisá su estado en Mis publicaciones.`,
      ))
    } catch (error) {
      dispatch(mostrarNotificacion(error.message, "error"))
    }
  }

  return (
    <div className="catalogo catalog-exchange-page">
      <CatalogModeTabs />

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
            currentBalance={currentUser?.saldo}
            quote={quote}
            quoteStatus={quoteStatus}
            quoteError={quoteError}
            canSubmit={canSubmit}
            submitting={submitting}
            onAddBalance={() => setBalanceModalOpen(true)}
            onClear={() => dispatch(clearExchangeSelection())}
            onSubmit={handleSubmitExchange}
          />
          <details className="exchange-filter-box">
            <summary className="exchange-filter-summary">Filtros y orden</summary>
            <CatalogToolbar />
            <CatalogFilters showAvailability={false} />
          </details>
        </div>

        <ExchangeCatalogPanel
          skins={skins}
          loading={catalogLoading}
          error={catalogError}
          selectedIds={requestedSkinIds}
          onToggle={(skinId) => dispatch(toggleRequestedSkin(skinId))}
        />
      </div>
      {balanceModalOpen && currentUser && (
        <BalanceTopUpModal
          currentUser={currentUser}
          initialAmountUsd={Number(quote?.saldoFaltante ?? 0)}
          onClose={() => setBalanceModalOpen(false)}
        />
      )}
    </div>
  )
}

export default IntercambiarView
