<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true" @click="$emit('close')"></div>
    
    <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <FileTextIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Detalles del Documento</h3>
            <div v-if="document" class="mt-2 space-y-4">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{{ document.title }}</h4>
                <p class="text-sm text-gray-500 mt-1">
                  Archivo original: {{ document.original_filename }}
                </p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500">Año:</span>
                  <p class="text-sm text-gray-900">{{ document.year }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Formato:</span>
                  <p class="text-sm text-gray-900">{{ document.file_extension?.toUpperCase().replace('.', '') }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Sector:</span>
                  <p class="text-sm text-gray-900">{{ document.sector }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Línea Medular:</span>
                  <p class="text-sm text-gray-900">{{ document.core_line }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Tipo de Documento:</span>
                  <p class="text-sm text-gray-900">{{ document.document_type }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Tamaño:</span>
                  <p class="text-sm text-gray-900">{{ formatFileSize(document.file_size) }}</p>
                </div>
                <div class="md:col-span-2">
                  <span class="text-sm font-medium text-gray-500">Fecha de subida:</span>
                  <p class="text-sm text-gray-900">{{ formatDate(document.uploaded_at) }}</p>
                </div>
                <div class="md:col-span-2" v-if="document.uploaded_by">
                  <span class="text-sm font-medium text-gray-500">Subido por:</span>
                  <p class="text-sm text-gray-900">{{ document.uploaded_by.name }}</p>
                </div>
              </div>
              
              <div v-if="document.additional_notes">
                <span class="text-sm font-medium text-gray-500">Notas adicionales:</span>
                <p class="text-sm text-gray-900 mt-1 whitespace-pre-line">{{ document.additional_notes }}</p>
              </div>

              <div v-if="document.tags && document.tags.length > 0">
                <span class="text-sm font-medium text-gray-500">Etiquetas:</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span v-for="tag in document.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="$emit('download', document)"
          :disabled="isDownloading[document.id]"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
        >
          <div v-if="isDownloading[document.id]" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
          <DownloadIcon v-else class="h-4 w-4 mr-1" />
          {{ isDownloading[document.id] ? 'Descargando...' : 'Descargar' }}
        </button>
        <button
          v-if="canDeleteDocuments"
          @click="$emit('edit')"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          <PencilIcon class="h-4 w-4 mr-1" />
          Editar
        </button>

        <button
          v-if="canDeleteDocuments"
          @click="$emit('replace')"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          <RefreshCwIcon class="h-4 w-4 mr-1" />
          Reemplazar
        </button>

        <button
          @click="$emit('close')"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cerrar
        </button>
      </div> 
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileTextIcon, DownloadIcon, PencilIcon, RefreshCwIcon } from 'lucide-vue-next'
import type { Document } from '@/types/document'

defineProps({
  document: {
    type: Object as () => Document,
    required: true
  },
  isDownloading: {
    type: Object as () => { [key: number]: boolean },
    required: true
  },
  canDeleteDocuments: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'download', 'edit', 'replace'])

// Función para formatear fechas (debes implementarla según tus necesidades)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
}
</script>