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

// Opciones de orden. El value lo interpreta Catalogo.jsx al ordenar el array.
const sortOptions = [
  { label: "Relevancia", value: "" },
  { label: "Precio: menor a mayor", value: "precio_asc" },
  { label: "Precio: mayor a menor", value: "precio_desc" },
  { label: "Nombre: A-Z", value: "nombre_az" },
  { label: "Nombre: Z-A", value: "nombre_za" },
]

function CatalogFilters({
  filters,
  setFilter,
  setPriceFilter,
  toggleBoolFilter,
  orden,
  setOrden,
}) {
  const filterClass = (filterName, value) =>
    filters[filterName] === value ? "filter-item active" : "filter-item"

  // Para toggles booleanos (intercambiable/vendible) el "active" depende de true/false.
  const boolFilterClass = (filterName) =>
    filters[filterName] ? "filter-item active" : "filter-item"

  return (
    <div className="d-flex flex-column align-items-start catalog-filters">
      <h6>Ordenar</h6>
      <select
        id="ordenar"
        className="text-light mb-3"
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <h6>Disponibilidad</h6>
      <ul>
        <li
          className={boolFilterClass("intercambiable")}
          onClick={() => toggleBoolFilter("intercambiable")}
        >
          Intercambiable
        </li>
        <li
          className={boolFilterClass("vendible")}
          onClick={() => toggleBoolFilter("vendible")}
        >
          Vendible
        </li>
      </ul>

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
