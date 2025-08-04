<template>
<div class="mt-12 pb-10 w-[100%] h-auto bg-[#ebebeb83] max-w-[1000px] shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
  <div class="flex flex-col justify-center mt-10 m-auto w-[90%]">
    <div class="mb-10">
      <h1 class="text-2xl font-bold mb-2">Carga de Documentos Estratégicos</h1>
      <p class="opacity-60 text-sm">Adjunte un documento y complete los metadatos para su clasificación.</p>
    </div>
    
    <form @submit.prevent="uploadDocument">
      <div class="flex flex-col gap-8 mb-10">
        <!-- Campo de selección de archivo con drag and drop -->
        <div class="flex flex-col gap-4">
          <label class="text-sm font-medium">Archivo del Documento *</label>
          
          <!-- Zona de drag and drop -->
          <div 
            class="relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200"
            :class="{
              'border-blue-400 bg-blue-50': isDragOver,
              'border-gray-300 bg-gray-50': !isDragOver && !selectedFile,
              'border-green-400 bg-green-50': selectedFile && !isDragOver
            }"
            @dragover.prevent="handleDragOver"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div v-if="!selectedFile" class="space-y-4">
              <div class="flex justify-center">
                <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-medium text-gray-700 mb-2">
                  {{ isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí' }}
                </p>
                <p class="text-sm text-gray-500 mb-4">o</p>
                <button
                  type="button"
                  @click="$refs.fileInput?.click()"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isUploading"
                >
                  <FileIcon class="h-4 w-4 mr-2" />
                  Seleccionar archivo
                </button>
              </div>
              <p class="text-xs text-gray-500">
                Formatos permitidos: PDF, DOCX, XLSX, CSV • Tamaño máximo: 50 MB
              </p>
            </div>
            
            <!-- Archivo seleccionado -->
            <div v-if="selectedFile" class="space-y-4">
              <div class="flex justify-center">
                <div class="p-3 bg-green-100 rounded-full">
                  <FileIcon class="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <p class="text-lg font-medium text-green-700 mb-1">{{ selectedFile.name }}</p>
                <p class="text-sm text-green-600">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <div class="flex justify-center gap-3">
                <button
                  type="button"
                  @click="$refs.fileInput?.click()"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                  :disabled="isUploading"
                >
                  <FileIcon class="h-4 w-4 mr-1" />
                  Cambiar archivo
                </button>
                <button
                  type="button"
                  @click="clearSelectedFile"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
                  :disabled="isUploading"
                >
                  <XIcon class="h-4 w-4 mr-1" />
                  Quitar archivo
                </button>
              </div>
            </div>
            
            <!-- Input file oculto -->
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept=".pdf,.docx,.xlsx,.csv"
              class="hidden"
              required
              :disabled="isUploading"
            />
          </div>
          
          <p v-if="fileError" class="text-red-600 text-sm flex items-center">
            <AlertTriangleIcon class="h-4 w-4 mr-1" />
            {{ fileError }}
          </p>
        </div>

        <!-- Metadatos de clasificación -->
        <div class="mb-4">
          <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Metadatos de Clasificación</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Título/Nombre del Documento *</label>
            <input 
              class="input-custom" 
              type="text" 
              v-model="documentTitle" 
              required 
              placeholder="Título del documento"
              :disabled="isUploading"
              maxlength="255"
            >
            <p v-if="documentTitle.length > 200" class="text-yellow-600 text-xs">
              {{ 255 - documentTitle.length }} caracteres restantes
            </p>
          </div>
          
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Vigencia (Año) *</label>
            <input 
              class="input-custom" 
              type="number" 
              v-model.number="documentYear" 
              required 
              placeholder="Ej: 2024" 
              :min="1900" 
              :max="currentYear + 5"
              :disabled="isUploading"
            >
          </div>
          
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Sector (Económico/Temático) *</label>
            <select 
              class="input-custom" 
              v-model="documentSector" 
              required
              :disabled="isUploading"
            >
              <option value="" disabled>Seleccione un sector</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Línea Medular (Eje Estratégico) *</label>
            <select 
              class="input-custom" 
              v-model="documentCoreLine" 
              required
              :disabled="isUploading"
            >
              <option value="" disabled>Seleccione una línea medular</option>
              <option v-for="line in coreLines" :key="line" :value="line">{{ line }}</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Tipo de Documento *</label>
            <select 
              class="input-custom" 
              v-model="documentType" 
              required
              :disabled="isUploading"
            >
              <option value="" disabled>Seleccione un tipo</option>
              <option v-for="type in documentTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Notas Adicionales</label>
            <textarea 
              v-model="additionalNotes" 
              placeholder="Información adicional sobre el documento..." 
              class="resize-none input-custom"
              rows="3"
              maxlength="500"
              :disabled="isUploading"
            ></textarea>
            <p v-if="additionalNotes.length > 400" class="text-yellow-600 text-xs">
              {{ 500 - additionalNotes.length }} caracteres restantes
            </p>
          </div>
        </div>
      </div>

      <!-- Progress bar durante la carga -->
      <div v-if="isUploading" class="mb-6">
        <div class="bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">Cargando documento... {{ uploadProgress }}%</p>
      </div>

      <div class="flex items-center justify-center gap-6 mt-8">
        <button 
          class="input-button-custom flex items-center gap-2" 
          type="submit" 
          :disabled="isUploading || !isFormValid"
        >
          <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <UploadIcon v-else class="h-4 w-4" />
          <span v-if="isUploading">Cargando...</span>
          <span v-else>Cargar Documento</span>
        </button>
        
        <button 
          class="shadow-custom bg-white cursor-pointer text-sm px-[12px] py-[7px] rounded-[6px] flex items-center gap-2" 
          type="button" 
          @click="clearForm" 
          :disabled="isUploading"
        >
          <RefreshCwIcon class="h-4 w-4" />
          Limpiar Formulario
        </button>
      </div>
    </form>
  </div>

  <!-- Notificación de éxito -->
  <div 
    v-if="showNotification"
    class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-[9999]"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <CheckCircleIcon class="h-5 w-5 text-green-400" />
      </div>
      <div class="ml-3">
        <p class="text-sm text-green-700">
          {{ notificationMessage }}
        </p>
      </div>
      <div class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button
            @click="showNotification = false"
            class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span class="sr-only">Cerrar</span>
            <XIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Notificación de error -->
  <div 
    v-if="showErrorNotification"
    class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-[9999]"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <AlertTriangleIcon class="h-5 w-5 text-red-400" />
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
      <div class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button 
            @click="showErrorNotification = false"
            class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span class="sr-only">Cerrar</span>
            <XIcon class="h-5 w-5"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  CheckCircleIcon, 
  XIcon, 
  AlertTriangleIcon, 
  FileIcon, 
  UploadIcon, 
  RefreshCwIcon 
} from 'lucide-vue-next'

// Form state
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const documentTitle = ref('')
const documentYear = ref<number | null>(null)
const documentSector = ref('')
const documentCoreLine = ref('')
const documentType = ref('')
const additionalNotes = ref('')

// UI state
const isUploading = ref(false)
const uploadProgress = ref(0)
const fileError = ref('')
const isDragOver = ref(false)
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')

// Data for dropdowns
const sectors = ref<string[]>([
  'Tecnología', 
  'Turismo', 
  'Agroindustria', 
  'Salud', 
  'Construcción',
  'Educación',
  'Comercio',
  'Servicios',
  'Manufactura',
  'Transporte'
])

const coreLines = ref<string[]>([
  'Innovación y Desarrollo', 
  'Formación para el Trabajo', 
  'Emprendimiento', 
  'Investigación Aplicada',
  'Desarrollo Sostenible',
  'Competitividad',
  'Internacionalización'
])

const documentTypes = ref<string[]>([
  'Plan de Desarrollo', 
  'Estudio Prospectivo', 
  'Matriz DOFA', 
  'Informe de Gestión', 
  'Reglamento',
  'Manual de Procedimientos',
  'Política Institucional',
  'Proyecto Educico',
  'Datos CSV'
])

const currentYear = new Date().getFullYear()

// Computed properties
const isFormValid = computed(() => {
  return selectedFile.value && 
         documentTitle.value.trim() && 
         documentYear.value && 
         documentSector.value && 
         documentCoreLine.value && 
         documentType.value &&
         !fileError.value
})

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateFile = (file: File): string | null => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'application/vnd.ms-excel'
  ]
  
  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.csv']
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const maxSize = 50 * 1024 * 1024 // 50 MB

  // Verificar por extensión (algunos navegadores no reportan correctamente el tipo MIME para CSV)
  if (!allowedExtensions.includes('.' + (fileExtension || ''))) {
    return 'Formato de archivo no permitido. Use PDF, DOCX, XLSX o CSV.'
  }

  if (!allowedTypes.includes(file.type) && file.type !== '') {
    return 'Formato de archivo no permitido. Use PDF, DOCX, XLSX o CSV.'
  }
  
  if (file.size > maxSize) {
    return 'El archivo excede el tamaño máximo permitido (50 MB).'
  }
  
  if (file.size === 0) {
    return 'El archivo está vacío.'
  }

  return null
}

// File handling
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const validationError = validateFile(file)
    
    if (validationError) {
      fileError.value = validationError
      selectedFile.value = null
      if (fileInput.value) fileInput.value.value = ''
      return
    }
    
    fileError.value = ''
    selectedFile.value = file
  } else {
    selectedFile.value = null
    fileError.value = ''
  }
}

const clearSelectedFile = () => {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Drag and drop handlers
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (isUploading.value) return
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const validationError = validateFile(file)
    
    if (validationError) {
      fileError.value = validationError
      selectedFile.value = null
      return
    }
    
    fileError.value = ''
    selectedFile.value = file
    
    // Actualizar el input file para mantener consistencia
    if (fileInput.value) {
      // Crear un nuevo FileList con el archivo arrastrado
      const dt = new DataTransfer()
      dt.items.add(file)
      fileInput.value.files = dt.files
    }
  }
}

// Form validation
const validateForm = (): string | null => {
  if (!selectedFile.value) {
    return 'Debe seleccionar un archivo para cargar.'
  }
  
  if (!documentTitle.value.trim()) {
    return 'El título del documento es obligatorio.'
  }
  
  if (documentTitle.value.length > 255) {
    return 'El título no puede exceder 255 caracteres.'
  }
  
  if (!documentYear.value) {
    return 'El año de vigencia es obligatorio.'
  }
  
  if (documentYear.value < 1900 || documentYear.value > currentYear + 5) {
    return `El año debe estar entre 1900 y ${currentYear + 5}.`
  }
  
  if (!documentSector.value) {
    return 'Debe seleccionar un sector.'
  }
  
  if (!documentCoreLine.value) {
    return 'Debe seleccionar una línea medular.'
  }
  
  if (!documentType.value) {
    return 'Debe seleccionar un tipo de documento.'
  }
  
  if (additionalNotes.value.length > 500) {
    return 'Las notas adicionales no pueden exceder 500 caracteres.'
  }

  return null
}

// Form submission
const uploadDocument = async () => {
  // Validación del formulario
  const validationError = validateForm()
  if (validationError) {
    showError(validationError)
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  fileError.value = ''

  const formData = new FormData()
  formData.append('file', selectedFile.value!)
  formData.append('title', documentTitle.value.trim())
  formData.append('year', documentYear.value!.toString())
  formData.append('sector', documentSector.value)
  formData.append('core_line', documentCoreLine.value)
  formData.append('document_type', documentType.value)
  if (additionalNotes.value.trim()) {
    formData.append('additional_notes', additionalNotes.value.trim())
  }

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No autorizado. Inicie sesión.')
    }

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10
      }
    }, 200)

    const res = await fetch('http://localhost:8000/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!res.ok) {
      const errorData = await res.json()
      let errorMessage = 'Error al cargar el documento'

      if (res.status === 413) {
        errorMessage = 'El archivo es demasiado grande. Tamaño máximo permitido: 50 MB.'
      } else if (res.status === 415) {
        errorMessage = 'Formato de archivo no soportado. Use PDF, DOCX, XLSX o CSV.'
      } else if (res.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.'
      } else if (res.status === 403) {
        errorMessage = 'No tiene permisos para cargar documentos.'
      } else if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || e.message || e).join(', ')
        } else {
          errorMessage = errorData.detail
        }
      }

      throw new Error(errorMessage)
    }

    const data = await res.json()
    console.log('Document uploaded:', data)
    showSuccess(`Documento "${documentTitle.value}" cargado exitosamente!`)
    clearForm()

  } catch (error: any) {
    console.error('Error al cargar documento:', error)
    uploadProgress.value = 0
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showError('Error de conexión. Verifique su conexión a internet e intente nuevamente.')
    } else {
      showError(error.message || 'Ocurrió un error inesperado al cargar el documento.')
    }
  } finally {
    isUploading.value = false
    setTimeout(() => {
      uploadProgress.value = 0
    }, 2000)
  }
}

// Clear form
const clearForm = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedFile.value = null
  documentTitle.value = ''
  documentYear.value = null
  documentSector.value = ''
  documentCoreLine.value = ''
  documentType.value = ''
  additionalNotes.value = ''
  fileError.value = ''
  uploadProgress.value = 0
}

// Notification functions
const showSuccess = (message: string) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => {
    showErrorNotification.value = false
  }, 8000)
}

// Lifecycle
onMounted(() => {
  // Aquí podrías cargar las opciones desde el backend si es necesario
  // fetchSectors()
  // fetchCoreLines()
  // fetchDocumentTypes()
})
</script>

<style scoped>
.input-custom {
  padding: 0.5rem 1rem;
  border-width: 1px;
  border-color: #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-custom:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-custom:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input-button-custom {
  background-color: #08ac04;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.875rem;
  border: none;
  outline: none;
}

.input-button-custom:hover:not(:disabled) {
  background-color: #067a03;
  transform: translateY(-1px);
}

.input-button-custom:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.shadow-custom {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.shadow-custom:hover:not(:disabled) {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>