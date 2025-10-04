<template>
  <!-- Overlay que congela la pantalla cuando hay sesión expirada -->
  <div 
    v-if="hasExpiredSessionNotification" 
    class="fixed inset-0 bg-white z-40 flex items-center justify-center"
  >
    <img 
      src="../assets/Bo.webp" 
      alt="Logo" 
      class="max-w-2xl max-h-screen object-contain"
    />
  </div>

  <!-- Contenedor fijo en la esquina superior derecha -->
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <!-- Itera sobre todas las notificaciones -->
    <div v-for="notification in notifications" :key="notification.id" class="notification-item">
      <!-- Contenedor de cada notificación -->
      <div
        class="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4"
        :class="getBorderClass(notification.type)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <!-- Icono según el tipo de notificación -->
            <div class="flex-shrink-0">
              <div v-if="notification.type === 'success'" class="h-6 w-6 text-green-400">✓</div>
              <div v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-400">✗</div>
              <div v-else-if="notification.type === 'warning'" class="h-6 w-6 text-yellow-400">⚠</div>
              <div v-else class="h-6 w-6 text-blue-400">ℹ</div>
            </div>

            <!-- Texto de la notificación -->
            <div class="ml-3 flex-1 pt-0.5 min-w-0">
              <p class="text-sm font-medium text-gray-900 break-words">
                {{ notification.message }}
              </p>

              <!-- Botón mejorado para sesión expirada con mejor styling -->
              <div
                v-if="notification.type === 'error' && notification.message.includes('sesión ha expirado')"
                class="mt-3"
              >
                <button
                  @click="goToLogin"
                  class="w-full text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium shadow-sm"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            </div>

            <!-- Botón de cierre (X) - deshabilitado para sesión expirada -->
            <div class="ml-4 flex-shrink-0 flex">
              <button
                v-if="!(notification.type === 'error' && notification.message.includes('sesión ha expirado'))"
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Cerrar</span>
                <span class="text-lg">×</span>
              </button>
            </div>
          </div>

          <!-- Barra de progreso (si la notificación tiene duración y no es sesión expirada) -->
          <div v-if="notification.duration > 0 && !(notification.type === 'error' && notification.message.includes('sesión ha expirado'))" class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-1">
              <div
                class="bg-current h-1 rounded-full progress-bar"
                :class="getProgressClass(notification.type)"
                :style="{ animationDuration: notification.duration + 'ms' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GlobalNotifications',
  setup() {
    const router = useRouter()

    // Se inyecta el sistema global de notificaciones
    const notificationSystem = inject('notifications', {
      notifications: { value: [] },
      removeNotification: () => {}
    })

    const hasExpiredSessionNotification = computed(() => {
      return notificationSystem.notifications.value.some(
        notification => notification.type === 'error' && 
        notification.message.includes('sesión ha expirado')
      )
    })

    const goToLogin = () => {
      console.log('Redirecting to login from notification button')
      // Limpiar todas las notificaciones
      notificationSystem.notifications.value = []
      // Limpiar localStorage por seguridad
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      localStorage.removeItem('user_info')
      // Redirigir al login
      router.push('/iniciar-sesion')
    }

    // Devuelve el color del borde según el tipo de notificación
    const getBorderClass = (type) => {
      switch (type) {
        case 'success': return 'border-green-400'
        case 'error': return 'border-red-400'
        case 'warning': return 'border-yellow-400'
        default: return 'border-blue-400'
      }
    }

    // Devuelve el color de la barra de progreso según el tipo
    const getProgressClass = (type) => {
      switch (type) {
        case 'success': return 'text-green-400'
        case 'error': return 'text-red-400'
        case 'warning': return 'text-yellow-400'
        default: return 'text-blue-400'
      }
    }

    return {
      notifications: notificationSystem.notifications,
      removeNotification: notificationSystem.removeNotification,
      hasExpiredSessionNotification,
      goToLogin,
      getBorderClass,
      getProgressClass
    }
  }
}
</script>

<style scoped>
/* Animación de aparición */
.notification-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Barra de progreso con animación */
.progress-bar {
  animation: progress linear forwards;
  width: 100%;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
