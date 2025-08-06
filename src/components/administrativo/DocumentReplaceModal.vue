<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true" @click="$emit('close')"></div>
    
    <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
            <RefreshCwIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Reemplazar Documento</h3>
            <div v-if="document">
              <p class="text-sm text-gray-500 mb-4">Selecciona un nuevo archivo para reemplazar: <strong>{{ document.original_filename }}</strong></p>
              
              <!-- Mostrar errores de validación -->
              <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {{ errorMessage }}
              </div>
              
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileChange" 
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf,.docx,.xlsx"
              />
              <p class="mt-2 text-xs text-gray-500">Formatos permitidos: PDF, DOCX, XLSX</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="replaceFile"
          :disabled="isReplacing || !selectedFile"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
        >
          <span v-if="isReplacing" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Reemplazando...
          </span>
          <span v-else>Reemplazar Archivo</span>
        </button>
        <button
          @click="$emit('close')"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCwIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import type { Document } from '@/types/document'

const props = defineProps({
  document: {
    type: Object as () => Document,
    required: true
  },
  isReplacing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'replaced'])

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const errorMessage = ref<string | null>(null)

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx']

const handleFileChange = (event: Event) => {
  errorMessage.value = null
  const input = event.target as HTMLInputElement
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errorMessage.value = `Tipo de archivo no permitido: ${file.type}`
      resetFileInput()
      return
    }
    
    // Validar extensión
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      errorMessage.value = `Extensión de archivo no permitida: ${fileExtension}`
      resetFileInput()
      return
    }
    
    selectedFile.value = file
  }
}

const resetFileInput = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const replaceFile = async () => {
  if (!selectedFile.value || !props.document) return
  
  try {
    emit('replace', selectedFile.value)
  } catch (error) {
    errorMessage.value = 'Error al reemplazar el archivo. Intente nuevamente.'
    console.error('Error replacing file:', error)
  }
}
</script>