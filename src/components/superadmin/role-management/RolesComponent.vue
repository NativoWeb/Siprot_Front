<template>
  <div class="roles-management p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Roles y Permisos</h1>
      <p class="text-gray-600">Administra roles, permisos individuales y visualiza estadísticas de usuarios</p>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionStatus === 'checking'" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Verificando conexión...</p>
    </div>
    <div v-else-if="connectionStatus === 'failed'" class="text-center py-8">
      <p class="text-red-600">Error de conexión: {{ apiError }}</p>
    </div>

    <!-- Estadísticas de Usuarios por Rol -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div 
        v-for="role in rolesStats" 
        :key="role.name"
        class="bg-white rounded-lg shadow-md p-6 border-l-4"
        :class="getRoleColorClass(role.name)"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 capitalize">{{ role.display_name }}</h3>
            <p class="text-3xl font-bold mt-2" :class="getRoleTextColor(role.name)">{{ role.count }}</p>
            <p class="text-sm text-gray-500">usuarios activos</p>
          </div>
          <div class="text-4xl opacity-20">
            <i :class="getRoleIcon(role.name)"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs para alternar entre gestión por rol y por usuario -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'roles'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'roles' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Permisos por Rol
          </button>
          <button
            @click="activeTab = 'users'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'users' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Permisos Individuales
          </button>
        </nav>
      </div>
    </div>

    <!-- Gestión de Permisos por Rol -->
    <div v-if="activeTab === 'roles'" class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Permisos por Rol</h2>
        <p class="text-gray-600 mt-1">Gestiona los permisos específicos para cada rol</p>
      </div>

      <!-- Selector de Rol -->
      <div class="p-6 border-b border-gray-200">
        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rol:</label>
        <select 
          v-model="selectedRole" 
          @change="loadRolePermissions"
          class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccione un rol...</option>
          <option v-for="role in availableRoles" :key="role" :value="role">
            {{ getRoleDisplayName(role) }}
          </option>
        </select>
      </div>

      <!-- Permisos del Rol Seleccionado -->
      <div v-if="selectedRole" class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Permisos para {{ getRoleDisplayName(selectedRole) }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(permissions, resource) in groupedPermissions" 
            :key="resource"
            class="border border-gray-200 rounded-lg p-4"
          >
            <h4 class="font-semibold text-gray-800 mb-3 capitalize">{{ resource }}</h4>
            <div class="space-y-2">
              <label 
                v-for="permission in permissions" 
                :key="permission.name"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="rolePermissions.includes(permission.name)"
                  @change="togglePermission(permission.name)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ permission.description }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="mt-6 flex space-x-4">
          <button
            @click="saveRolePermissions"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
          <button
            @click="resetPermissions"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>

    <!-- Gestión de Permisos Individuales por Usuario -->
    <div v-if="activeTab === 'users'" class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Permisos Individuales por Usuario</h2>
        <p class="text-gray-600 mt-1">Asigna permisos específicos a usuarios individuales</p>
      </div>

      <!-- Lista de Usuarios -->
      <div class="p-6">
        <div v-if="loadingUsers" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="user in users" 
            :key="user.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-gray-600"></i>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ user.name || user.email }}</h4>
                  <p class="text-sm text-gray-600">{{ user.email }}</p>
                  <span 
                    class="inline-block px-2 py-1 text-xs rounded-full"
                    :class="getRoleColorClass(user.role) + ' bg-opacity-10'"
                  >
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="toggleUserPermissions(user.id)"
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {{ expandedUsers.includes(user.id) ? 'Ocultar' : 'Ver Permisos' }}
                </button>
              </div>
            </div>

            <!-- Permisos del Usuario (expandible) -->
            <div v-if="expandedUsers.includes(user.id)" class="mt-4 border-t pt-4">
              <div class="mb-4">
                <h5 class="font-medium text-gray-800 mb-2">Permisos por Rol ({{ getRoleDisplayName(user.role) }}):</h5>
                <div v-if="loadingUserPermissions[user.id]" class="text-center py-4">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <span 
                    v-for="permission in userRolePermissions[user.id] || []" 
                    :key="permission.name"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {{ permission.description }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="fixed top-4 right-4 z-50">
      <div 
        :class="[
          'px-6 py-4 rounded-lg shadow-lg text-white',
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Estado reactivo
const activeTab = ref('roles')
const rolesStats = ref([])
const selectedRole = ref('')
const rolePermissions = ref([])
const allPermissions = ref([])
const availableRoles = ref(['superadmin', 'administrativo', 'planeacion', 'instructor'])
const saving = ref(false)
const loading = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })

const users = ref([])
const loadingUsers = ref(false)
const expandedUsers = ref([])
const userRolePermissions = ref({})
const loadingUserPermissions = ref({})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Estado de conexión
const connectionStatus = ref('checking')
const apiError = ref(null)

// Computed properties
const groupedPermissions = computed(() => {
  const grouped = {}
  allPermissions.value.forEach(permission => {
    const resource = permission.resource || permission.name.split('.')[0]
    if (!grouped[resource]) {
      grouped[resource] = []
    }
    grouped[resource].push(permission)
  })
  return grouped
})

const handleAuthError = (error, context = '') => {
  console.error(`Auth error in ${context}:`, error)
  showNotification('Sesión expirada. Redirigiendo al login...', 'error')
  
  localStorage.removeItem('access_token')
  sessionStorage.removeItem('access_token')
  
  // Redirigir al login después de un breve delay
  setTimeout(() => {
    window.location.href = '/iniciar-sesion'
  }, 2000)
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || 
                sessionStorage.getItem('access_token')
  
  console.log('Looking for access_token:', token ? 'Found' : 'Not found')
  
  if (!token) {
    console.warn('No access_token found in localStorage or sessionStorage')
    return null
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

const makeAuthenticatedRequest = async (url, options = {}) => {
  if (connectionStatus.value === 'failed') {
    console.log('Connection previously failed, retesting...')
    const connected = await testConnection()
    if (!connected) {
      return null
    }
  }
  
  const headers = getAuthHeaders()
  
  if (!headers) {
    console.error('No authentication headers available')
    handleAuthError(new Error('No token available'), 'makeAuthenticatedRequest')
    return null
  }
  
  console.log('Making authenticated request to:', url)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    })
    
    console.log('Response status:', response.status)
    
    if (response.status === 401) {
      console.error('Unauthorized response - token may be expired')
      handleAuthError(new Error('Unauthorized'), 'makeAuthenticatedRequest')
      return null
    }
    
    if (!response.ok) {
      console.error('Request failed with status:', response.status)
      const errorText = await response.text()
      console.error('Error response body:', errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error('Request failed:', error)
    
    if (error.message.includes('Failed to fetch')) {
      connectionStatus.value = 'failed'
      apiError.value = `Conexión perdida con ${API_BASE_URL}`
      showNotification('Se perdió la conexión con el servidor', 'error')
    }
    
    throw error
  }
}

const calculateRolesStats = () => {
  const stats = {}
  
  // Inicializar contadores para todos los roles
  availableRoles.value.forEach(role => {
    stats[role] = 0
  })
  
  // Contar usuarios por rol
  users.value.forEach(user => {
    if (user.is_active && stats.hasOwnProperty(user.role)) {
      stats[user.role]++
    }
  })
  
  // Convertir a formato esperado
  rolesStats.value = Object.entries(stats).map(([role, count]) => ({
    name: role,
    display_name: getRoleDisplayName(role),
    count: count
  }))
}

const loadAllPermissions = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/permissions/`)
    
    if (response && response.ok) {
      allPermissions.value = await response.json()
    } else if (response) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error loading permissions:', error)
    showNotification('Error al cargar permisos', 'error')
  }
}

const loadRolePermissions = async () => {
  if (!selectedRole.value) return
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/permissions/roles/${selectedRole.value}/permissions`)
    
    if (response && response.ok) {
      const permissions = await response.json()
      rolePermissions.value = permissions.map(p => p.name)
    } else if (response) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error loading role permissions:', error)
    showNotification('Error al cargar permisos del rol', 'error')
  }
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/users/`)
    
    if (response && response.ok) {
      users.value = await response.json()
      // Calcular estadísticas después de cargar usuarios
      calculateRolesStats()
    } else if (response) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error loading users:', error)
    showNotification('Error al cargar usuarios', 'error')
  } finally {
    loadingUsers.value = false
  }
}

const loadUserPermissions = async (userId) => {
  loadingUserPermissions.value[userId] = true
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/permissions/user/${userId}/permissions`)
    
    if (response && response.ok) {
      const data = await response.json()
      userRolePermissions.value[userId] = data.permissions || []
    } else if (response) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error loading user permissions:', error)
    showNotification('Error al cargar permisos del usuario', 'error')
  } finally {
    loadingUserPermissions.value[userId] = false
  }
}

const toggleUserPermissions = async (userId) => {
  const index = expandedUsers.value.indexOf(userId)
  if (index > -1) {
    expandedUsers.value.splice(index, 1)
  } else {
    expandedUsers.value.push(userId)
    if (!userRolePermissions.value[userId]) {
      await loadUserPermissions(userId)
    }
  }
}

const saveRolePermissions = async () => {
  if (!selectedRole.value) return
  
  saving.value = true
  try {
    // Nota: Este endpoint necesitaría ser implementado en el backend
    // Por ahora solo mostramos un mensaje
    showNotification('Funcionalidad de guardado pendiente de implementar en backend', 'error')
  } catch (error) {
    console.error('Error saving permissions:', error)
    showNotification('Error al guardar permisos', 'error')
  } finally {
    saving.value = false
  }
}

const togglePermission = (permissionName) => {
  const index = rolePermissions.value.indexOf(permissionName)
  if (index > -1) {
    rolePermissions.value.splice(index, 1)
  } else {
    rolePermissions.value.push(permissionName)
  }
}

const resetPermissions = () => {
  loadRolePermissions()
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const getRoleDisplayName = (role) => {
  const names = {
    'superadmin': 'Super Administrador',
    'administrativo': 'Administrativo',
    'planeacion': 'Planeación',
    'instructor': 'Instructor'
  }
  return names[role] || role
}

const getRoleColorClass = (role) => {
  const colors = {
    'superadmin': 'border-red-500',
    'administrativo': 'border-blue-500',
    'planeacion': 'border-green-500',
    'instructor': 'border-yellow-500'
  }
  return colors[role] || 'border-gray-500'
}

const getRoleTextColor = (role) => {
  const colors = {
    'superadmin': 'text-red-600',
    'administrativo': 'text-blue-600',
    'planeacion': 'text-green-600',
    'instructor': 'text-yellow-600'
  }
  return colors[role] || 'text-gray-600'
}

const getRoleIcon = (role) => {
  const icons = {
    'superadmin': 'fas fa-crown',
    'administrativo': 'fas fa-briefcase',
    'planeacion': 'fas fa-calendar-alt',
    'instructor': 'fas fa-chalkboard-teacher'
  }
  return icons[role] || 'fas fa-user'
}

const testConnection = async () => {
  console.log('Testing API connection to:', API_BASE_URL)
  connectionStatus.value = 'checking'
  apiError.value = null
  
  try {
    // Test basic connectivity first
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Basic connectivity test - Status:', response.status)
    
    if (response.ok) {
      connectionStatus.value = 'connected'
      console.log('API connection successful')
      return true
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('API connection failed:', error)
    connectionStatus.value = 'failed'
    apiError.value = error.message
    
    // More specific error messages
    if (error.message.includes('Failed to fetch')) {
      apiError.value = `No se puede conectar al servidor en ${API_BASE_URL}. Verifica que el backend esté corriendo.`
    } else if (error.message.includes('CORS')) {
      apiError.value = 'Error de CORS. Verifica la configuración del backend.'
    }
    
    showNotification(`Error de conexión: ${apiError.value}`, 'error')
    return false
  }
}

onMounted(async () => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  
  console.log('Component mounting...')
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('access_token found:', token ? 'Yes' : 'No')
  console.log('localStorage keys:', Object.keys(localStorage))
  console.log('sessionStorage keys:', Object.keys(sessionStorage))
  
  const connected = await testConnection()
  
  if (!connected) {
    console.error('Cannot connect to API - stopping initialization')
    return
  }
  
  if (!token) {
    console.error('No access_token found - redirecting to login')
    showNotification('No se encontró token de autenticación. Redirigiendo al login...', 'error')
    setTimeout(() => {
      window.location.href = '/iniciar-sesion'
    }, 2000)
    return
  }
  
  console.log('Component mounted with valid access_token and API connection')
  loadAllPermissions()
  loadUsers()
})
</script>

<style scoped>
.roles-management {
  font-family: 'Inter', sans-serif;
}
</style>
