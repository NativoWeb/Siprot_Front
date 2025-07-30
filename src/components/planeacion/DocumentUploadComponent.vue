<template>
<div class="mt-12 pb-10 w-[100%] h-auto bg-[#ebebeb83] max-w-[1000px] shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
  <div class="flex flex-col justify-center mt-10 m-auto w-[90%]">
    <div class="mb-10">
      <h1 class="text-2xl font-bold mb-2">Carga de Documentos Estratégicos</h1>
      <p class="opacity-60 text-sm">Adjunte un documento y complete los metadatos para su clasificación.</p>
    </div>
    <form @submit.prevent="uploadDocument">
      <div class="flex flex-col gap-8 mb-10">
        <!-- Campo de selección de archivo -->
        <div class="flex flex-col gap-4">
          <label class="text-sm font-medium">Archivo del Documento *</label>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".pdf,.docx,.xlsx"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            required
          />
          <p v-if="fileError" class="text-red-600 text-sm">{{ fileError }}</p>
        </div>

        <!-- Metadatos de clasificación -->
        <div class="mb-4">
          <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Metadatos de Clasificación</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Título/Nombre del Documento *</label>
            <input class="input-custom" type="text" v-model="documentTitle" required placeholder="Título del documento">
          </div>
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Vigencia (Año) *</label>
            <input class="input-custom" type="number" v-model="documentYear" required placeholder="Ej: 2024" min="1900" :max="currentYear">
          </div>
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Sector (Económico/Temático) *</label>
            <select class="input-custom" v-model="documentSector" required>
              <option value="" disabled>Seleccione un sector</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Línea Medular (Eje Estratégico) *</label>
            <select class="input-custom" v-model="documentCoreLine" required>
              <option value="" disabled>Seleccione una línea medular</option>
              <option v-for="line in coreLines" :key="line" :value="line">{{ line }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Tipo de Documento *</label>
            <select class="input-custom" v-model="documentType" required>
              <option value="" disabled>Seleccione un tipo</option>
              <option v-for="type in documentTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium">Notas Adicionales</label>
            <textarea v-model="additionalNotes" placeholder="Información adicional sobre el documento..." class="resize-none input-custom"></textarea>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mt-8">
        <button class="input-button-custom" type="submit" :disabled="isUploading">
          <span v-if="isUploading">Cargando...</span>
          <span v-else>Cargar Documento</span>
        </button>
        <button class="shadow-custom bg-white cursor-pointer text-sm px-[12px] py-[7px] rounded-[6px]" type="button" @click="clearForm" :disabled="isUploading">
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
import { ref, onMounted } from 'vue'
import { CheckCircleIcon, XIcon, AlertTriangleIcon } from 'lucide-vue-next'

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
const fileError = ref('')
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')

// Data for dropdowns (mocked for now, would come from backend)
const sectors = ref<string[]>(['Tecnología', 'Turismo', 'Agroindustria', 'Salud', 'Construcción'])
const coreLines = ref<string[]>(['Innovación y Desarrollo', 'Formación para el Trabajo', 'Emprendimiento', 'Investigación Aplicada'])
const documentTypes = ref<string[]>(['Plan de Desarrollo', 'Estudio Prospectivo', 'Matriz DOFA', 'Informe de Gestión', 'Reglamento'])

const currentYear = new Date().getFullYear();

// File handling
const handleFileChange = (event: Event) => {
const target = event.target as HTMLInputElement
if (target.files && target.files.length > 0) {
  const file = target.files[0]
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const maxSize = 50 * 1024 * 1024 // 50 MB

  fileError.value = ''
  if (!allowedTypes.includes(file.type)) {
    fileError.value = 'Formato de archivo no permitido. Use PDF, DOCX o XLSX.'
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = '' // Clear file input
    return
  }
  if (file.size > maxSize) {
    fileError.value = 'El archivo excede el tamaño máximo permitido (50 MB).'
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = '' // Clear file input
    return
  }
  selectedFile.value = file
} else {
  selectedFile.value = null
}
}

// Form submission
const uploadDocument = async () => {
if (!selectedFile.value) {
  fileError.value = 'Debe seleccionar un archivo para cargar.'
  return
}
if (!documentTitle.value || !documentYear.value || !documentSector.value || !documentCoreLine.value || !documentType.value) {
  showError('Por favor, complete todos los campos obligatorios (*).')
  return
}

isUploading.value = true
fileError.value = '' // Clear any previous file errors

const formData = new FormData()
formData.append('file', selectedFile.value)
formData.append('title', documentTitle.value)
formData.append('year', documentYear.value.toString())
formData.append('sector', documentSector.value)
formData.append('core_line', documentCoreLine.value)
formData.append('document_type', documentType.value)
formData.append('additional_notes', additionalNotes.value)

try {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No autorizado. Inicie sesión.');
  }

  const res = await fetch('http://localhost:8000/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Error al cargar el documento');
  }

  const data = await res.json();
  console.log('Document uploaded:', data);
  showSuccess('Documento cargado exitosamente!');
  clearForm();

} catch (error: any) {
  console.error('Error al cargar documento:', error);
  showError(`Error al cargar documento: ${error.message || 'Ocurrió un error inesperado.'}`);
} finally {
  isUploading.value = false;
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
}

// Notification functions
const showSuccess = (message: string) => {
notificationMessage.value = message;
showNotification.value = true;
setTimeout(() => {
  showNotification.value = false;
}, 3000);
};

const showError = (message: string) => {
errorMessage.value = message;
showErrorNotification.value = true;
setTimeout(() => {
  showErrorNotification.value = false;
}, 5000);
};

onMounted(() => {
// You might fetch initial data for dropdowns here if they come from backend
// fetchSectors();
// fetchCoreLines();
// fetchDocumentTypes();
});
</script>

<style scoped>
.input-custom {
padding: 0.5rem 1rem;
border-width: 1px;
border-color: #d1d5db; /* gray-300 */
border-radius: 0.375rem; /* rounded-md */
outline: none;
--tw-ring-color: #3b82f6; /* blue-500 */
--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
border-color: #3b82f6; /* blue-500 */
}
.input-button-custom {
background-color: #08ac04;
color: #ffffff;
padding: 0.5rem 1rem;
border-radius: 0.375rem; /* rounded-md */
transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 200ms;
cursor: pointer;
font-size: 0.875rem; /* text-sm */
}
.input-button-custom:hover {
background-color: #067a03; /* A darker green for hover */
}
.shadow-custom {
box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
</style>
