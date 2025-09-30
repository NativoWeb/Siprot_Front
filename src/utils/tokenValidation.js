import { showTokenExpired } from "../plugins/notifications.js"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

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

// Función para verificar si el token está próximo a expirar (30 segundos antes)
export const isTokenExpiringSoon = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    const timeUntilExpiry = payload.exp - currentTime
    
    // Si quedan menos de 30 segundos, necesita renovarse
    return timeUntilExpiry < 30
  } catch (error) {
    console.error("Error al decodificar token:", error)
    return true
  }
}

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false
let refreshPromise = null

// Función para refrescar el token automáticamente
export const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const refreshToken = localStorage.getItem("refresh_token")
  
  if (!refreshToken) {
    console.log("No refresh token available")
    return null
  }

  isRefreshing = true
  
  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${refreshToken}`,
      "Content-Type": "application/json"
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Refresh token inválido")
      }
      
      const data = await response.json()
      
      localStorage.setItem("access_token", data.access_token)
      console.log("✅ Token renovado exitosamente")
      
      return data.access_token
    })
    .catch((error) => {
      console.error("Error al refrescar token:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("role")
      localStorage.removeItem("user_info")
      return null
    })
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

export const makeAuthenticatedRequest = async (url, options = {}, router = null) => {
  let token = localStorage.getItem("access_token")

  console.log("Making authenticated request to:", url)

  if (token && isTokenExpiringSoon(token)) {
    console.log("Token expiring soon, refreshing...")
    token = await refreshAccessToken()
    
    if (!token) {
      console.log("Failed to refresh token")
      showTokenExpired(router)
      throw new Error("Token expirado")
    }
  }

  if (!token) {
    console.log("Token is missing")
    showTokenExpired(router)
    throw new Error("Token expirado")
  }

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

    if (response.status === 401) {
      console.log("Server returned 401, attempting token refresh")
      
      const newToken = await refreshAccessToken()
      
      if (!newToken) {
        console.log("Token refresh failed")
        showTokenExpired(router)
        throw new Error("Token expirado")
      }

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      }

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      })

      if (retryResponse.status === 401) {
        console.log("Still 401 after refresh, session truly expired")
        showTokenExpired(router)
        throw new Error("Token expirado")
      }

      return retryResponse
    }

    return response
  } catch (error) {
    if (error.message === "Token expirado") {
      throw error
    }

    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      console.log("Request failed with auth error")
      showTokenExpired(router)
      throw new Error("Token expirado")
    }

    throw error
  }
}

/* ------------------------
   🔒 Control de inactividad
------------------------- */
const INACTIVITY_LIMIT = 5 * 60 * 1000 // 5 minutos
let lastActivity = Date.now()

const resetActivity = () => { lastActivity = Date.now() }
window.addEventListener("mousemove", resetActivity)
window.addEventListener("keydown", resetActivity)
window.addEventListener("click", resetActivity)

const checkToken = async (router) => {
  const token = localStorage.getItem("access_token")
  if (!token) return

  const now = Date.now()
  const inactiveTime = now - lastActivity

  if (isTokenExpiringSoon(token)) {
    if (inactiveTime < INACTIVITY_LIMIT) {
      console.log("Token expiring soon, user active → auto-refreshing...")
      const newToken = await refreshAccessToken()
      if (!newToken) {
        console.log("Auto-refresh failed, token expired")
        showTokenExpired(router)
      }
    } else {
      console.log("Token expiring soon, but user inactive → letting it expire")
    }
  } else if (isTokenExpired(token)) {
    if (inactiveTime < INACTIVITY_LIMIT) {
      console.log("Token expired but user is active → trying refresh...")
      const newToken = await refreshAccessToken()
      if (!newToken) {
        console.log("Refresh failed, logging out")
        showTokenExpired(router)
      }
    } else {
      console.log("Token expired and user inactive → logging out")
      showTokenExpired(router)
    }
  }
}

// Intervalo de validación con control de inactividad
export const startTokenValidation = (router = null) => {
  console.log("Starting token validation interval with auto-refresh & inactivity control")
  return setInterval(() => checkToken(router), 15000)
}

export const validateTokenOnRouteChange = (router) => {
  console.log("Setting up route change token validation")

  router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem("access_token")

    if (to.path === "/iniciar-sesion") {
      restoreInteractions()
      next()
      return
    }

    if (!token) {
      console.log("No token found during route change")
      next("/iniciar-sesion")
      return
    }

    if (isTokenExpiringSoon(token)) {
      console.log("Token expiring soon on route change, refreshing...")
      const newToken = await refreshAccessToken()
      
      if (!newToken) {
        console.log("Failed to refresh on route change")
        showTokenExpired(router)
        next("/iniciar-sesion")
        return
      }
    } else if (isTokenExpired(token)) {
      console.log("Token expired during route change")
      showTokenExpired(router)
      next("/iniciar-sesion")
      return
    }

    next()
  })
}

export const restoreInteractions = () => {
  console.log("Restoring page interactions")
  document.body.style.pointerEvents = "auto"
}
