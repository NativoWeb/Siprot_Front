<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Escenarios Prospectivos</h1>
          <p class="mt-2 text-gray-600">Exploración de futuros posibles para la planificación educativa</p>
          <div class="text-xs text-gray-500 mt-1">
            Rol: {{ userRole || 'No definido' }}
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            v-if="userRole === 'instructor'"
            @click="showScenariosList = !showScenariosList"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              showScenariosList 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            📋 Lista de escenarios
          </button>
        </div>
      </div>

    <!-- Using separate ListaEscenarios component -->
    <ListaEscenarios 
      v-if="showScenariosList"
      @back-to-generation="showScenariosList = false"
    />

    <!-- Generation mode -->
    <div v-else class="space-y-6">
      <!-- CSV Document Selection with Pagination -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center gap-2 mb-4">
          <FileSpreadsheet class="h-5 w-5" />
          <h2 class="text-xl font-semibold">Selección de Documentos para Análisis</h2>
          <span class="text-sm text-gray-500">(CSV y XLSX)</span>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Buscar documentos</label>
              <div class="relative">
                <input
                  v-model="documentFilters.search"
                  type="text"
                  placeholder="Buscar por título..."
                  class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select
                v-model="documentFilters.sector"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los sectores</option>
                <option v-for="sector in availableSectors" :key="sector" :value="sector">
                  {{ sector }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <select
                v-model="documentFilters.year"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los años</option>
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="applyDocumentFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter class="h-4 w-4 inline mr-1" />
              Filtrar
            </button>
            <button
              @click="clearDocumentFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X class="h-4 w-4 inline mr-1" />
              Limpiar
            </button>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loadingCsvFiles" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Cargando archivos...</span>
        </div>

        <!-- Lista de documentos con paginación -->
        <div v-else-if="paginatedCsvFiles.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div
              v-for="file in paginatedCsvFiles"
              :key="file.id"
              @click="selectCsvFile(file)"
              :class="[
                'cursor-pointer transition-all bg-white rounded-lg shadow-md hover:shadow-lg p-4 border-2',
                selectedCsvFile === file.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {{ file.title }}
                  </h3>
                  <div class="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar class="h-4 w-4 mr-1" />
                    <span>{{ file.year }}</span>
                  </div>
                  <div class="flex items-center text-xs text-gray-400 mb-2">
                    <FileText class="h-3 w-3 mr-1" />
                    <span>{{ file.original_filename || file.title + file.file_extension }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 ml-2 flex flex-col gap-1">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getDocumentTypeBadgeClass(file.document_type)"
                  >
                    {{ file.document_type }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getFileTypeBadgeClass(file.file_extension)"
                  >
                    {{ file.file_extension.toUpperCase().replace('.', '') }}
                  </span>
                </div>
              </div>

              <div class="space-y-2 mb-3">
                <div class="flex items-center text-sm text-gray-600">
                  <Building class="h-4 w-4 mr-2 text-gray-400" />
                  <span class="font-medium">Sector:</span>
                  <span class="ml-1">{{ file.sector }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <Target class="h-4 w-4 mr-2 text-gray-400" />
                  <span class="font-medium">Línea:</span>
                  <span class="ml-1">{{ file.core_line }}</span>
                </div>
                <div v-if="file.additional_notes" class="text-sm text-gray-600 line-clamp-2">
                  {{ file.additional_notes }}
                </div>
              </div>

              <div v-if="selectedCsvFile === file.id" class="flex items-center text-blue-600 text-sm font-medium">
                <CheckCircle class="h-4 w-4 mr-1" />
                Seleccionado para análisis
              </div>
            </div>
          </div>

          <!-- Controles de paginación -->
          <div class="flex items-center justify-between border-t border-gray-200 pt-4">
            <div class="text-sm text-gray-700">
              Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredCsvFiles.length) }} 
              de {{ filteredCsvFiles.length }} documentos
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              
              <div class="flex gap-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md',
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-12">
          <FileSpreadsheet class="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
          <p class="text-gray-500">
            {{ hasActiveDocumentFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Aún no hay documentos CSV o XLSX cargados en el sistema.' }}
          </p>
        </div>
        
        <!-- Error message -->
        <div v-if="csvError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <AlertTriangle class="h-5 w-5 text-red-400 mr-2" />
            <p class="text-red-700 text-sm">{{ csvError }}</p>
          </div>
        </div>

        <!-- Información del archivo seleccionado -->
        <div v-if="selectedFileInfo" class="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">Archivo seleccionado para análisis</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Título:</strong> {{ selectedFileInfo.title }}</p>
              <p><strong>Año:</strong> {{ selectedFileInfo.year }}</p>
              <p><strong>Archivo:</strong> {{ selectedFileInfo.original_filename }}</p>
            </div>
            <div>
              <p><strong>Sector:</strong> {{ selectedFileInfo.sector }}</p>
              <p><strong>Línea Medular:</strong> {{ selectedFileInfo.core_line }}</p>
              <p><strong>Tipo:</strong> {{ selectedFileInfo.document_type }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Generando escenarios...</span>
      </div>

      <template v-else>
        <!-- Scenario Selection -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center gap-2 mb-4">
            <Settings class="h-5 w-5" />
            <h2 class="text-xl font-semibold">Configuración de Escenarios</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="(scenario, key) in scenarios"
              :key="key"
              @click="selectedScenario = key"
              :class="[
                'cursor-pointer transition-all bg-white rounded-lg shadow p-4 border',
                selectedScenario === key ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              ]"
            >
              <div class="flex items-center gap-2 mb-2">
                <component :is="getScenarioIcon(key)" class="h-4 w-4" />
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :style="{ 
                    backgroundColor: scenario.color + '20', 
                    color: scenario.color 
                  }"
                >
                  {{ scenario.scenario_name }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ scenario.description }}</p>
            </div>
          </div>
        </div>

        <!-- Parameter Controls - Solo para Planeación -->
        <div v-if="userRole === 'planeacion'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-2">Parámetros del Escenario</h2>
          <p class="text-gray-600 mb-4">Ajusta los multiplicadores para personalizar las proyecciones</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(value, param) in customParameters" :key="param" class="space-y-2">
              <label class="text-sm font-medium capitalize">
                {{ param === 'default' ? 'General' : param }}
              </label>
              <input
                type="range"
                :value="value"
                @input="handleParameterChange(param, $event.target.value)"
                min="0.1"
                max="2"
                step="0.1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="text-xs text-gray-500 text-center">{{ value.toFixed(1) }}x</div>
            </div>
          </div>
        </div>

        <!-- Visualizations -->
        <div class="bg-white rounded-lg shadow">
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="p-6">
            <div v-if="activeTab === 'trends'">
              <h3 class="text-lg font-semibold mb-4">
                Proyección de Tendencias - {{ scenarios[selectedScenario]?.scenario_name }}
              </h3>
              <div v-if="scenarios[selectedScenario]?.data && scenarios[selectedScenario].data.length > 0" class="h-250">
                <LineChart
                  :data="scenarios[selectedScenario].data"
                  :series="trendSeries"
                  :colors="['#3B82F6', '#10B981', '#F59E0B', '#EF4444']"
                />
              </div>
              <div v-else class="h-120 flex items-center justify-center text-gray-500">
                <div class="text-center">
                  <FileSpreadsheet class="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos disponibles para este escenario</p>
                  <p class="text-sm">Selecciona un archivo CSV para generar las proyecciones</p>
                </div>
              </div>
            </div>

            <!-- Comparison Tab -->
            <div v-if="activeTab === 'comparison'">
              <h3 class="text-lg font-semibold mb-4">Comparación de Escenarios</h3>
              <div v-if="comparisonChartData.data && comparisonChartData.data.length > 0" class="h-210">
                <LineChart
                  :data="comparisonChartData.data"
                  :series="comparisonChartSeries"
                  :colors="Object.values(scenarios).map(s => s.color)"
                />
              </div>
              <div v-else class="h-120 flex items-center justify-center text-gray-500">
                <div class="text-center">
                  <FileSpreadsheet class="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos disponibles para comparar</p>
                  <p class="text-sm">Selecciona un archivo CSV y genera los escenarios</p>
                </div>
              </div>
            </div>

            <!-- Indicators Tab -->
            <div v-if="activeTab === 'indicators'">
              <div v-if="indicators.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="indicator in indicators"
                  :key="indicator"
                  class="bg-gray-50 rounded-lg p-4"
                >
                  <h4 class="text-lg font-semibold mb-4">{{ indicator }}</h4>
                  <div class="h-64">
                    <BarChart
                      :data="getIndicatorData(indicator)"
                      :series="[{ key: 'value', name: indicator }]"
                      :colors="[scenarios[selectedScenario]?.color || '#3B82F6']"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="h-120 flex items-center justify-center text-gray-500"> 
                <div class="text-center">
                  <FileSpreadsheet class="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay indicadores disponibles</p>
                  <p class="text-sm">Los indicadores se generarán automáticamente desde los datos CSV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    </div>

    <!-- Notificaciones -->
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-[9999]"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <CheckCircle class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ notificationMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showNotification = false" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100">
            <X class="h-5 w-5" />
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
          <AlertTriangle class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Settings, TrendingUp, TrendingDown, Minus, FileSpreadsheet,
  Search, Filter, X, Calendar, FileText, Building, CheckCircle,
  ChevronLeft, ChevronRight, Target, AlertTriangle
} from 'lucide-vue-next'
import LineChart from '../charts/LineChart.vue'
import BarChart from '../charts/BarChart.vue'
import ListaEscenarios from './ListaEscenarios.vue'

const props = defineProps({
  userRole: {
    type: String,
    required: false,
    default: 'instructor',
    validator: (value) => !value || ['directivo', 'planeacion', 'instructor', 'administrativo', 'superadmin'].includes(value)
  },
  historicalData: {
    type: Array,
    default: () => []
  }
})

// Reactive state
const selectedScenario = ref('tendencial')
const scenarios = ref({})
const customParameters = ref({
  default: 1.0,
  tecnologia: 1.0,
  empleo: 1.0
})
const loading = ref(false)
const activeTab = ref('trends')

// CSV file selection state
const csvFiles = ref([])
const selectedCsvFile = ref('')
const loadingCsvFiles = ref(false)
const csvError = ref('')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(6)

// Document filters
const documentFilters = ref({
  search: '',
  sector: '',
  year: ''
})

// Notification state
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')
const showScenariosList = ref(false)

// Computed properties
const filteredCsvFiles = computed(() => {
  let filtered = csvFiles.value

  if (documentFilters.value.search) {
    const searchTerm = documentFilters.value.search.toLowerCase()
    filtered = filtered.filter(file => 
      file.title.toLowerCase().includes(searchTerm) ||
      (file.original_filename && file.original_filename.toLowerCase().includes(searchTerm))
    )
  }

  if (documentFilters.value.sector) {
    filtered = filtered.filter(file => file.sector === documentFilters.value.sector)
  }

  if (documentFilters.value.year) {
    filtered = filtered.filter(file => file.year.toString() === documentFilters.value.year)
  }

  return filtered
})

const paginatedCsvFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCsvFiles.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCsvFiles.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  
  return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

const availableSectors = computed(() => {
  const sectors = [...new Set(csvFiles.value.map(file => file.sector))]
  return sectors.sort()
})

const availableYears = computed(() => {
  const years = [...new Set(csvFiles.value.map(file => file.year))]
  return years.sort((a, b) => b - a)
})

const hasActiveDocumentFilters = computed(() => {
  return documentFilters.value.search || documentFilters.value.sector || documentFilters.value.year
})

const selectedFileInfo = computed(() => {
  if (!selectedCsvFile.value) return null
  return csvFiles.value.find(file => file.id === parseInt(selectedCsvFile.value))
})

const indicators = computed(() => {
  const currentScenario = scenarios.value[selectedScenario.value]
  if (!currentScenario || !currentScenario.data || !currentScenario.data[0]) {
    return []
  }
  return Object.keys(currentScenario.data[0].values || {})
})

const trendSeries = computed(() => {
  const currentScenario = scenarios.value[selectedScenario.value]
  if (!currentScenario || !currentScenario.data || !currentScenario.data[0]) {
    return []
  }
  
  const firstDataPoint = currentScenario.data[0]
  const availableIndicators = Object.keys(firstDataPoint.values || {})
  
  return availableIndicators.map(indicator => ({
    key: `values.${indicator}`,
    name: indicator
  }))
})

const comparisonChartData = computed(() => {
  if (!scenarios.value || Object.keys(scenarios.value).length === 0) {
    return { data: [], series: [] }
  }
  
  const allYears = new Set()
  Object.values(scenarios.value).forEach(scenario => {
    if (scenario.data && Array.isArray(scenario.data)) {
      scenario.data.forEach(d => {
        if (d.year) allYears.add(d.year)
      })
    }
  })
  
  if (allYears.size === 0) {
    return { data: [], series: [] }
  }
  
  const data = Array.from(allYears).sort((a, b) => a - b).map(year => {
    const yearData = { year }
    
    Object.entries(scenarios.value).forEach(([key, scenario]) => {
      if (scenario.data && Array.isArray(scenario.data)) {
        const yearScenarioData = scenario.data.find(d => d.year === year)
        if (yearScenarioData && yearScenarioData.values) {
          const indicators = Object.keys(yearScenarioData.values)
          const primaryIndicator = indicators.find(ind => 
            ind.includes('poblacion') || ind.includes('Estudiantes') || ind.includes('Matriculados')
          ) || indicators[0]
          
          if (primaryIndicator) {
            yearData[scenario.scenario_name] = yearScenarioData.values[primaryIndicator]
          }
        }
      }
    })
    
    return yearData
  })
  
  return { data }
})

const comparisonChartSeries = computed(() => {
  return Object.entries(scenarios.value).map(([key, scenario]) => ({
    key: scenario.scenario_name,
    name: scenario.scenario_name
  }))
})

// Tabs configuration
const tabs = [
  { id: 'trends', label: 'Tendencias' },
  { id: 'comparison', label: 'Comparación' },
  { id: 'indicators', label: 'Indicadores' }
]

// Methods
const loadCsvFiles = async () => {
  loadingCsvFiles.value = true
  csvError.value = ''
  
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const response = await fetch('http://localhost:8000/scenarios/csv-files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al cargar archivos CSV')
    }
    
    const documents = await response.json()
    csvFiles.value = documents.filter(doc => 
      doc.file_extension === '.csv' || doc.file_extension === '.xlsx'
    )
    
  } catch (error) {
    console.error('Error loading CSV files:', error)
    csvError.value = `Error al cargar archivos: ${error.message}`
    showError(error.message)
    loadMockCsvFiles()
  } finally {
    loadingCsvFiles.value = false
  }
}

const loadMockCsvFiles = () => {
  csvFiles.value = [
    {
      id: 1,
      title: 'Datos Históricos de Matrícula 2019-2023',
      year: 2023,
      sector: 'Educación Técnica',
      core_line: 'Formación Técnica Laboral',
      document_type: 'Datos Históricos',
      file_extension: '.csv',
      original_filename: 'matricula_historica_2019_2023.csv',
      additional_notes: 'Datos de matrícula por programa y año'
    }
  ]
}

const selectCsvFile = (file) => {
  selectedCsvFile.value = file.id
  onCsvFileChange()
}

const onCsvFileChange = async () => {
  if (!selectedCsvFile.value) return
  
  showSuccess(`Archivo seleccionado: ${selectedFileInfo.value?.title}`)
  await loadScenarios()
}

const loadScenarios = async () => {
  if (!selectedCsvFile.value) {
    await loadMockScenarios()
    return
  }

  loading.value = true
  
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado. Inicie sesión.')

    const fileId = selectedCsvFile.value
    const scenarioTypes = ['tendencial', 'optimista', 'pesimista']
    const yearsAhead = 10
    
    const url = new URL(`http://localhost:8000/scenarios/generate/${fileId}`)
    scenarioTypes.forEach(type => url.searchParams.append('scenario_types', type))
    url.searchParams.append('years_ahead', yearsAhead.toString())

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const scenarioData = await response.json()
      
      const processedScenarios = {}
      
      for (const [scenarioType, data] of Object.entries(scenarioData)) {
        if (data && data.data && Array.isArray(data.data)) {
          const sortedData = data.data.sort((a, b) => a.year - b.year)
          
          processedScenarios[scenarioType] = {
            ...data,
            data: sortedData
          }
        }
      }
      
      scenarios.value = processedScenarios
      
      if (!scenarios.value[selectedScenario.value]) {
        selectedScenario.value = Object.keys(scenarios.value)[0] || 'tendencial'
      }
      
      showSuccess(`Escenarios generados exitosamente. Total: ${Object.keys(processedScenarios).length}`)
    } else {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al generar escenarios')
    }
  } catch (error) {
    console.error('Error loading scenarios:', error)
    showError(`Error al generar escenarios: ${error.message}`)
    await loadMockScenarios()
  } finally {
    loading.value = false
  }
}

const loadMockScenarios = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const mockScenarios = {
    tendencial: {
      scenario_type: 'tendencial',
      scenario_name: 'Escenario Tendencial',
      description: 'Proyección basada en tendencias históricas actuales',
      color: '#3B82F6',
      data: generateMockData('tendencial'),
      parameters: { default: 1.0 }
    },
    optimista: {
      scenario_type: 'optimista',
      scenario_name: 'Escenario Optimista',
      description: 'Escenario favorable con crecimiento económico',
      color: '#10B981',
      data: generateMockData('optimista'),
      parameters: { default: 1.25, tecnologia: 1.5, empleo: 1.3 }
    },
    pesimista: {
      scenario_type: 'pesimista',
      scenario_name: 'Escenario Pesimista',
      description: 'Escenario desfavorable con reducción en inversión',
      color: '#EF4444',
      data: generateMockData('pesimista'),
      parameters: { default: 0.75, tecnologia: 0.6, empleo: 0.7 }
    }
  }
  
  scenarios.value = mockScenarios
}

const generateMockData = (scenarioType) => {
  const baseData = []
  const currentYear = new Date().getFullYear()

  for (let i = 5; i >= 1; i--) {
    baseData.push({
      year: currentYear - i,
      values: {
        'Estudiantes Matriculados': Math.floor(1000 + Math.random() * 500),
        'Programas Ofertados': Math.floor(15 + Math.random() * 10),
        'Demanda Laboral': Math.floor(800 + Math.random() * 400),
        'Graduados': Math.floor(200 + Math.random() * 100)
      }
    })
  }

  const multiplier = scenarioType === 'optimista' ? 1.25 : scenarioType === 'pesimista' ? 0.75 : 1.0

  for (let i = 1; i <= 10; i++) {
    const lastValues = baseData[baseData.length - 1].values
    baseData.push({
      year: currentYear + i,
      values: {
        'Estudiantes Matriculados': Math.floor(lastValues['Estudiantes Matriculados'] * (1 + 0.05 * multiplier)),
        'Programas Ofertados': Math.floor(lastValues['Programas Ofertados'] * (1 + 0.03 * multiplier)),
        'Demanda Laboral': Math.floor(lastValues['Demanda Laboral'] * (1 + 0.07 * multiplier)),
        'Graduados': Math.floor(lastValues['Graduados'] * (1 + 0.06 * multiplier))
      }
    })
  }

  return baseData
}

const handleParameterChange = (param, value) => {
  if (props.userRole === 'planeacion') {
    customParameters.value[param] = parseFloat(value)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const applyDocumentFilters = () => {
  currentPage.value = 1
}

const clearDocumentFilters = () => {
  documentFilters.value = {
    search: '',
    sector: '',
    year: ''
  }
  currentPage.value = 1
}

const getDocumentTypeBadgeClass = (type) => {
  const classes = {
    'Plan de Desarrollo': 'bg-blue-100 text-blue-800',
    'Estudio Prospectivo': 'bg-green-100 text-green-800',
    'Matriz DOFA': 'bg-yellow-100 text-yellow-800',
    'Informe de Gestión': 'bg-purple-100 text-purple-800',
    'Reglamento': 'bg-red-100 text-red-800',
    'Datos Históricos': 'bg-indigo-100 text-indigo-800',
    'Proyecciones': 'bg-teal-100 text-teal-800',
    'Análisis': 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getFileTypeBadgeClass = (extension) => {
  const classes = {
    '.pdf': 'bg-red-100 text-red-800',
    '.docx': 'bg-blue-100 text-blue-800',
    '.xlsx': 'bg-green-100 text-green-800',
    '.csv': 'bg-emerald-100 text-emerald-800'
  }
  return classes[extension.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getScenarioIcon = (type) => {
  switch (type) {
    case 'optimista':
      return TrendingUp
    case 'pesimista':
      return TrendingDown
    default:
      return Minus
  }
}

const getIndicatorData = (indicator) => {
  const scenario = scenarios.value[selectedScenario.value]
  
  if (!scenario || !scenario.data) {
    return []
  }

  const indicatorMapping = {
    'Población Objetivo': 'poblacion_objetivo',
    'Demanda de Empleo': 'demanda_empleo', 
    'Oferta Educativa': 'oferta_educativa',
    'Estudiantes Matriculados': 'poblacion_objetivo',
    'Demanda Laboral': 'demanda_empleo',
    'Graduados': 'oferta_educativa'
  }

  const mappedIndicator = indicatorMapping[indicator] || indicator
  
  const data = scenario.data.slice(-5).map(d => {
    const value = d.values[mappedIndicator] || d.values[indicator] || 0
    return {
      year: d.year,
      value: value
    }
  })
  
  return data
}

const showSuccess = (message) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => { showNotification.value = false }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => { showErrorNotification.value = false }, 5000)
}

// Watch for filter changes
let filterTimeout
watch(() => documentFilters.value.search, () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
})

watch([() => documentFilters.value.sector, () => documentFilters.value.year], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  await loadCsvFiles()
  await loadScenarios()
})
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

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

/* Utility classes */
.h-250 {
  height: 250px;
}

.h-210 {
  height: 210px;
}

.h-120 {
  height: 120px;
}

.h-64 {
  height: 16rem;
}
</style>