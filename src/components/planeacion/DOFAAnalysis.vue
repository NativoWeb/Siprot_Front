<template>
  <div class="min-h-screen bg-white">
     Header 
    <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              Análisis DOFA Territorial - <span class="text-[#08ac04]">SIPROT-IA</span>
            </h1>
            <p class="text-gray-600">
              Herramienta colaborativa de diagnóstico estratégico para el territorio y centro de formación
            </p>
          </div>
          <div class="flex gap-3">
            <button 
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="showHistory = true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Historial
            </button>
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
              @click="exportToPDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
       Add Item Button 
      <div v-if="canEdit" class="mb-6">
        <button 
          @click="showAddDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Agregar Nuevo Ítem DOFA
        </button>
      </div>

       DOFA Grid 
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="(config, category) in categoryConfig" 
          :key="category"
          class="bg-white rounded-xl shadow-lg border-2 overflow-hidden"
          :class="config.borderColor"
        >
          <div class="p-6 border-b border-gray-100" :class="config.headerBg">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-3 text-xl font-semibold text-gray-800">
                <span class="text-2xl">{{ config.icon }}</span>
                {{ config.title }}
              </h3>
              <span class="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-600">
                {{ dofaData[category].length }} ítems
              </span>
            </div>
          </div>

          <div class="p-6 space-y-4 min-h-[300px]">
            <div 
              v-for="item in dofaData[category]" 
              :key="item.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <p class="text-gray-800 font-medium mb-3 leading-relaxed">{{ item.text }}</p>
                  
                   Metadata 
                  <div class="flex flex-wrap gap-2 text-sm mb-3">
                    <span v-if="item.source" class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
                        <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ item.source }}
                    </span>
                    
                    <span v-if="item.responsible" class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                      </svg>
                      {{ item.responsible }}
                    </span>
                    
                    <span 
                      class="px-2 py-1 rounded-md text-xs font-medium"
                      :class="getPriorityColor(item.priority)"
                    >
                      {{ item.priority }}
                    </span>
                  </div>
                  
                   Date info 
                  <div class="text-xs text-gray-500">
                    Agregado: {{ formatDate(item.dateAdded) }} por {{ item.addedBy }}
                  </div>
                </div>
                
                 Actions 
                <div class="flex gap-1">
                  <button 
                    v-if="canEdit"
                    @click="editItem(category, item)"
                    class="p-2 text-gray-500 hover:text-[#08ac04] hover:bg-green-50 rounded-md transition-colors"
                    title="Editar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    v-if="canEdit"
                    @click="deleteItem(category, item.id)"
                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  
                  <button 
                    v-if="!canEdit"
                    class="p-2 text-gray-400 cursor-default"
                    title="Solo lectura"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
             Empty state 
            <div v-if="dofaData[category].length === 0" class="text-center py-12 text-gray-500">
              <div class="text-4xl mb-4">{{ config.icon }}</div>
              <p class="text-lg font-medium mb-2">No hay ítems en esta categoría</p>
              <p v-if="canEdit" class="text-sm">Haz clic en "Agregar Nuevo Ítem" para comenzar</p>
            </div>
          </div>
        </div>
      </div>

       Role Info 
      <div class="mt-8 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          Rol actual: {{ userRole }} | {{ canEdit ? 'Permisos de edición' : 'Solo lectura' }}
        </span>
      </div>
    </div>

     Add Item Modal 
    <div v-if="showAddDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Agregar Nuevo Ítem DOFA</h3>
        </div>
        <form @submit.prevent="addItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select v-model="newItem.category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent">
              <option v-for="(config, key) in categoryConfig" :key="key" :value="key">
                {{ config.icon }} {{ config.title }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea 
              v-model="newItem.text" 
              required 
              rows="3"
              placeholder="Describe el ítem DOFA..."
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
            <input 
              v-model="newItem.source" 
              type="text"
              placeholder="Documento o referencia"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
            <input 
              v-model="newItem.responsible" 
              type="text"
              placeholder="Área o persona responsable"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select v-model="newItem.priority" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent">
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Guardar
            </button>
            <button 
              type="button"
              @click="showAddDialog = false"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

     Edit Item Modal 
    <div v-if="editingItem" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Editar Ítem DOFA</h3>
        </div>
        <form @submit.prevent="saveEdit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea 
              v-model="editingItem.item.text" 
              required 
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
            <input 
              v-model="editingItem.item.source" 
              type="text"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
            <input 
              v-model="editingItem.item.responsible" 
              type="text"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select v-model="editingItem.item.priority" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent">
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Guardar Cambios
            </button>
            <button 
              type="button"
              @click="editingItem = null"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DOFAItem {
  id: string
  text: string
  source?: string
  responsible?: string
  priority: 'Alta' | 'Media' | 'Baja'
  dateAdded: string
  addedBy: string
}

interface DOFAData {
  debilidades: DOFAItem[]
  oportunidades: DOFAItem[]
  fortalezas: DOFAItem[]
  amenazas: DOFAItem[]
}

// Estado reactivo
const userRole = ref<'Planeacion' | 'Directivos' | 'Superadministrador'>('Planeacion')
const showAddDialog = ref(false)
const showHistory = ref(false)
const editingItem = ref<{category: keyof DOFAData, item: DOFAItem} | null>(null)

const newItem = ref({
  category: 'debilidades' as keyof DOFAData,
  text: '',
  source: '',
  responsible: '',
  priority: 'Media' as 'Alta' | 'Media' | 'Baja'
})

// Configuración de categorías
const categoryConfig = {
  debilidades: { 
    title: 'Debilidades', 
    icon: '⚠️',
    headerBg: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  oportunidades: { 
    title: 'Oportunidades', 
    icon: '🚀',
    headerBg: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  fortalezas: { 
    title: 'Fortalezas', 
    icon: '💪',
    headerBg: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  amenazas: { 
    title: 'Amenazas', 
    icon: '⚡',
    headerBg: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

// Datos DOFA
const dofaData = ref<DOFAData>({
  debilidades: [
    {
      id: '1',
      text: 'Baja cobertura en zonas rurales del departamento',
      source: 'Diagnóstico territorial 2024',
      responsible: 'Coordinación Regional',
      priority: 'Alta',
      dateAdded: '2024-01-15',
      addedBy: 'Ana García'
    },
    {
      id: '2',
      text: 'Limitada conectividad digital en centros de formación',
      source: 'Informe técnico infraestructura',
      responsible: 'TI Regional',
      priority: 'Alta',
      dateAdded: '2024-01-20',
      addedBy: 'Carlos Ruiz'
    }
  ],
  oportunidades: [
    {
      id: '3',
      text: 'Creciente demanda de formación en tecnologías emergentes',
      source: 'Estudio mercado laboral 2024',
      responsible: 'Planeación Académica',
      priority: 'Alta',
      dateAdded: '2024-01-18',
      addedBy: 'María López'
    },
    {
      id: '4',
      text: 'Alianzas estratégicas con universidades locales',
      source: 'Convenios institucionales',
      responsible: 'Dirección General',
      priority: 'Media',
      dateAdded: '2024-01-22',
      addedBy: 'Pedro Martín'
    }
  ],
  fortalezas: [
    {
      id: '5',
      text: 'Amplia experiencia en formación técnica y tecnológica',
      source: 'Histórico institucional',
      responsible: 'Coordinación Académica',
      priority: 'Alta',
      dateAdded: '2024-01-10',
      addedBy: 'Laura Sánchez'
    },
    {
      id: '6',
      text: 'Red consolidada de instructores especializados',
      source: 'Base de datos RRHH',
      responsible: 'Gestión Humana',
      priority: 'Alta',
      dateAdded: '2024-01-12',
      addedBy: 'Roberto Torres'
    }
  ],
  amenazas: [
    {
      id: '7',
      text: 'Competencia creciente de plataformas educativas privadas',
      source: 'Análisis competencia 2024',
      responsible: 'Mercadeo Institucional',
      priority: 'Media',
      dateAdded: '2024-01-25',
      addedBy: 'Diana Herrera'
    },
    {
      id: '8',
      text: 'Reducción presupuestal para programas de formación',
      source: 'Proyección presupuestal',
      responsible: 'Planeación Financiera',
      priority: 'Alta',
      dateAdded: '2024-01-28',
      addedBy: 'Andrés Vega'
    }
  ]
})

// Computed properties
const canEdit = computed(() => 
  userRole.value === 'Planeacion' || userRole.value === 'Superadministrador'
)

// Métodos
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800 border border-red-200'
    case 'Media': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case 'Baja': return 'bg-green-100 text-green-800 border border-green-200'
    default: return 'bg-gray-100 text-gray-800 border border-gray-200'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const addItem = () => {
  const item: DOFAItem = {
    id: Date.now().toString(),
    text: newItem.value.text,
    source: newItem.value.source || undefined,
    responsible: newItem.value.responsible || undefined,
    priority: newItem.value.priority,
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: 'Usuario Actual'
  }

  dofaData.value[newItem.value.category].push(item)
  
  // Reset form
  newItem.value = {
    category: 'debilidades',
    text: '',
    source: '',
    responsible: '',
    priority: 'Media'
  }
  
  showAddDialog.value = false
}

const editItem = (category: keyof DOFAData, item: DOFAItem) => {
  editingItem.value = { 
    category, 
    item: { ...item } // Crear copia para edición
  }
}

const saveEdit = () => {
  if (!editingItem.value) return

  const index = dofaData.value[editingItem.value.category].findIndex(
    item => item.id === editingItem.value!.item.id
  )
  
  if (index !== -1) {
    dofaData.value[editingItem.value.category][index] = editingItem.value.item
  }
  
  editingItem.value = null
}

const deleteItem = (category: keyof DOFAData, itemId: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
    dofaData.value[category] = dofaData.value[category].filter(item => item.id !== itemId)
  }
}

const exportToPDF = () => {
  alert('Funcionalidad de exportación a PDF - Por implementar')
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.container {
  max-width: 1200px;
}
</style>
