export const getMercadoPagoCheckoutUrl = (data) => {
  if (!data || data.checkoutMode === "local") return ""

  const isTestKey = data.publicKey?.startsWith("TEST-")
  const preferTestCheckout = data.checkoutMode === "sandbox" || isTestKey
  const serverCheckoutUrl = data.checkoutUrl || ""
  const usableServerCheckoutUrl =
    preferTestCheckout === serverCheckoutUrl.includes("sandbox.mercadopago")
      ? serverCheckoutUrl
      : ""

  return (
    usableServerCheckoutUrl ||
    (preferTestCheckout ? data.sandboxInitPoint : data.initPoint) ||
    data.initPoint ||
    data.sandboxInitPoint ||
    ""
  )
}
