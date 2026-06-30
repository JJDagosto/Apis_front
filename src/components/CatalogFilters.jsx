import DisponibilidadFilter from "./catalogo/filters/DisponibilidadFilter.jsx"
import ExteriorFilter from "./catalogo/filters/ExteriorFilter.jsx"
import RarezaFilter from "./catalogo/filters/RarezaFilter.jsx"
import ArmaFilter from "./catalogo/filters/ArmaFilter.jsx"
import PrecioFilter from "./catalogo/filters/PrecioFilter.jsx"

function CatalogFilters({ showAvailability = true }) {
  return (
    <div className="d-flex flex-column align-items-start catalog-filters">
      {showAvailability && <DisponibilidadFilter />}
      <ExteriorFilter />
      <RarezaFilter />
      <ArmaFilter />
      <PrecioFilter />
    </div>
  )
}

export default CatalogFilters
