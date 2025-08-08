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
        <!-- Contenido de la tarjeta del documento -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ document.title }}
            </h3>
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <CalendarIcon class="h-4 w-4 mr-1" />
              <span>{{ document.year }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-400 mb-2">
              <FileIcon class="h-3 w-3 mr-1" />
              <span>{{ document.original_filename }}</span>
            </div>
          </div>
          <div class="flex-shrink-0 ml-2 flex flex-col gap-1">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getDocumentTypeBadgeClass(document.document_type)"
            >
              {{ document.document_type }}
            </span>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getFileTypeBadgeClass(document.file_extension)"
            >
              {{ document.file_extension.toUpperCase().replace('.', '') }}
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
          
          <div class="flex gap-2">
            <button
              @click="downloadDocument(document)"
              :disabled="isDownloading[document.id]"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 focus:outline-none disabled:opacity-50"
              :title="`Descargar como ${document.file_extension.toUpperCase().replace('.', '')}`"
            >
              <div v-if="isDownloading[document.id]" class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
              <DownloadIcon v-else class="h-4 w-4 mr-1" />
              {{ isDownloading[document.id] ? 'Descargando...' : 'Descargar' }}
            </button>
            
            <button 
              v-if="canDeleteDocuments"
              @click="confirmarEliminacion(document)"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
              title="Eliminar documento"
            >
              <TrashIcon class="h-4 w-4 mr-1" />
              Eliminar
            </button>
          </div>
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

    <!-- Modales -->
    <DocumentDetailModal 
      v-if="showDetailModal"
      :document="selectedDocument"
      :is-downloading="isDownloading"
      :can-delete-documents="canDeleteDocuments"
      @close="closeDetailModal"
      @download="downloadDocument"
      @edit="openEditModal"
      @replace="openReplaceModal"
    />

    <DocumentEditModal
      v-if="showEditModal"
      :document="selectedDocument"
      :is-saving="isSavingMetadata"
      @save="saveMetadata"
      @close="closeEditModal"
    />

    <DocumentReplaceModal
      v-if="showReplaceModal"
      :document="selectedDocument"
      :is-replacing="isReplacing"
      @replace="replaceDocumentFile"
      @close="closeReplaceModal"
    />

    <DocumentDeleteModal
      v-if="showDeleteModal"
      :document="documentToDelete"
      :is-deleting="isDeleting"
      @confirm="eliminarDocumento"
      @cancel="cancelarEliminacion"
    />

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
import { ref, computed, onMounted, watch, reactive } from 'vue'
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
  AlertTriangleIcon,
  TrashIcon,
  FileIcon
} from 'lucide-vue-next'
import DocumentDetailModal from './DocumentDetailModal.vue'
import DocumentEditModal from './DocumentEditModal.vue'
import DocumentReplaceModal from './DocumentReplaceModal.vue'
import DocumentDeleteModal from './DocumentDeleteModal.vue'
import type { Document, FilterOptions } from '@/types/document'

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
const showDeleteModal = ref(false)
const documentToDelete = ref<Document | null>(null)
const isDeleting = ref(false)
const showEditModal = ref(false)
const showReplaceModal = ref(false)
const isDownloading = reactive<{ [key: number]: boolean }>({})
const isReplacing = ref(false)
const isSavingMetadata = ref(false)
const newFile = ref<File | null>(null)
const userRole = ref<string>('')

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.sector || filters.value.core_line || 
         filters.value.document_type || filters.value.year
})

const canDeleteDocuments = computed(() => {
  return userRole.value === 'planeacion' || userRole.value === 'superadmin'
})

const canEditDocuments = computed(() => {
  return userRole.value === 'planeacion' || userRole.value === 'superadmin'
})

// Métodos
const getUserInfo = async () => {
  try {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      userRole.value = user.role || ''
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error)
  }
}

const fetchFilterOptions = async () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const res = await fetch('http://localhost:8000/documents/filter-options', {
      headers: { 'Authorization': `Bearer ${token}` }
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
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.sector) params.append('sector', filters.value.sector)
    if (filters.value.core_line) params.append('core_line', filters.value.core_line)
    if (filters.value.document_type) params.append('document_type', filters.value.document_type)
    if (filters.value.year) params.append('year', filters.value.year)

    const url = `http://localhost:8000/documents${params.toString() ? '?' + params.toString() : ''}`
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
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

const applyFilters = () => fetchDocuments()
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

const openEditModal = () => {
  showDetailModal.value = false
  showEditModal.value = true
}

const openReplaceModal = () => {
  showDetailModal.value = false
  showReplaceModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  showDetailModal.value = true
}

const closeReplaceModal = () => {
  showReplaceModal.value = false
  showDetailModal.value = true
}

const downloadDocument = async (document: Document | null) => {
  if (!document) return
  if (isDownloading[document.id]) return
  
  isDownloading[document.id] = true
  
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const response = await fetch(`http://localhost:8000/documents/download/${document.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al descargar el documento')
    }

    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `${document.title}${document.file_extension}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/)
      if (filenameMatch) filename = decodeURIComponent(filenameMatch[1])
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    window.document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    window.document.body.removeChild(a)
    
    showSuccess(`Descarga completada: ${filename}`)
  } catch (error: any) {
    console.error('Error al descargar documento:', error)
    showError(`Error al descargar: ${error.message}`)
  } finally {
    isDownloading[document.id] = false
  }
}

const confirmarEliminacion = (document: Document) => {
  documentToDelete.value = document
  showDeleteModal.value = true
}

const cancelarEliminacion = () => {
  showDeleteModal.value = false
  documentToDelete.value = null
}

const eliminarDocumento = async () => {
  if (!documentToDelete.value) return
  
  isDeleting.value = true
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const response = await fetch(`http://localhost:8000/documents/${documentToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al eliminar el documento')
    }

    documents.value = documents.value.filter(doc => doc.id !== documentToDelete.value!.id)
    showSuccess(`Documento "${documentToDelete.value.title}" eliminado exitosamente`)
    showDeleteModal.value = false
    documentToDelete.value = null
  } catch (error: any) {
    console.error('Error al eliminar documento:', error)
    showError(`Error al eliminar: ${error.message}`)
  } finally {
    isDeleting.value = false
  }
}

const saveMetadata = async (updatedDocument: Document) => {
  isSavingMetadata.value = true;
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No autorizado. Inicie sesión.');

    // Validación de campos requeridos
    const errors = [];
    if (!updatedDocument.title?.trim()) errors.push('El título es requerido');
    if (!updatedDocument.year || isNaN(Number(updatedDocument.year))) errors.push('Año inválido');
    if (!updatedDocument.sector?.trim()) errors.push('Sector es requerido');
    if (!updatedDocument.core_line?.trim()) errors.push('Línea medular es requerida');
    if (!updatedDocument.document_type?.trim()) errors.push('Tipo de documento es requerido');
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    // Crear FormData en lugar de JSON
    const formData = new FormData();
    formData.append('title', updatedDocument.title.trim());
    formData.append('year', String(updatedDocument.year));
    formData.append('sector', updatedDocument.sector.trim());
    formData.append('core_line', updatedDocument.core_line.trim());
    formData.append('document_type', updatedDocument.document_type.trim());
    
    if (updatedDocument.additional_notes) {
      formData.append('additional_notes', updatedDocument.additional_notes.trim());
    }

    const response = await fetch(`http://localhost:8000/documents/${updatedDocument.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No establecer Content-Type, el navegador lo hará automáticamente con FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al actualizar metadatos');
    }

    const updatedDoc = await response.json();
    documents.value = documents.value.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    );
    
    showSuccess('Documento actualizado correctamente');
    closeEditModal();
  } catch (error: any) {
    console.error('Error al guardar:', error);
    showError(error.message || 'Error al guardar cambios');
  } finally {
    isSavingMetadata.value = false;
  }
};

const replaceDocumentFile = async (file: File) => {
  if (!selectedDocument.value || !file) {
    console.error('Documento no seleccionado o archivo inválido');
    return;
  }

  isReplacing.value = true;
  showErrorNotification.value = false; // Resetear notificación de error

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }

    // Crear FormData y adjuntar archivo
    const formData = new FormData();
    formData.append('file', file);

    // Mostrar información del archivo para depuración
    console.log('Enviando archivo:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    const response = await fetch(
      `http://localhost:8000/documents/${selectedDocument.value.id}/file`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // No establecer Content-Type, el navegador lo hará automáticamente con FormData
        },
        body: formData
      }
    );

    // Manejar respuesta del servidor
    if (!response.ok) {
      let errorMessage = 'Error al reemplazar el documento';
      
      try {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
      } catch (e) {
        console.error('Error al parsear respuesta de error:', e);
      }
      
      throw new Error(errorMessage);
    }

    // Procesar respuesta exitosa
    const updatedDoc = await response.json();
    console.log('Documento actualizado:', updatedDoc);

    // Actualizar la lista de documentos manteniendo el orden
    documents.value = documents.value.map(doc => 
      doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc
    );

    // Mostrar notificación de éxito
    showSuccess(`Archivo reemplazado: ${updatedDoc.original_filename}`);
    
    // Cerrar el modal de reemplazo
    closeReplaceModal();

  } catch (error: any) {
    console.error('Error en replaceDocumentFile:', error);
    
    // Mostrar error específico al usuario
    let userErrorMessage = 'Error al reemplazar el archivo';
    
    if (error.message.includes('Tipo de archivo no permitido')) {
      userErrorMessage = 'Tipo de archivo no soportado. Use PDF, DOCX o XLSX.';
    } else if (error.message.includes('tamaño excede')) {
      userErrorMessage = 'El archivo es demasiado grande. Límite: 10MB.';
    } else {
      userErrorMessage = error.message || userErrorMessage;
    }
    
    showError(userErrorMessage);
    
  } finally {
    isReplacing.value = false;
  }
};

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

const getFileTypeBadgeClass = (extension: string) => {
  const classes: { [key: string]: string } = {
    '.pdf': 'bg-red-100 text-red-800',
    '.docx': 'bg-blue-100 text-blue-800',
    '.xlsx': 'bg-green-100 text-green-800'
  }
  return classes[extension.toLowerCase()] || 'bg-gray-100 text-gray-800'
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
  setTimeout(() => { showNotification.value = false }, 3000)
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => { showErrorNotification.value = false }, 5000)
}

// Watchers
let searchTimeout: any
watch(() => filters.value.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchDocuments(), 500)
})

// Lifecycle
onMounted(async () => {
  await getUserInfo()
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