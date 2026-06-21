export const DEFAULT_USD_TO_ARS = 1451.02

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const formatCurrency = (
  valueUsd,
  currency = "USD",
  usdToArs = DEFAULT_USD_TO_ARS,
) => {
  const amountUsd = toFiniteNumber(valueUsd)

  if (currency === "ARS") {
    const amountArs = amountUsd * toFiniteNumber(usdToArs, DEFAULT_USD_TO_ARS)
    return `ARS ${amountArs.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return `$${amountUsd.toFixed(2)}`
}
