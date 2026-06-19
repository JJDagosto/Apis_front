import ExchangeItemCard from "./ExchangeItemCard.jsx"

function ExchangeCatalogPanel({
  skins,
  loading,
  error,
  selectedIds,
  onToggle,
}) {
  return (
    <section className="exchange-panel">
      <header className="exchange-panel-header">
        <div>
          <span>Recibes</span>
          <h2>Skins intercambiables</h2>
        </div>
      </header>

      {loading && <p className="exchange-message">Cargando skins...</p>}
      {!loading && error && <p className="exchange-message exchange-error">{error}</p>}
      {!loading && !error && skins.length === 0 && (
        <p className="exchange-message">No hay skins intercambiables con esos filtros.</p>
      )}

      {!loading && !error && skins.length > 0 && (
        <div className="exchange-item-grid">
          {skins.map((skin) => (
            <ExchangeItemCard
              key={skin.id}
              image={skin.imageUrl}
              title={skin.name}
              weapon={skin.catalogo?.weaponName}
              exterior={skin.catalogo?.exteriorName ?? skin.exterior}
              price={skin.finalPrice ?? skin.price}
              selected={selectedIds.includes(String(skin.id))}
              onSelect={() => onToggle(skin.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ExchangeCatalogPanel
