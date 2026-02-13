<template>
  <div class="w-[90%]">
    <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">📜 Logs de Auditoría</h1>

      <!-- Panel de Debug (solo visible en desarrollo) -->
      <div v-if="showDebugInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 class="font-bold text-blue-800 mb-2">🔧 Información de Debug</h3>
        <div class="text-sm space-y-1">
          <p><strong>API URL:</strong> {{ API_BASE_URL }}</p>
          <p><strong>Token presente:</strong> {{ !!getToken() }}</p>
          <p><strong>Rol de usuario:</strong> {{ userRole || 'No determinado' }}</p>
          <p><strong>Último error:</strong> {{ lastError || 'Ninguno' }}</p>
          <p><strong>Estado de carga:</strong> {{ loading ? 'Cargando' : 'Inactivo' }}</p>
          <p><strong>Logs encontrados:</strong> {{ logs.length }}</p>
        </div>
        <button 
          @click="testConnection" 
          class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Probar Conexión
        </button>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2">Cargando logs...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-bold">Error:</p>
            <p>{{ error }}</p>
            <p v-if="lastError && lastError !== error" class="text-sm mt-1">
              <strong>Detalle técnico:</strong> {{ lastError }}
            </p>
          </div>
          <button @click="showDebugInfo = !showDebugInfo" class="text-red-600 hover:text-red-800">
            {{ showDebugInfo ? '🔼' : '🔽' }}
          </button>
        </div>
      </div>

      <!-- Información sobre permisos -->
      <div v-if="error && error.includes('403')" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p class="font-bold">Problema de permisos</p>
        <p>Parece que no tienes permisos para acceder a los logs de auditoría.</p>
        <p class="text-sm mt-1">Solo los usuarios con rol 'superadmin' pueden ver esta información.</p>
      </div>

      <!-- Mostrar contenido solo si el usuario es superadmin -->
      <div v-if="userRole === 'superadmin'">
        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Acción</label>
            <select v-model="filters.action" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas</option>
              <option v-for="act in availableActions" :key="act" :value="act">
                {{ formatActionName(act) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario (email)</label>
            <input
              v-model="filters.user_email"
              type="text"
              placeholder="ej: admin@correo.com"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de recurso</label>
            <input
              v-model="filters.resource_type"
              type="text"
              placeholder="ej: user, document"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex gap-4 mb-6 flex-wrap">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input v-model="filters.date_from" type="date" class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input v-model="filters.date_to" type="date" class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Registros por página</label>
            <select v-model="filters.limit" class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <button
            @click="fetchLogs"
            :disabled="loading"
            class="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {{ loading ? 'Cargando...' : 'Filtrar' }}
          </button>
          <button
            @click="clearFilters"
            class="self-end bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>

        <!-- Información de resultados -->
        <div class="mb-4 text-sm text-gray-600">
          Mostrando {{ logs.length }} registros
          <span v-if="logs.length === parseInt(filters.limit)">(puede haber más registros)</span>
        </div>

        <!-- Tabla de logs -->
        <div v-if="logs.length > 0" class="overflow-x-auto">
          <table class="w-full border border-gray-200 rounded-lg">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(log.timestamp) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ formatActionName(log.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ log.user_email || 'Sistema' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <div v-if="log.resource_type || log.target_type">
                    <span class="font-medium">{{ log.resource_type || log.target_type }}</span>
                    <span v-if="log.resource_id || log.target_id" class="text-gray-500">
                      (ID: {{ log.resource_id || log.target_id }})
                    </span>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <button
                    @click="toggleDetails(log)"
                    class="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Ver detalles
                  </button>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ log.ip_address || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay datos -->
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          <p>No se encontraron registros de auditoría</p>
          <p class="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          <button 
            @click="showDebugInfo = true" 
            class="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Mostrar información de debug
          </button>
        </div>

        <!-- Paginación -->
        <div class="flex justify-between items-center mt-6">
          <div class="text-sm text-gray-600">
            Offset: {{ filters.offset }}
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="filters.offset === 0 || loading"
              class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="logs.length < parseInt(filters.limit) || loading"
              class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje para usuarios no superadmin -->
      <div v-else-if="userRole && userRole !== 'superadmin'" class="text-center py-8 text-gray-500">
        <p>No tienes permisos para ver los logs de auditoría</p>
        <p class="text-sm mt-2">Solo los usuarios con rol 'superadmin' pueden acceder a esta información</p>
      </div>

      <!-- Mensaje para cuando no se puede determinar el rol -->
      <div v-else-if="userRole === null" class="text-center py-8 text-gray-500">
        <p>No se pudo determinar tu rol de usuario</p>
        <p class="text-sm mt-2">Por favor, inicia sesión nuevamente</p>
        <button
          @click="redirectToLogin"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>

      <!-- Modal Detalles -->
      <div
        v-if="selectedLog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedLog = null"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-900">Detalles del Log de Auditoría</h2>
              <button
                @click="selectedLog = null"
                class="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">ID</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedLog.id }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Acción</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatActionName(selectedLog.action) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Usuario</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedLog.user_email || 'Sistema' }}
                  <span v-if="selectedLog.user_id" class="text-gray-500">(ID: {{ selectedLog.user_id }})</span>
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedLog.timestamp) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedLog.resource_type || selectedLog.target_type || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">ID del Recurso</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedLog.resource_id || selectedLog.target_id || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Dirección IP</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedLog.ip_address || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">User Agent</label>
                <p class="mt-1 text-sm text-gray-900 break-all">{{ selectedLog.user_agent || '-' }}</p>
              </div>
            </div>

            <!-- Detalles adicionales -->
            <div v-if="selectedLog.details && Object.keys(selectedLog.details).length > 0" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Detalles Adicionales</label>
              <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
                <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="selectedLog = null"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()

// Configurar la URL base de la API - Múltiples opciones de configuración
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  "http://localhost:8000"

// Estado reactivo
const logs = ref([])
const availableActions = ref([])
const selectedLog = ref(null)
const loading = ref(false)
const error = ref("")
const lastError = ref("")
const userRole = ref(null)
const showDebugInfo = ref(false)

// Filtros
const filters = ref({
  action: "",
  user_email: "",
  resource_type: "",
  date_from: "",
  date_to: "",
  limit: 20,
  offset: 0
})

// Configurar Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Obtener el token del localStorage - Múltiples ubicaciones posibles
const getToken = () => {
  return localStorage.getItem('access_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken') ||
         sessionStorage.getItem('access_token') ||
         sessionStorage.getItem('token')
}

// Configurar interceptores para incluir el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params
    })
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status}`, response.data)
    return response
  },
  (error) => {
    console.error('[API Response Error]', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    lastError.value = `${error.response?.status || 'Network'}: ${error.response?.data?.detail || error.message}`
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('access_token')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('access_token')
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)

// Función para probar la conexión
const testConnection = async () => {
  try {
    loading.value = true
    error.value = ""
    
    console.log('[Test Connection] Probando conexión con:', API_BASE_URL)
    
    // Probar endpoint de salud primero
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 })
      console.log('[Test Connection] Health check OK:', healthResponse.data)
    } catch (healthError) {
      console.warn('[Test Connection] Health check failed:', healthError.message)
    }
    
    // Probar autenticación
    const authResponse = await api.get("/auth/test-token")
    console.log('[Test Connection] Auth test OK:', authResponse.data)
    
    // Probar endpoint de auditoría
    const auditResponse = await api.get("/audit/logs", { params: { limit: 1 } })
    console.log('[Test Connection] Audit test OK:', auditResponse.data)
    
    error.value = "✅ Conexión exitosa - Todos los endpoints funcionan correctamente"
    
  } catch (err) {
    console.error('[Test Connection] Error:', err)
    error.value = `❌ Error de conexión: ${err.response?.data?.detail || err.message}`
  } finally {
    loading.value = false
  }
}

// Redirigir al login
const redirectToLogin = () => {
  console.log('[Auth] Redirigiendo al login')
  router.push('/login')
}

// Obtener el rol del usuario desde el token
const getUserRoleFromToken = () => {
  try {
    const token = getToken()
    console.log("[Token] Token encontrado:", token ? "Sí" : "No")
    
    if (!token) {
      console.error("[Token] No se encontró token")
      return null
    }
    
    // Verificar que el token tenga el formato correcto
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      console.error("[Token] Token con formato incorrecto")
      return null
    }
    
    // Decodificar el token JWT (la parte del payload)
    let payload = tokenParts[1]
    while (payload.length % 4) {
      payload += '='
    }
    
    const decodedPayload = JSON.parse(atob(payload))
    console.log("[Token] Payload decodificado:", decodedPayload)
    
    return decodedPayload.role || null
  } catch (e) {
    console.error("[Token] Error decodificando token:", e)
    return null
  }
}

// Verificar permisos con el backend
const verifyPermissionsWithBackend = async () => {
  try {
    console.log("[Auth] Verificando permisos con backend...")
    const response = await api.get("/auth/test-token")
    console.log("[Auth] Respuesta de verificación:", response.data)
    
    if (response.data && response.data.user && response.data.user.role) {
      return response.data.user.role
    }
    
    return null
  } catch (err) {
    console.error("[Auth] Error verificando permisos:", err)
    return null
  }
}

// Funciones para obtener datos
const fetchLogs = async () => {
  console.log("[Logs] Iniciando carga de logs...")
  
  // Verificar si el usuario es superadmin antes de hacer la solicitud
  if (userRole.value !== 'superadmin') {
    error.value = "No tienes permisos para ver los logs de auditoría"
    console.warn("[Logs] Usuario sin permisos:", userRole.value)
    return
  }

  loading.value = true
  error.value = ""
  lastError.value = ""
  
  try {
    // Preparar parámetros para la petición
    const params = {}
    
    // Solo agregar parámetros que no estén vacíos
    if (filters.value.action && filters.value.action !== "") {
      params.action = filters.value.action
    }
    if (filters.value.user_email && filters.value.user_email.trim() !== "") {
      params.user_email = filters.value.user_email.trim()
    }
    if (filters.value.resource_type && filters.value.resource_type.trim() !== "") {
      params.resource_type = filters.value.resource_type.trim()
    }
    
    // Formatear fechas correctamente para el backend
    if (filters.value.date_from) {
      const dateFrom = new Date(filters.value.date_from)
      dateFrom.setHours(0, 0, 0, 0)
      params.date_from = dateFrom.toISOString()
    }
    if (filters.value.date_to) {
      const dateTo = new Date(filters.value.date_to)
      dateTo.setHours(23, 59, 59, 999)
      params.date_to = dateTo.toISOString()
    }
    
    params.limit = parseInt(filters.value.limit)
    params.offset = parseInt(filters.value.offset)

    console.log("[Logs] Enviando parámetros:", params)

    const response = await api.get("/audit/logs", { params })
    
    console.log("[Logs] Respuesta recibida:", response.data)
    
    logs.value = Array.isArray(response.data) ? response.data : []
    
    if (logs.value.length === 0) {
      console.warn("[Logs] No se encontraron logs")
    }
    
  } catch (err) {
    console.error("[Logs] Error completo:", err)
    
    if (err.response?.status === 403) {
      error.value = "No tienes permisos para ver los logs de auditoría. Solo los superadministradores pueden acceder."
    } else if (err.response?.status === 404) {
      error.value = "Endpoint no encontrado. Verifica que el servidor tenga el módulo de auditoría habilitado."
    } else if (err.response?.status === 500) {
      error.value = "Error interno del servidor. Revisa los logs del backend."
    } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
      error.value = `Error de conexión. Verifica que el servidor esté ejecutándose en ${API_BASE_URL}`
    } else {
      error.value = err.response?.data?.detail || err.message || "Error al cargar los logs"
    }
    logs.value = []
  } finally {
    loading.value = false
  }
}

const fetchActions = async () => {
  // Solo intentar cargar acciones si el usuario es superadmin
  if (userRole.value !== 'superadmin') {
    return
  }

  try {
    console.log("[Actions] Cargando acciones disponibles...")
    const response = await api.get("/audit/actions")
    availableActions.value = Array.isArray(response.data) ? response.data : []
    console.log("[Actions] Acciones cargadas:", availableActions.value.length)
  } catch (err) {
    console.error("[Actions] Error cargando acciones:", err)
    // No mostrar error para esto, es opcional
  }
}

// Funciones de utilidad
const formatDate = (dateStr) => {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleString("es-ES", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

const formatActionName = (action) => {
  if (!action) return "N/A"
  
  // Mapeo de acciones a nombres legibles
  const actionMap = {
    'user_created': 'Usuario Creado',
    'user_updated': 'Usuario Actualizado',
    'user_deleted': 'Usuario Eliminado',
    'user_role_changed': 'Rol de Usuario Cambiado',
    'user_password_reset': 'Contraseña Restablecida',
    'user_login': 'Inicio de Sesión',
    'user_logout': 'Cierre de Sesión',
    'user_login_failed': 'Inicio de Sesión Fallido',
    'user_list_viewed': 'Lista de Usuarios Vista',
    'user_profile_viewed': 'Perfil de Usuario Visto',
    'user_password_changed': 'Contraseña Cambiada',
    'user_deactivated': 'Usuario Desactivado',
    'RESOURCE_READ': 'Recurso Leído',
    'RESOURCE_CREATE': 'Recurso Creado',
    'RESOURCE_UPDATE': 'Recurso Actualizado',
    'RESOURCE_DELETE': 'Recurso Eliminado',
    'RESOURCE_EXPORT': 'Recurso Exportado',
    'document_uploaded': 'Documento Subido',
    'document_updated': 'Documento Actualizado',
    'document_deleted': 'Documento Eliminado',
    'document_downloaded': 'Documento Descargado',
    'program_created': 'Programa Creado',
    'program_updated': 'Programa Actualizado',
    'program_deleted': 'Programa Eliminado',
    'report_generated': 'Reporte Generado',
    'report_downloaded': 'Reporte Descargado',
    'report_deleted': 'Reporte Eliminado'
  }
  
  return actionMap[action] || action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// Funciones de navegación
const nextPage = () => {
  filters.value.offset += parseInt(filters.value.limit)
  fetchLogs()
}

const prevPage = () => {
  if (filters.value.offset >= filters.value.limit) {
    filters.value.offset -= parseInt(filters.value.limit)
    fetchLogs()
  }
}

const clearFilters = () => {
  filters.value = {
    action: "",
    user_email: "",
    resource_type: "",
    date_from: "",
    date_to: "",
    limit: 20,
    offset: 0
  }
  fetchLogs()
}

const toggleDetails = (log) => {
  selectedLog.value = log
}

// Observar cambios en el límite para resetear offset
watch(() => filters.value.limit, () => {
  filters.value.offset = 0
})

// Montaje del componente
onMounted(async () => {
  console.log("[Init] Componente montado")
  console.log("[Init] URL base de la API:", API_BASE_URL)
  
  // Obtener el rol del usuario desde el token
  userRole.value = getUserRoleFromToken()
  console.log("[Init] Rol del usuario desde token:", userRole.value)
  
  // Si no se pudo obtener el rol del token, intentar verificar con el backend
  if (userRole.value === null) {
    console.log("[Init] Intentando verificar permisos con el backend...")
    userRole.value = await verifyPermissionsWithBackend()
    console.log("[Init] Rol del usuario desde backend:", userRole.value)
  }
  
  // Solo cargar datos si el usuario es superadmin
  if (userRole.value === 'superadmin') {
    console.log("[Init] Usuario es superadmin, cargando datos...")
    await fetchActions()
    await fetchLogs()
  } else if (userRole.value) {
    error.value = "No tienes permisos para ver los logs de auditoría. Solo los superadministradores pueden acceder."
    console.warn("[Init] Usuario sin permisos suficientes:", userRole.value)
  } else {
    error.value = "No se pudo determinar tu rol de usuario. Por favor, inicia sesión nuevamente."
    console.error("[Init] No se pudo determinar el rol del usuario")
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>