import { useState } from "react"
import { FaPlus, FaWallet } from "react-icons/fa"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter"
import BalanceTopUpModal from "./BalanceTopUpModal.jsx"

function BalanceWidget({ currentUser }) {
  const [open, setOpen] = useState(false)
  const saldo = Number(currentUser.saldo ?? 0)
  const { currency, rate, formatPrice } = useCurrencyFormatter()
  const secondaryValue = currency === "ARS"
    ? `$${saldo.toFixed(2)} USD`
    : `ARS ${(saldo * rate).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <>
      <div className="balance-widget">
        <FaWallet className="balance-widget-icon" />
        <button type="button" className="balance-widget-copy" onClick={() => setOpen(true)}>
          <strong>{formatPrice(saldo)}</strong>
          <span>≈ {secondaryValue}</span>
        </button>
        <button type="button" className="balance-add-button" onClick={() => setOpen(true)} aria-label="Añadir saldo" title="Añadir saldo">
          <FaPlus />
        </button>
      </div>
      {open && <BalanceTopUpModal currentUser={currentUser} onClose={() => setOpen(false)} />}
    </>
  )
}

export default BalanceWidget
