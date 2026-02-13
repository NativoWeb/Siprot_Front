<template>
  <div class="w-[90%]">
    <!-- Header -->
    <header class="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Sectores Económicos</h1>
            <p class="mt-2 text-green-100">
              Gestión de sectores económicos del territorio
            </p>
          </div>
          <!-- Simplified header with just create button -->
          <button
            @click="openCreateModal"
            class="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Sector
          </button>
        </div>
      </div>
    </header>

    <!-- Simplified search section -->
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="relative">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar sector..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <!-- Simple sectors list with edit/delete actions -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Lista de Sectores</h2>
        </div>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-2 text-gray-600">Cargando sectores...</span>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="filteredSectors.length === 0" class="text-center py-12">
          <SearchIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-xl font-medium text-gray-600">No se encontraron sectores</h3>
          <p class="text-gray-500 mt-2">
            {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer sector' }}
          </p>
        </div>

        <!-- Sectors table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sector in filteredSectors" :key="sector.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ sector.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 max-w-xs truncate">
                    {{ sector.description || 'Sin descripción' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="sector.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ sector.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="editSector(sector)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Editar"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="toggleSectorStatus(sector)"
                      :class="sector.is_active 
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50'"
                      class="p-1 rounded"
                      :title="sector.is_active ? 'Desactivar' : 'Activar'"
                    >
                      <XIcon v-if="sector.is_active" class="h-4 w-4" />
                      <CheckIcon v-else class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Added error notification -->
    <div v-if="showErrorNotification" class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 001.414-1.414L11.414 10l4.293 4.293a1 1 0 00-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 00-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Agregado modal para crear/editar sector -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Editar Sector' : 'Nuevo Sector Económico' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Sector *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Agricultura, Manufactura, Servicios..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descripción del sector económico..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Sector') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Agregada notificación de éxito -->
    <div v-if="showSuccessNotification" class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showSuccessNotification = false" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 001.414-1.414L11.414 10l4.293 4.293a1 1 0 00-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 00-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  SearchIcon, 
  PencilIcon,
  XIcon,
  CheckIcon
} from '@heroicons/vue/outline'

const isLoading = ref(false)
const showErrorNotification = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const sectors = ref([])

const editSector = (sector) => {
  isEditing.value = true
  form.value = {
    id: sector.id,
    name: sector.name,
    description: sector.description || ''
  }
  showModal.value = true
}

const toggleSectorStatus = async (sector) => {
  try {
    const token = localStorage.getItem('access_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 1

    const response = await fetch(`http://localhost:8000/catalogs/sectors/${sector.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: sector.name,
        description: sector.description,
        is_active: !sector.is_active,
        created_by: userId
      })
    })

    if (response.ok) {
      const message = sector.is_active ? 'Sector desactivado' : 'Sector activado'
      showSuccess(message)
      await fetchEconomicSectors()
    } else {
      throw new Error('Error al actualizar el estado del sector')
    }
  } catch (error) {
    console.error('Error toggling sector status:', error)
    showError('Error al cambiar el estado del sector')
  }
}

const fetchEconomicSectors = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/catalogs/sectors/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      sectors.value = data
    } else {
      throw new Error('Error al cargar sectores económicos')
    }
  } catch (error) {
    console.error('Error loading economic sectors:', error)
    showError('Error al cargar los sectores económicos desde el servidor')
  } finally {
    isLoading.value = false
  }
}

const showError = (message) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => {
    showErrorNotification.value = false
  }, 5000)
}

const filteredSectors = computed(() => {
  return sectors.value.filter(sector => {
    const matchesSearch = 
      searchTerm.value === '' || 
      sector.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (sector.description && sector.description.toLowerCase().includes(searchTerm.value.toLowerCase()))
    
    return matchesSearch
  })
})

onMounted(() => {
  fetchEconomicSectors()
})

const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const showSuccessNotification = ref(false)
const successMessage = ref('')

const form = ref({
  name: '',
  description: ''
})

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    description: ''
  }
}

const submitForm = async () => {
  // Check for duplicates
  const existingSector = sectors.value.find(sector => 
    sector.name.toLowerCase().trim() === form.value.name.toLowerCase().trim() &&
    sector.id !== form.value.id
  )
  
  if (existingSector) {
    showError('Ya existe un sector con este nombre')
    return
  }

  isSubmitting.value = true
  try {
    const token = localStorage.getItem('access_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 1
    
    const url = isEditing.value 
      ? `http://localhost:8000/catalogs/sectors/${form.value.id}`
      : 'http://localhost:8000/catalogs/sectors'
    
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const requestData = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      is_active: true,
      created_by: userId
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (response.ok) {
      const message = isEditing.value ? 'Sector actualizado exitosamente' : 'Sector creado exitosamente'
      showSuccess(message)
      closeModal()
      await fetchEconomicSectors()
    } else {
      let errorMessage = 'Error al guardar el sector'
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        }
      } catch (parseError) {
        errorMessage = `Error ${response.status}: ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Error saving sector:', error)
    showError(error.message)
  } finally {
    isSubmitting.value = false
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  showSuccessNotification.value = true
  setTimeout(() => {
    showSuccessNotification.value = false
  }, 5000)
}
</script>
