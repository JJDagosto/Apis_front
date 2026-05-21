import PriceMinMax from "./PriceMinMax"

const exteriorFilters = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
]

const rarityFilters = [
  "Consumer Grade",
  "Industrial Grade",
  "Mil-Spec Grade",
  "Restricted",
  "Classified",
  "Covert",
  "Contraband",
]

const categoryFilters = [
  { label: "Rifle", value: "Rifles" },
  { label: "SMG", value: "SMGs" },
  { label: "Heavy", value: "Heavy" },
  { label: "Pistol", value: "Pistols" },
  { label: "Knife", value: "Knives" },
  { label: "Gloves", value: "Gloves" },
]

function CatalogFilters({ filters, setFilter, setPriceFilter }) {
  const filterClass = (filterName, value) =>
    filters[filterName] === value ? "filter-item active" : "filter-item"

  return (
    <div className="d-flex flex-column align-items-start catalog-filters">
      <h6>Float</h6>
      <ul>
        {exteriorFilters.map((exterior) => (
          <li
            key={exterior}
            className={filterClass("exterior", exterior)}
            onClick={() => setFilter("exterior", exterior)}
          >
            {exterior}
          </li>
        ))}
      </ul>

      <h6>Rarity</h6>
      <ul>
        {rarityFilters.map((rareza) => (
          <li
            key={rareza}
            className={filterClass("rareza", rareza)}
            onClick={() => setFilter("rareza", rareza)}
          >
            {rareza}
          </li>
        ))}
      </ul>

      <h6>Type</h6>
      <ul>
        {categoryFilters.map((categoria) => (
          <li
            key={categoria.value}
            className={filterClass("categoria", categoria.value)}
            onClick={() => setFilter("categoria", categoria.value)}
          >
            {categoria.label}
          </li>
        ))}
      </ul>

      <PriceMinMax
        precioMin={filters.precioMin}
        precioMax={filters.precioMax}
        setPrecioMin={(value) => setPriceFilter("precioMin", value)}
        setPrecioMax={(value) => setPriceFilter("precioMax", value)}
      />
    </div>
  )
}

export default CatalogFilters