<template>
  <!-- Contenedor fijo en la esquina superior derecha -->
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <!-- Itera sobre todas las notificaciones -->
    <div v-for="notification in notifications" :key="notification.id" class="notification-item">
      <!-- Contenedor de cada notificación -->
      <div
        class="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4"
        :class="getBorderClass(notification.type)" <!-- Borde de color según el tipo -->
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

              <!-- Botón especial en caso de error de sesión expirada -->
              <div
                v-if="notification.type === 'error' && notification.message.includes('sesión ha expirado')"
                class="mt-2"
              >
                <button
                  @click="goToLogin"
                  class="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Ir al Login
                </button>
              </div>
            </div>

            <!-- Botón de cierre (X) -->
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Cerrar</span>
                <span class="text-lg">×</span>
              </button>
            </div>
          </div>

          <!-- Barra de progreso (si la notificación tiene duración) -->
          <div v-if="notification.duration > 0" class="mt-2">
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
import { inject } from 'vue'
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

    // Redirigir al login en caso de sesión expirada
    const goToLogin = () => {
      console.log('[v0] Redirecting to login from notification button')
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
      notifications: notificationSystem.notifications, // Lista reactiva de notificaciones
      removeNotification: notificationSystem.removeNotification, // Método para cerrarlas
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
