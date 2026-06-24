import { FaPaperPlane, FaSteam, FaSyncAlt } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { setOfferedSearchTerm } from "../../Redux/intercambioSlice"
import ExchangeItemCard from "./ExchangeItemCard.jsx"
import ExchangePanelSearch from "./ExchangePanelSearch.jsx"

const getUnavailableLabel = (item) => {
  if (item.publicado) return "Publicado para venta"
  if (item.pending) return "En otra operaci\u00f3n"
  if (item.tradable === false) return "No intercambiable"
  return null
}

const getSteamInventoryPrice = (item) => {
  if (item.estimatedPrice === null || item.estimatedPrice === undefined || item.estimatedPrice === "") {
    return null
  }
  const estimatedPrice = Number(item.estimatedPrice)
  if (!Number.isFinite(estimatedPrice) || estimatedPrice <= 0) return null
  return estimatedPrice
}

function ExchangeInventoryPanel({
  currentUser,
  items,
  loading,
  syncing,
  error,
  selectedIds,
  onLogin,
  onSync,
  onToggle,
}) {
  const dispatch = useDispatch()
  const searchTerm = useSelector((state) => state.intercambio.offeredSearchTerm)
  const inventoryItems = items.filter((item) => item.catalogo)
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const visibleItems = inventoryItems.filter((item) => (
    !normalizedSearch || [
      item.name,
      item.catalogo?.weaponName,
      item.catalogo?.exteriorName,
    ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch))
  ))

  return (
    <section className="exchange-panel exchange-panel-offer">
      <header className="exchange-panel-header">
        <div className="exchange-panel-title">
          <span className="exchange-header-icon"><FaPaperPlane /></span>
          <div>
            <span className="exchange-panel-kicker">Enviás</span>
            <h2>Tu inventario</h2>
          </div>
        </div>
        {currentUser && (
          <button type="button" onClick={onSync} disabled={syncing}>
            <FaSyncAlt /> {syncing ? "Sincronizando" : "Actualizar"}
          </button>
        )}
      </header>

      {currentUser && (
        <ExchangePanelSearch
          value={searchTerm}
          onChange={(value) => dispatch(setOfferedSearchTerm(value))}
          label="Buscar en las skins que enviás"
        />
      )}

      {!currentUser && (
        <div className="exchange-empty">
          <FaSteam />
          <h3>Iniciá sesión para ver tu inventario</h3>
          <p>Desde acá elegís las skins que querés ofrecer en el intercambio.</p>
          <button type="button" onClick={onLogin}>Iniciar sesión</button>
        </div>
      )}

      {currentUser && loading && (
        <p className="exchange-message">Cargando inventario...</p>
      )}

      {currentUser && error && (
        <p className="exchange-message exchange-error">{error}</p>
      )}

      {currentUser && !loading && !error && visibleItems.length === 0 && (
        <div className="exchange-empty">
          <FaSteam />
          <h3>{normalizedSearch ? "No encontramos coincidencias" : "No hay skins disponibles"}</h3>
          <p>{normalizedSearch ? "Probá con otro nombre, arma o estado." : "Sincronizá tu inventario o revisá que tengas skins intercambiables."}</p>
        </div>
      )}

      {currentUser && !loading && !error && visibleItems.length > 0 && (
        <div className="exchange-item-grid">
          {visibleItems.map((item) => {
            const unavailableLabel = getUnavailableLabel(item)
            return (
              <ExchangeItemCard
                key={item.id}
                image={item.iconUrl || item.catalogo?.imageUrl}
                title={item.name}
                weapon={item.catalogo?.weaponName}
                exterior={item.catalogo?.exteriorName}
                price={getSteamInventoryPrice(item)}
                status="Inventario"
                selected={selectedIds.includes(String(item.id))}
                disabled={Boolean(unavailableLabel)}
                unavailableLabel={unavailableLabel}
                onSelect={() => onToggle(item.id)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ExchangeInventoryPanel
