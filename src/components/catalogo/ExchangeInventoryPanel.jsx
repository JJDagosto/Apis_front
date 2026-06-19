import { FaSteam, FaSyncAlt } from "react-icons/fa"
import ExchangeItemCard from "./ExchangeItemCard.jsx"

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
  const tradableItems = items.filter((item) => (
    item.catalogo &&
    !item.publicado &&
    !item.pending &&
    item.tradable !== false
  ))

  return (
    <section className="exchange-panel">
      <header className="exchange-panel-header">
        <div>
          <span>Tu oferta</span>
          <h2>Inventario</h2>
        </div>
        {currentUser && (
          <button type="button" onClick={onSync} disabled={syncing}>
            <FaSyncAlt /> {syncing ? "Sincronizando" : "Actualizar"}
          </button>
        )}
      </header>

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

      {currentUser && !loading && !error && tradableItems.length === 0 && (
        <div className="exchange-empty">
          <FaSteam />
          <h3>No hay skins disponibles</h3>
          <p>Sincronizá tu inventario o revisá que tengas skins tradeables.</p>
        </div>
      )}

      {currentUser && !loading && !error && tradableItems.length > 0 && (
        <div className="exchange-item-list">
          {tradableItems.map((item) => (
            <ExchangeItemCard
              key={item.id}
              image={item.iconUrl || item.catalogo?.imageUrl}
              title={item.name}
              weapon={item.catalogo?.weaponName}
              exterior={item.catalogo?.exteriorName}
              status="Inventario"
              selected={selectedIds.includes(String(item.id))}
              onSelect={() => onToggle(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ExchangeInventoryPanel
