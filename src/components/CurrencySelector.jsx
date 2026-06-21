import { useState } from "react"
import { FaChevronDown } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { setCurrency } from "../Redux/appSlice"

function CurrencySelector() {
  const dispatch = useDispatch()
  const currency = useSelector((state) => state.app.currency)
  const [open, setOpen] = useState(false)

  const selectCurrency = (nextCurrency) => {
    dispatch(setCurrency(nextCurrency))
    setOpen(false)
  }

  return (
    <div className="currency-selector">
      <button
        type="button"
        className="currency-selector-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        title="Cambiar moneda"
      >
        <span
          className={`currency-flag currency-flag-${currency.toLowerCase()}`}
          aria-label={currency === "ARS" ? "Argentina" : "Estados Unidos"}
        />
        <span>{currency}</span>
        <FaChevronDown className={open ? "open" : ""} />
      </button>

      {open && (
        <div className="currency-menu" role="menu">
          {[
            ["ARS", "Pesos argentinos"],
            ["USD", "Dólares estadounidenses"],
          ].map(([code, label]) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currency === code}
              className={currency === code ? "active" : ""}
              key={code}
              onClick={() => selectCurrency(code)}
            >
              <strong>{code}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrencySelector
