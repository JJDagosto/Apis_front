import { useSelector } from "react-redux"
import { DEFAULT_USD_TO_ARS, formatCurrency } from "../utils/currency"

function useCurrencyFormatter() {
  const currency = useSelector((state) => state.app.currency)
  const rate = useSelector(
    (state) => Number(state.auth.currentUser?.usdToArs ?? DEFAULT_USD_TO_ARS),
  )

  return {
    currency,
    rate,
    formatPrice: (valueUsd) => formatCurrency(valueUsd, currency, rate),
  }
}

export default useCurrencyFormatter
