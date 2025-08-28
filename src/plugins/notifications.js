import { ref } from "vue"

// Estado global de notificaciones
const notifications = ref([])
let notificationId = 0

// Función para agregar notificación
const addNotification = (message, type = "info", duration = 5000) => {
  const id = ++notificationId
  const notification = {
    id,
    message,
    type, // 'success', 'error', 'warning', 'info'
    duration,
    timestamp: Date.now(),
  }

  notifications.value.push(notification)

  // Auto-remover después del tiempo especificado
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  return id
}

// Función para remover notificación
const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Funciones específicas para diferentes tipos
const showSuccess = (message, duration = 3000) => addNotification(message, "success", duration)
const showError = (message, duration = 5000) => addNotification(message, "error", duration)
const showWarning = (message, duration = 4000) => addNotification(message, "warning", duration)
const showInfo = (message, duration = 3000) => addNotification(message, "info", duration)

// Función específica para token expirado
const showTokenExpired = () => {
  showError("Su sesión ha expirado. Será redirigido al login en 5 segundos.", 5000)

  // Limpiar localStorage
  localStorage.removeItem("access_token")
  localStorage.removeItem("role")
  localStorage.removeItem("user_info")

  // Redirigir después de 5 segundos
  setTimeout(() => {
    window.location.href = "/login"
  }, 5000)
}

// Plugin para Vue
export default {
  install(app) {
    // Hacer disponible globalmente
    app.config.globalProperties.$notify = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
      tokenExpired: showTokenExpired,
      remove: removeNotification,
    }

    // Provide para composables
    app.provide("notifications", {
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showTokenExpired,
    })
  },
}

// Exportar para uso directo
export {
  notifications,
  addNotification,
  removeNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showTokenExpired,
}
