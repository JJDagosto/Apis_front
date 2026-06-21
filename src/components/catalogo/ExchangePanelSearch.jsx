import { FaSearch } from "react-icons/fa"

function ExchangePanelSearch({ value, onChange, label }) {
  return (
    <label className="exchange-panel-search">
      <FaSearch aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar..."
      />
    </label>
  )
}

export default ExchangePanelSearch
