<template>
  <div class="container mx-auto py-6 px-4">
    <h1 class="text-2xl font-bold mb-6">Biblioteca de Documentos Estratégicos</h1>

    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
        <!-- Búsqueda por título -->
        <div class="xl:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por título</label>
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar documentos..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <!-- Filtro por sector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
          <select
            v-model="filters.sector"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los sectores</option>
            <option v-for="sector in filterOptions.sectors" :key="sector" :value="sector">
              {{ sector }}
            </option>
          </select>
        </div>

        <!-- Filtro por línea medular -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Línea Medular</label>
          <select
            v-model="filters.core_line"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las líneas</option>
            <option v-for="line in filterOptions.core_lines" :key="line" :value="line">
              {{ line }}
            </option>
          </select>
        </div>

        <!-- Filtro por tipo de documento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="filters.document_type"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option v-for="type in filterOptions.document_types" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filtro por año y botones de acción -->
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div class="w-full sm:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            v-model="filters.year"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los años</option>
            <option v-for="year in filterOptions.years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FilterIcon class="h-4 w-4 inline mr-1" />
            Filtrar
          </button>
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <XIcon class="h-4 w-4 inline mr-1" />
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-flex items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <p class="text-gray-600">Cargando documentos...</p>
      </div>
    </div>

    <!-- Lista de documentos -->
    <div v-else-if="documents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="document in documents"
        :key="document.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ document.title }}
            </h3>
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <CalendarIcon class="h-4 w-4 mr-1" />
              <span>{{ document.year }}</span>
            </div>
          </div>
          <div class="flex-shrink-0 ml-2">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getDocumentTypeBadgeClass(document.document_type)"
            >
              {{ document.document_type }}
            </span>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <BuildingIcon class="h-4 w-4 mr-2 text-gray-400" />
            <span class="font-medium">Sector:</span>
            <span class="ml-1">{{ document.sector }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <TargetIcon class="h-4 w-4 mr-2 text-gray-400" />
            <span class="font-medium">Línea:</span>
            <span class="ml-1">{{ document.core_line }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <ClockIcon class="h-4 w-4 mr-2 text-gray-400" />
            <span class="font-medium">Subido:</span>
            <span class="ml-1">{{ formatDate(document.uploaded_at) }}</span>
          </div>
        </div>

        <div v-if="document.additional_notes" class="mb-4">
          <p class="text-sm text-gray-600 line-clamp-3">
            {{ document.additional_notes }}
          </p>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            @click="viewDocument(document)"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <EyeIcon class="h-4 w-4 mr-1" />
            Ver detalles
          </button>
          <button
            @click="downloadDocument(document)"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 focus:outline-none"
          >
            <DownloadIcon class="h-4 w-4 mr-1" />
            Descargar
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12">
      <FileTextIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
      <p class="text-gray-500">
        {{ hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Aún no hay documentos cargados en el sistema.' }}
      </p>
    </div>

    <!-- Modal de detalles del documento -->
    <div v-if="showDetailModal" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
      <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true" @click="closeDetailModal"></div>
      
      <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <FileTextIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Detalles del Documento</h3>
              <div v-if="selectedDocument" class="mt-2 space-y-4">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">{{ selectedDocument.title }}</h4>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm font-medium text-gray-500">Año:</span>
                    <p class="text-sm text-gray-900">{{ selectedDocument.year }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Sector:</span>
                    <p class="text-sm text-gray-900">{{ selectedDocument.sector }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Línea Medular:</span>
                    <p class="text-sm text-gray-900">{{ selectedDocument.core_line }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Tipo:</span>
                    <p class="text-sm text-gray-900">{{ selectedDocument.document_type }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <span class="text-sm font-medium text-gray-500">Fecha de subida:</span>
                    <p class="text-sm text-gray-900">{{ formatDate(selectedDocument.uploaded_at) }}</p>
                  </div>
                </div>
                
                <div v-if="selectedDocument.additional_notes">
                  <span class="text-sm font-medium text-gray-500">Notas adicionales:</span>
                  <p class="text-sm text-gray-900 mt-1">{{ selectedDocument.additional_notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="downloadDocument(selectedDocument)"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            <DownloadIcon class="h-4 w-4 mr-1" />
            Descargar
          </button>
          <button
            @click="closeDetailModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-[9999]"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <CheckCircleIcon class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ notificationMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showNotification = false" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100">
            <XIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="showErrorNotification"
      class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-[9999]"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <AlertTriangleIcon class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <XIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  SearchIcon,
  FilterIcon,
  XIcon,
  EyeIcon,
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  BuildingIcon,
  TargetIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from 'lucide-vue-next'

// Interfaces
interface Document {
  id: number
  title: string
  year: number
  sector: string
  core_line: string
  document_type: string
  additional_notes: string | null
  file_path: string
  uploaded_by_user_id: number
  uploaded_at: string
}

interface FilterOptions {
  sectors: string[]
  core_lines: string[]
  document_types: string[]
  years: number[]
}

// Estado
const documents = ref<Document[]>([])
const filterOptions = ref<FilterOptions>({
  sectors: [],
  core_lines: [],
  document_types: [],
  years: []
})

const filters = ref({
  search: '',
  sector: '',
  core_line: '',
  document_type: '',
  year: ''
})

const isLoading = ref(true)
const showDetailModal = ref(false)
const selectedDocument = ref<Document | null>(null)
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.sector || filters.value.core_line || 
         filters.value.document_type || filters.value.year
})

// Funciones
const fetchFilterOptions = async () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No autorizado. Inicie sesión.')
    }

    const res = await fetch('http://localhost:8000/documents/filter-options', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || 'Error al obtener opciones de filtro')
    }

    filterOptions.value = await res.json()
  } catch (error: any) {
    console.error('Error al obtener opciones de filtro:', error)
    showError(`Error al cargar opciones de filtro: ${error.message}`)
  }
}

const fetchDocuments = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No autorizado. Inicie sesión.')
    }

    // Construir parámetros de consulta
    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.sector) params.append('sector', filters.value.sector)
    if (filters.value.core_line) params.append('core_line', filters.value.core_line)
    if (filters.value.document_type) params.append('document_type', filters.value.document_type)
    if (filters.value.year) params.append('year', filters.value.year)

    const url = `http://localhost:8000/documents${params.toString() ? '?' + params.toString() : ''}`
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || 'Error al obtener documentos')
    }

    documents.value = await res.json()
  } catch (error: any) {
    console.error('Error al obtener documentos:', error)
    showError(`Error al cargar documentos: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => {
  fetchDocuments()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    sector: '',
    core_line: '',
    document_type: '',
    year: ''
  }
  fetchDocuments()
}

const viewDocument = (document: Document) => {
  selectedDocument.value = document
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedDocument.value = null
}

const downloadDocument = (document: Document | null) => {
  if (!document) return
  
  // Simular descarga (en un entorno real, esto sería un endpoint de descarga)
  showSuccess(`Descargando: ${document.title}`)
  
  // En un entorno real, harías algo como:
  // window.open(`http://localhost:8000/documents/${document.id}/download`, '_blank')
}

const getDocumentTypeBadgeClass = (type: string) => {
  const classes: { [key: string]: string } = {
    'Plan de Desarrollo': 'bg-blue-100 text-blue-800',
    'Estudio Prospectivo': 'bg-green-100 text-green-800',
    'Matriz DOFA': 'bg-yellow-100 text-yellow-800',
    'Informe de Gestión': 'bg-purple-100 text-purple-800',
    'Reglamento': 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showSuccess = (message: string) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => {
    showErrorNotification.value = false
  }, 5000)
}

// Watchers
watch(() => filters.value.search, () => {
  // Auto-aplicar filtro de búsqueda con debounce
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchDocuments()
  }, 500)
})

let searchTimeout: any

// Lifecycle
onMounted(async () => {
  await fetchFilterOptions()
  await fetchDocuments()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
