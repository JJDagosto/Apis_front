const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const clampDiscount = (value) => Math.min(Math.max(toNumber(value), 0), 1)

export const formatCartPrice = (value) => `$${toNumber(value).toFixed(2)}`

export const getCartTotals = (items = []) => {
  const lineItems = items.map((item) => {
    const quantity = Math.max(1, toNumber(item.cantidad ?? item.quantity, 1))
    const skin = item.skin ?? {}
    const discountRate = clampDiscount(skin.discount ?? item.discount)
    const originalUnitPrice = toNumber(
      skin.price ?? item.precioOriginal ?? item.precioUnitario,
    )
    const discountedUnitPrice = discountRate > 0
      ? originalUnitPrice * (1 - discountRate)
      : originalUnitPrice
    const finalUnitPrice = toNumber(
      skin.finalPrice ?? item.precioFinal ?? item.precioUnitario,
      discountedUnitPrice,
    )
    const originalLineTotal = originalUnitPrice * quantity
    const finalLineTotal = finalUnitPrice * quantity
    const skinDiscountAmount = Math.max(0, originalLineTotal - finalLineTotal)

    return {
      ...item,
      quantity,
      discountRate,
      originalUnitPrice,
      finalUnitPrice,
      originalLineTotal,
      finalLineTotal,
      skinDiscountAmount,
    }
  })

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.originalLineTotal,
    0,
  )
  const skinDiscountTotal = lineItems.reduce(
    (sum, item) => sum + item.skinDiscountAmount,
    0,
  )
  const totalBeforeCoupon = lineItems.reduce(
    (sum, item) => sum + item.finalLineTotal,
    0,
  )
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    lineItems,
    itemCount,
    publicationCount: items.length,
    subtotal,
    skinDiscountTotal,
    totalBeforeCoupon,
  }
}
