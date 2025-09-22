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

export const makeAuthenticatedRequest = async (url, options = {}, router = null) => {
  const token = localStorage.getItem("access_token")

  console.log("Making authenticated request to:", url)

  // Verificar si el token existe y no está expirado
  if (!token || isTokenExpired(token)) {
    console.log("Token is missing or expired")
    showTokenExpired(router)
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
      console.log("Server returned 401, token expired")
      showTokenExpired(router)
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
      console.log("Request failed with auth error")
      showTokenExpired(router)
      throw new Error("Token expirado")
    }

    throw error
  }
}

export const startTokenValidation = (router = null) => {
  console.log("Starting token validation interval")

  const checkToken = () => {
    const token = localStorage.getItem("access_token")
    if (token && isTokenExpired(token)) {
      console.log("Token validation failed, token expired")
      showTokenExpired(router)
    }
  }

  return setInterval(checkToken, 10000) // Check every 10 seconds
}

export const validateTokenOnRouteChange = (router) => {
  console.log("Setting up route change token validation")

  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("access_token")

    // Skip validation for login page
    if (to.path === "/iniciar-sesion") {
      restoreInteractions()
      next()
      return
    }

    // Check if token exists and is valid for protected routes
    if (token && isTokenExpired(token)) {
      console.log("Token expired during route change")
      showTokenExpired(router)
      next("/iniciar-sesion")
      return
    }

    next()
  })
}

export const restoreInteractions = () => {
  console.log("[v0] Restoring page interactions")
  document.body.style.pointerEvents = "auto"
}
