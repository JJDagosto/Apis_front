export const isValidSteamTradeUrl = (tradeUrl) => {
  if (!tradeUrl?.trim()) return false

  try {
    const url = new URL(tradeUrl.trim())
    const validHost = url.hostname === "steamcommunity.com" || url.hostname === "www.steamcommunity.com"
    const validPath = url.pathname.startsWith("/tradeoffer/new")

    return validHost &&
      validPath &&
      Boolean(url.searchParams.get("partner")) &&
      Boolean(url.searchParams.get("token"))
  } catch {
    return false
  }
}

export const hasAliasCobro = (user) => Boolean(user?.aliasCobro?.trim() || user?.aliasMercadoPago?.trim())

export const getTradeUrlIssue = (user, action = "operar") => {
  if (isValidSteamTradeUrl(user?.tradeUrl)) return ""
  return `Necesitas cargar una Steam Trade URL valida en Mi cuenta antes de ${action}.`
}

export const getSellingSetupIssues = (user) => {
  const issues = []
  const tradeIssue = getTradeUrlIssue(user, "vender")
  if (tradeIssue) issues.push(tradeIssue)
  if (!hasAliasCobro(user)) {
    issues.push("Necesitas cargar un alias de cobro en Mi cuenta antes de vender.")
  }
  return issues
}
