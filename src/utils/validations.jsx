import { isValidSteamTradeUrl } from "./tradeProfile"

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const getRegisterPasswordError = (password, passwordRepeat) => {
  if (password !== passwordRepeat) return "Las contraseñas no coinciden."
  if (password.length < 5) return "La contraseña debe tener al menos 5 caracteres."
  if (!/[a-zA-Z]/.test(password)) return "La contraseña debe incluir al menos una letra."
  if (!/\d/.test(password)) return "La contraseña debe incluir al menos un número."
  return ""
}

export const getResetPasswordError = (password, passwordRepeat) => {
  if (password !== passwordRepeat) return "Las contraseñas no coinciden."
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres."
  return ""
}

export const getTradeUrlError = (tradeUrl) => {
  if (tradeUrl.trim() && !isValidSteamTradeUrl(tradeUrl)) {
    return "Steam Trade URL debe ser un link válido de Steam con partner y token."
  }

  return ""
}

export const getPositivePriceError = (price) => {
  const parsedPrice = Number(String(price).replace(",", "."))
  if (!parsedPrice || parsedPrice <= 0) return "El precio debe ser mayor a 0."
  return ""
}

export const getPublicationAvailabilityError = (vendible, intercambiable) => {
  if (Boolean(vendible) === Boolean(intercambiable)) {
    return "La skin debe ser vendible o intercambiable, no ambas."
  }

  return ""
}

export const getPercentRangeError = (value, label = "El descuento") => {
  const parsedValue = Number(String(value).replace(",", "."))
  if (!parsedValue || parsedValue <= 0 || parsedValue > 100) {
    return `${label} debe estar entre 1 y 100.`
  }

  return ""
}
