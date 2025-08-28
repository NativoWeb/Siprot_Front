import { showTokenExpired } from "../plugins/notifications.js"

// Función para verificar si el token está expirado
export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error al decodificar token:", error)
    return true
  }
}

// Función para hacer peticiones autenticadas con manejo de token expirado
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("access_token")

  // Verificar si el token existe y no está expirado
  if (!token || isTokenExpired(token)) {
    showTokenExpired()
    throw new Error("Token expirado")
  }

  // Configurar headers con el token
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Si la respuesta es 401, el token expiró en el servidor
    if (response.status === 401) {
      showTokenExpired()
      throw new Error("Token expirado")
    }

    return response
  } catch (error) {
    // Si es un error de red o token expirado, manejarlo
    if (error.message === "Token expirado") {
      throw error
    }

    // Para otros errores, verificar si podría ser token expirado
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      showTokenExpired()
      throw new Error("Token expirado")
    }

    throw error
  }
}

// Función para verificar token periódicamente
export const startTokenValidation = () => {
  const checkToken = () => {
    const token = localStorage.getItem("access_token")
    if (token && isTokenExpired(token)) {
      showTokenExpired()
    }
  }

  // Verificar cada 30 segundos
  return setInterval(checkToken, 30000)
}
