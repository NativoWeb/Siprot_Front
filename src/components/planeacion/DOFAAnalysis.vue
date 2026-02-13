<template>
  <div class="w-[90%]">
    <!-- Header -->
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
              @click="loadHistory"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Historial
            </button>
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
              @click="exportToPDF"
              :disabled="isExporting"
            >
              <div v-if="isExporting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ isExporting ? 'Exportando...' : 'Exportar PDF' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Authentication check -->
    <div v-if="!isAuthenticated" class="container mx-auto px-4 py-8 text-center">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-yellow-800 mb-2">Acceso Requerido</h2>
        <p class="text-yellow-700">Debes iniciar sesión para acceder al análisis DOFA.</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="container mx-auto px-4 py-8 text-center">
      <div class="inline-flex items-center gap-2 text-gray-600">
        <div class="w-6 h-6 border-2 border-gray-300 border-t-[#08ac04] rounded-full animate-spin"></div>
        Cargando datos DOFA...
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="container mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p class="font-medium">Error al cargar los datos:</p>
        <p class="text-sm mt-1">{{ error }}</p>
        <button @click="loadDofaData" class="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm transition-colors">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="container mx-auto px-4 py-8">
      <!-- Add Item Button -->
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

      <!-- DOFA Grid -->
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
                  
                  <!-- Metadata -->
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
                  
                  <!-- Date info -->
                  <div class="text-xs text-gray-500">
                    Agregado: {{ formatDate(item.created_at) }} por {{ item.created_by }}
                  </div>
                </div>
                
                <!-- Actions -->
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
            
            <!-- Empty state -->
            <div v-if="dofaData[category].length === 0" class="text-center py-12 text-gray-500">
              <div class="text-4xl mb-4">{{ config.icon }}</div>
              <p class="text-lg font-medium mb-2">No hay ítems en esta categoría</p>
              <p v-if="canEdit" class="text-sm">Haz clic en "Agregar Nuevo Ítem" para comenzar</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Info -->
      <div class="mt-8 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          Rol actual: {{ userRole }} | {{ canEdit ? 'Permisos de edición' : 'Solo lectura' }}
        </span>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Agregar Nuevo Ítem DOFA</h3>
        </div>
        <form @submit.prevent="addItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select v-model="newItem.category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
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
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
            <input 
              v-model="newItem.source" 
              type="text"
              placeholder="Documento o referencia"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
            <input 
              v-model="newItem.responsible" 
              type="text"
              placeholder="Área o persona responsable"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select v-model="newItem.priority" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
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

    <!-- Edit Item Modal -->
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
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
            <input 
              v-model="editingItem.item.source" 
              type="text"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
            <input 
              v-model="editingItem.item.responsible" 
              type="text"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select v-model="editingItem.item.priority" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
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

    <!-- History Modal -->
    <div v-if="showHistory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-800">Historial de Cambios DOFA</h3>
            <button @click="showHistory = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div v-if="historyLoading" class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-600">
              <div class="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
              Cargando historial...
            </div>
          </div>
          <div v-else-if="history.length === 0" class="text-center py-8 text-gray-500">
            <p>No hay cambios registrados</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="change in history" :key="change.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {{ change.action }}
                    </span>
                    <span class="text-sm text-gray-600">{{ change.category }}</span>
                  </div>
                  <p class="text-gray-800 mb-2">{{ change.description }}</p>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(change.timestamp) }} por {{ change.user }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = 'http://localhost:8000'
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
})

/**
 * Interfaces para tipado
 */
interface DofaItem {
  id: number
  text: string
  source?: string
  responsible?: string
  priority?: string
  created_at: string
  created_by?: number | string
  updated_at?: string
  updated_by?: number | string 
  is_active?: boolean
}

interface DofaHistoryChange {
  id: number
  action: string
  category?: string
  description?: string
  timestamp: string
  user: string
}

// Estado reactivo
const userRole = ref<'planeacion' | 'directivos' | 'superadmin'>('planeacion')
const showAddDialog = ref(false)
const showHistory = ref(false)
const editingItem = ref<{category: keyof typeof dofaData.value, item: DofaItem} | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const isExporting = ref(false)
const historyLoading = ref(false)
const error = ref<string | null>(null)
const history = ref<DofaHistoryChange[]>([])

const newItem = ref({
  category: 'D',
  text: '',
  source: '',
  responsible: '',
  priority: 'media'
})

// Configuración de categorías
const categoryConfig = {
  D: { 
    title: 'Debilidades', 
    icon: '⚠️',
    headerBg: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  O: { 
    title: 'Oportunidades', 
    icon: '🚀',
    headerBg: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  F: { 
    title: 'Fortalezas', 
    icon: '💪',
    headerBg: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  A: { 
    title: 'Amenazas', 
    icon: '⚡',
    headerBg: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

/**
 * 🔹 Aquí tipamos bien dofaData
 */
const dofaData = ref<Record<'D' | 'O' | 'F' | 'A', DofaItem[]>>({
  D: [],
  O: [],
  F: [],
  A: []
})

// Computed properties
const canEdit = computed(() => 
  userRole.value === 'planeacion' || userRole.value === 'superadmin'
)

const isAuthenticated = computed(() => !!localStorage.getItem('access_token'))

// Methods
const loadDofaData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('Attempting to load DOFA data...')
    console.log('Token:', localStorage.getItem('access_token')?.substring(0, 20) + '...')
    
    const response = await fetch(`${API_BASE_URL}/dofa/matrix`, {
      headers: getAuthHeaders()
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response body:', errorText)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('DOFA data received:', data)
    
    // Organize data by category
    dofaData.value = {
      D: data.debilidades || [],
      O: data.oportunidades || [],
      F: data.fortalezas || [],
      A: data.amenazas || []
    }
  } catch (err) {
    console.error('Error loading DOFA data:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isLoading.value = false
  }
}

const loadHistory = async () => {
  try {
    showHistory.value = true
    historyLoading.value = true
    error.value = null

    const response = await fetch(`${API_BASE_URL}/dofa/history`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Historial DOFA recibido:', data)
    history.value = data || []
  } catch (err) {
    console.error('Error cargando historial:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800 border border-red-200'
    case 'media': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case 'baja': return 'bg-green-100 text-green-800 border border-green-200'
    default: return 'bg-gray-100 text-gray-800 border border-gray-200'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addItem = async () => {
  try {
    isSubmitting.value = true
    
    const response = await fetch(`${API_BASE_URL}/dofa/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        category: newItem.value.category,
        text: newItem.value.text,
        source: newItem.value.source || null,
        responsible: newItem.value.responsible || null,
        priority: newItem.value.priority
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const createdItem: DofaItem = await response.json()
    dofaData.value[newItem.value.category as 'D' | 'O' | 'F' | 'A'].push(createdItem)
    
    // Reset form
    newItem.value = {
      category: 'D',
      text: '',
      source: '',
      responsible: '',
      priority: 'media'
    }
    
    showAddDialog.value = false
  } catch (err) {
    alert(`Error al agregar ítem: ${err instanceof Error ? err.message : 'Error desconocido'}`)
  } finally {
    isSubmitting.value = false
  }
}

const editItem = (category: 'D' | 'O' | 'F' | 'A', item: DofaItem) => {
  editingItem.value = { 
    category, 
    item: { ...item }
  }
}

const saveEdit = async () => {
  if (!editingItem.value) return

  try {
    isSubmitting.value = true
    
    const response = await fetch(`${API_BASE_URL}/dofa/items/${editingItem.value.item.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text: editingItem.value.item.text,
        source: editingItem.value.item.source || null,
        responsible: editingItem.value.item.responsible || null,
        priority: editingItem.value.item.priority
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const updatedItem: DofaItem = await response.json()
    
    const index = dofaData.value[editingItem.value.category].findIndex(
      item => item.id === editingItem.value!.item.id
    )
    
    if (index !== -1) {
      dofaData.value[editingItem.value.category][index] = updatedItem
    }
    
    editingItem.value = null
  } catch (err) {
    alert(`Error al actualizar ítem: ${err instanceof Error ? err.message : 'Error desconocido'}`)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = async (category: 'D' | 'O' | 'F' | 'A', itemId: number) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este ítem?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/dofa/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    dofaData.value[category] = dofaData.value[category].filter(item => item.id !== itemId)
  } catch (err) {
    alert(`Error al eliminar ítem: ${err instanceof Error ? err.message : 'Error desconocido'}`)
  }
}

const exportToPDF = async () => {
  try {
    isExporting.value = true
    
    const response = await fetch(`${API_BASE_URL}/dofa/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        format: 'pdf',
        title: 'Análisis DOFA - SIPROT',
        include_metadata: true
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dofa-analysis-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err) {
    alert(`Error al exportar PDF: ${err instanceof Error ? err.message : 'Error desconocido'}`)
  } finally {
    isExporting.value = false
  }
}

// Initialize component
onMounted(() => {
  console.log('Component mounted, loading DOFA data...')
  loadDofaData()
})
</script>


<style scoped>
.container {
  max-width: 1200px;
}
</style>
