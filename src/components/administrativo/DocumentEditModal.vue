<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true" @click="$emit('close')"></div>
    
    <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <PencilIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Editar Documento</h3>
            <div v-if="document" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título*</label>
                <input v-model="document.title" type="text" class="w-full px-3 py-2 border rounded-lg" required>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año*</label>
                  <input 
                    v-model="document.year" 
                    type="number" 
                    class="w-full px-3 py-2 border rounded-lg" 
                    required
                    :min="new Date().getFullYear() - 20"
                    :max="new Date().getFullYear() + 1"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <select v-model="document.sector" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Seleccionar sector</option>
                    <option v-for="sector in sectors" :key="sector" :value="sector">
                      {{ sector }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Línea Medular</label>
                  <select v-model="document.core_line" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Seleccionar línea medular</option>
                    <option v-for="line in coreLines" :key="line" :value="line">
                      {{ line }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento*</label>
                  <select v-model="document.document_type" class="w-full px-3 py-2 border rounded-lg" required>
                    <option value="">Seleccionar tipo</option>
                    <option v-for="type in documentTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                <textarea v-model="document.additional_notes" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="validateAndSave"
          :disabled="isSaving"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
        >
          <span v-if="isSaving" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando...
          </span>
          <span v-else>Guardar Cambios</span>
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
import { PencilIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import type { Document } from '@/types/document'

const props = defineProps({
  document: {
    type: Object as () => Document,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'close'])

// Datos predefinidos
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
  'Proyecto Educativo',
  'Datos CSV'
])

const validateAndSave = () => {
  if (!props.document.title?.trim()) {
    alert('Por favor complete el título del documento')
    return
  }
  
  if (!props.document.year || isNaN(props.document.year)) {
    alert('El año debe ser un número válido')
    return
  }

  if (!props.document.document_type) {
    alert('Por favor seleccione un tipo de documento')
    return
  }

  // Prepara los datos para enviar
  const datosParaEnviar = {
    ...props.document,
    year: Number(props.document.year) // Asegura que sea número
  }

  emit('save', datosParaEnviar)
}
</script>