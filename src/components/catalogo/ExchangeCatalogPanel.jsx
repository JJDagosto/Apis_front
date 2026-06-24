import { useDispatch, useSelector } from "react-redux"
import { FaGift } from "react-icons/fa"
import { setRequestedSearchTerm } from "../../Redux/intercambioSlice"
import ExchangeItemCard from "./ExchangeItemCard.jsx"
import ExchangePanelSearch from "./ExchangePanelSearch.jsx"

function ExchangeCatalogPanel({
  skins,
  loading,
  error,
  selectedIds,
  onToggle,
}) {
  const dispatch = useDispatch()
  const searchTerm = useSelector((state) => state.intercambio.requestedSearchTerm)
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const visibleSkins = skins.filter((skin) => (
    !normalizedSearch || [
      skin.name,
      skin.catalogo?.weaponName,
      skin.catalogo?.exteriorName,
      skin.exterior,
    ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch))
  ))

  return (
    <section className="exchange-panel exchange-panel-receive">
      <header className="exchange-panel-header">
        <div className="exchange-panel-title">
          <span className="exchange-header-icon"><FaGift /></span>
          <div>
            <span className="exchange-panel-kicker">Recibís</span>
            <h2>Skins del Market</h2>
          </div>
        </div>
      </header>

      <ExchangePanelSearch
        value={searchTerm}
        onChange={(value) => dispatch(setRequestedSearchTerm(value))}
        label="Buscar en las skins que recibís"
      />

      {loading && <p className="exchange-message">Cargando skins...</p>}
      {!loading && error && <p className="exchange-message exchange-error">{error}</p>}
      {!loading && !error && visibleSkins.length === 0 && (
        <p className="exchange-message">No hay skins intercambiables con esos filtros.</p>
      )}

      {!loading && !error && visibleSkins.length > 0 && (
        <div className="exchange-item-grid">
          {visibleSkins.map((skin) => (
            <ExchangeItemCard
              key={skin.id}
              image={skin.imageUrl}
              title={skin.name}
              weapon={skin.catalogo?.weaponName}
              exterior={skin.catalogo?.exteriorName ?? skin.exterior}
              price={skin.estimatedTradePrice ?? skin.finalPrice ?? skin.precioFinal ?? skin.price}
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
