<template>
  <div class="space-y-6">
    <!-- Header con controles -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <List class="h-5 w-5" />
          <h2 class="text-xl font-semibold">Escenarios Existentes</h2>
        </div>
        <button
          @click="$emit('back-to-generation')"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Volver a Generar
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar escenarios..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            v-model="filters.scenarioType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="tendencial">Tendencial</option>
            <option value="optimista">Optimista</option>
            <option value="pesimista">Pesimista</option>
          </select>
        </div>
        <div>
          <select
            v-model="filters.createdBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="administrativo">Administrativo</option>
            <option value="planeacion">Planeación</option>
          </select>
        </div>
        <div>
          <button
            @click="clearFilters"
            class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Cargando escenarios...</span>
    </div>

    <!-- Lista de escenarios -->
    <div v-else-if="filteredScenarios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="scenario in paginatedScenarios"
        :key="scenario.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewScenarioDetails(scenario)"
      >
        <div class="p-6">
          <!-- Header del escenario -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <component :is="getScenarioIcon(scenario.scenario_type)" class="h-5 w-5" />
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getScenarioTypeClass(scenario.scenario_type)"
              >
                {{ scenario.scenario_type }}
              </span>
            </div>
            <span class="text-xs text-gray-500">
              {{ formatDate(scenario.created_at) }}
            </span>
          </div>

          <!-- Nombre del escenario -->
          <h3 class="font-semibold text-lg mb-2 text-gray-900">
            {{ scenario.name || `Escenario ${scenario.scenario_type}` }}
          </h3>

          <!-- Descripción -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">
            {{ scenario.description || 'Sin descripción disponible' }}
          </p>

          <!-- Información del creador -->
          <div class="flex items-center gap-2 mb-3">
            <User class="h-4 w-4 text-gray-400" />
            <span class="text-sm text-gray-600">
              Creado por: <span class="font-medium">{{ scenario.created_by_username }}</span>
            </span>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="getRoleClass(scenario.created_by_role)"
            >
              {{ scenario.created_by_role }}
            </span>
          </div>

          <!-- Documento fuente -->
          <div v-if="scenario.source_document" class="flex items-center gap-2 mb-4">
            <FileText class="h-4 w-4 text-gray-400" />
            <span class="text-sm text-gray-600 truncate">
              {{ scenario.source_document }}
            </span>
          </div>

          <!-- Indicadores clave -->
          <div v-if="scenario.key_indicators && scenario.key_indicators.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="indicator in scenario.key_indicators.slice(0, 3)"
                :key="indicator"
                class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
              >
                {{ indicator }}
              </span>
              <span
                v-if="scenario.key_indicators.length > 3"
                class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded"
              >
                +{{ scenario.key_indicators.length - 3 }} más
              </span>
            </div>
          </div>

          <!-- Botón de acción -->
          <button
            @click.stop="viewScenarioDetails(scenario)"
            class="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12">
      <FileX class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron escenarios</h3>
      <p class="text-gray-600">
        {{ hasFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay escenarios creados' }}
      </p>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      
      <span class="px-4 py-2 text-sm text-gray-600">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Modal de detalles del escenario -->
    <div
      v-if="selectedScenario"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeScenarioDetails"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- Header del modal -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {{ selectedScenario.name || `Escenario ${selectedScenario.scenario_type}` }}
              </h2>
              <p class="text-gray-600 mt-1">{{ selectedScenario.description }}</p>
            </div>
            <button
              @click="closeScenarioDetails"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Información del escenario -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Tipo de Escenario</label>
                <div class="mt-1">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getScenarioTypeClass(selectedScenario.scenario_type)"
                  >
                    {{ selectedScenario.scenario_type }}
                  </span>
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium text-gray-700">Creado por</label>
                <div class="mt-1 flex items-center gap-2">
                  <span class="text-sm text-gray-900">{{ selectedScenario.created_by_username }}</span>
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="getRoleClass(selectedScenario.created_by_role)"
                  >
                    {{ selectedScenario.created_by_role }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedScenario.created_at) }}</p>
              </div>
              
              <div v-if="selectedScenario.source_document">
                <label class="text-sm font-medium text-gray-700">Documento Fuente</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedScenario.source_document }}</p>
              </div>
            </div>
          </div>

          <!-- Proyecciones del escenario -->
          <div v-if="scenarioDetails && scenarioDetails.projections" class="mt-6">
            <h3 class="text-lg font-semibold mb-4">Proyecciones</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="(projection, key) in scenarioDetails.projections"
                  :key="key"
                  class="bg-white rounded-lg p-4"
                >
                  <h4 class="font-medium text-gray-900 mb-2">{{ key }}</h4>
                  <div class="space-y-2">
                    <div v-for="(value, year) in projection" :key="year" class="flex justify-between text-sm">
                      <span class="text-gray-600">{{ year }}:</span>
                      <span class="font-medium">{{ formatNumber(value) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              @click="closeScenarioDetails"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              @click="exportScenario(selectedScenario)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  List,
  ArrowLeft,
  User,
  FileText,
  FileX,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-vue-next'
import html2canvas from 'html2canvas'

// Props y emits
const emit = defineEmits(['back-to-generation'])

// Estado reactivo
const scenarios = ref([])
const loading = ref(false)
const selectedScenario = ref(null)
const scenarioDetails = ref(null)

// Filtros
const filters = ref({
  search: '',
  scenarioType: '',
  createdBy: ''
})

// Paginación
const currentPage = ref(1)
const itemsPerPage = ref(9)

// Export options
const exportOptions = ref({
  format: 'pdf',
  includeCharts: true,
  includeNarratives: true,
  includeComparison: false,
  template: 'executive'
})

// Computed properties
const filteredScenarios = computed(() => {
  let filtered = scenarios.value

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(scenario =>
      (scenario.name && scenario.name.toLowerCase().includes(searchTerm)) ||
      (scenario.description && scenario.description.toLowerCase().includes(searchTerm)) ||
      scenario.created_by_username.toLowerCase().includes(searchTerm)
    )
  }

  if (filters.value.scenarioType) {
    filtered = filtered.filter(scenario => scenario.scenario_type === filters.value.scenarioType)
  }

  if (filters.value.createdBy) {
    filtered = filtered.filter(scenario => scenario.created_by_role === filters.value.createdBy)
  }

  return filtered
})

const paginatedScenarios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredScenarios.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredScenarios.value.length / itemsPerPage.value)
})

const hasFilters = computed(() => {
  return filters.value.search || filters.value.scenarioType || filters.value.createdBy
})

// Métodos
const loadScenarios = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No autorizado')

    const response = await fetch('http://localhost:8000/scenarios/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      scenarios.value = data
    } else {
      console.error('Error al cargar escenarios:', response.statusText)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const viewScenarioDetails = async (scenario) => {
  selectedScenario.value = scenario
  
  // Cargar detalles completos del escenario
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`http://localhost:8000/scenarios/details/${scenario.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      scenarioDetails.value = await response.json()
    }
  } catch (error) {
    console.error('Error al cargar detalles:', error)
  }
}

const closeScenarioDetails = () => {
  selectedScenario.value = null
  scenarioDetails.value = null
}

const clearFilters = () => {
  filters.value = {
    search: '',
    scenarioType: '',
    createdBy: ''
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
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

const getScenarioTypeClass = (type) => {
  const classes = {
    'tendencial': 'bg-blue-100 text-blue-800',
    'optimista': 'bg-green-100 text-green-800',
    'pesimista': 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getRoleClass = (role) => {
  const classes = {
    'superadmin': 'bg-purple-100 text-purple-800',
    'administrativo': 'bg-blue-100 text-blue-800',
    'planeacion': 'bg-green-100 text-green-800',
    'instructor': 'bg-yellow-100 text-yellow-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatNumber = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString('es-ES')
  }
  return value
}

const exportToPDF = async (scenario) => {
  try {
    if (!scenario) return

    // Capturar gráficas si están disponibles
    const charts = exportOptions.value.includeCharts ? await captureCharts() : []
    
    // Generar contenido HTML para PDF
    const htmlContent = generatePDFContent(scenario, charts)
    
    // Crear un elemento temporal para renderizar
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Esperar a que se cargue y luego imprimir
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 1000)
    
  } catch (error) {
    console.error('Error al exportar PDF:', error)
  }
}

const generatePDFContent = (scenario, charts = []) => {
  const template = exportOptions.value.template
  
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Escenario Prospectivo - ${scenario.name || scenario.scenario_type}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 40px; 
          color: #333; 
          line-height: 1.6; 
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #3B82F6; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .section { 
          margin-bottom: 25px; 
          page-break-inside: avoid;
        }
        .scenario-title { 
          color: #3B82F6; 
          font-size: 24px; 
          font-weight: bold; 
        }
        .subsection { 
          margin-left: 20px; 
          margin-bottom: 15px; 
        }
        .indicator-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        .indicator-table th, .indicator-table td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .indicator-table th { 
          background-color: #f2f2f2; 
        }
        .implications-list { 
          list-style-type: none; 
          padding-left: 0; 
        }
        .implications-list li { 
          background: #f8f9fa; 
          margin: 5px 0; 
          padding: 10px; 
          border-left: 4px solid #3B82F6; 
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .info-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3B82F6;
        }
        .projections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        .projection-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        .chart-section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .chart-image {
          max-width: 100%;
          height: auto;
          margin: 20px 0;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .chart-title {
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
          color: #3B82F6;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
          .chart-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ESCENARIOS PROSPECTIVOS</h1>
        <h2 class="scenario-title">${scenario.name || `Escenario ${scenario.scenario_type}`}</h2>
        <p><strong>Tipo:</strong> ${scenario.scenario_type}</p>
        <p><strong>Creado por:</strong> ${scenario.created_by_username} (${scenario.created_by_role})</p>
        <p><strong>Fecha de creación:</strong> ${formatDate(scenario.created_at)}</p>
        ${scenario.source_document ? `<p><strong>Documento fuente:</strong> ${scenario.source_document}</p>` : ''}
        <p><strong>Fecha de exportación:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
  `
  
  // Contenido según template
  if (template === 'executive') {
    content += generateExecutiveContent(scenario)
  } else if (template === 'technical') {
    content += generateTechnicalContent(scenario)
  } else {
    content += generatePresentationContent(scenario)
  }
  
  if (charts.length > 0) {
    content += `
      <div class="section">
        <h3>Gráficas y Visualizaciones</h3>
        ${charts.map((chart, index) => `
          <div class="chart-section">
            <div class="chart-title">${chart.title}</div>
            <img src="${chart.dataURL}" alt="Gráfica ${index + 1}" class="chart-image" />
          </div>
        `).join('')}
      </div>
    `
  }
  
  content += `
      <div class="footer">
        <p>Documento generado automáticamente por el Sistema de Escenarios Prospectivos</p>
        <p>${new Date().toLocaleString()}</p>
        ${charts.length > 0 ? `<p>Incluye ${charts.length} gráfica(s) capturada(s)</p>` : ''}
      </div>
    </body>
    </html>
  `
  
  return content
}

const generateExecutiveContent = (scenario) => {
  return `
    <div class="section">
      <h3>Resumen Ejecutivo</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>Descripción del Escenario</h4>
          <p>${scenario.description || 'Escenario generado para análisis prospectivo de la oferta educativa.'}</p>
        </div>
        <div class="info-card">
          <h4>Tipo de Análisis</h4>
          <p>Análisis ${scenario.scenario_type} basado en datos históricos y tendencias identificadas.</p>
        </div>
      </div>
    </div>
    
    ${scenarioDetails.value && scenarioDetails.value.projections ? `
    <div class="section">
      <h3>Indicadores Clave (Proyecciones)</h3>
      <table class="indicator-table">
        <thead>
          <tr>
            <th>Indicador</th>
            <th>Proyección 2025</th>
            <th>Proyección 2030</th>
            <th>Tendencia</th>
          </tr>
        </thead>
        <tbody>
          ${generateIndicatorRows(scenarioDetails.value.projections)}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div class="section">
      <h3>Implicaciones Estratégicas</h3>
      <ul class="implications-list">
        <li>Análisis de tendencias educativas basado en escenario ${scenario.scenario_type}</li>
        <li>Identificación de oportunidades y desafíos en la oferta educativa</li>
        <li>Recomendaciones para la planificación estratégica institucional</li>
      </ul>
    </div>
  `
}

const generateTechnicalContent = (scenario) => {
  return `
    <div class="section">
      <h3>Contexto del Escenario</h3>
      <div class="subsection">
        <h4>Información Técnica</h4>
        <p><strong>ID del Escenario:</strong> ${scenario.id}</p>
        <p><strong>Tipo de Escenario:</strong> ${scenario.scenario_type}</p>
        <p><strong>Metodología:</strong> Análisis prospectivo basado en datos históricos</p>
        <p><strong>Horizonte Temporal:</strong> 2025-2035</p>
      </div>
      
      <div class="subsection">
        <h4>Metadatos</h4>
        <p><strong>Creador:</strong> ${scenario.created_by_username}</p>
        <p><strong>Rol:</strong> ${scenario.created_by_role}</p>
        <p><strong>Fecha de Creación:</strong> ${formatDate(scenario.created_at)}</p>
        ${scenario.source_document ? `<p><strong>Fuente de Datos:</strong> ${scenario.source_document}</p>` : ''}
      </div>
    </div>
    
    ${scenarioDetails.value && scenarioDetails.value.projections ? `
    <div class="section">
      <h3>Datos Proyectados Completos</h3>
      <div class="projections-grid">
        ${Object.entries(scenarioDetails.value.projections).map(([key, projection]) => `
          <div class="projection-card">
            <h4>${key}</h4>
            ${Object.entries(projection).map(([year, value]) => `
              <div style="display: flex; justify-between; margin: 5px 0; font-size: 14px;">
                <span>${year}:</span>
                <strong>${formatNumber(value)}</strong>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="section">
      <h3>Consideraciones Técnicas</h3>
      <ul>
        <li>Los datos presentados son proyecciones basadas en análisis estadístico</li>
        <li>El escenario ${scenario.scenario_type} refleja una perspectiva específica de desarrollo</li>
        <li>Se recomienda complementar con análisis adicionales para toma de decisiones</li>
      </ul>
    </div>
  `
}

const generatePresentationContent = (scenario) => {
  return `
    <div class="section">
      <h3>Resumen del Escenario</h3>
      <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
        ${scenario.description || `Análisis prospectivo ${scenario.scenario_type} para la planificación educativa`}
      </p>
    </div>
    
    <div class="section">
      <h3>Puntos Clave</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h4>Características del Escenario</h4>
          <ul class="implications-list">
            <li>Tipo: ${scenario.scenario_type}</li>
            <li>Creado por: ${scenario.created_by_username}</li>
            <li>Fecha: ${formatDate(scenario.created_at)}</li>
          </ul>
        </div>
        <div>
          <h4>Aplicaciones</h4>
          <ul>
            <li>Planificación estratégica</li>
            <li>Análisis de tendencias</li>
            <li>Toma de decisiones</li>
          </ul>
        </div>
      </div>
    </div>
    
    ${scenarioDetails.value && scenarioDetails.value.projections ? `
    <div class="section">
      <h3>Proyecciones Destacadas</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        ${generateHighlightCards(scenarioDetails.value.projections)}
      </div>
    </div>
    ` : ''}
    
    <div class="section">
      <h3>Marco de Referencia</h3>
      <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
        Este escenario ${scenario.scenario_type} ha sido desarrollado como herramienta de apoyo para la planificación 
        educativa, proporcionando una visión prospectiva basada en el análisis de datos históricos y tendencias identificadas.
      </p>
    </div>
  `
}

const generateHighlightCards = (projections) => {
  if (!projections) return ''
  
  return Object.entries(projections).slice(0, 4).map(([indicator, data]) => {
    const years = Object.keys(data).sort()
    const firstYear = years[0]
    const lastYear = years[years.length - 1]
    const firstValue = data[firstYear]
    const lastValue = data[lastYear]
    const variation = firstValue ? ((lastValue - firstValue) / firstValue * 100).toFixed(1) : 0
    const isPositive = variation > 0
    
    return `
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
        <h5 style="margin: 0 0 10px 0; color: #333;">${indicator}</h5>
        <div style="font-size: 24px; font-weight: bold; color: #3B82F6; margin-bottom: 5px;">
          ${formatNumber(lastValue)}
        </div>
        <div style="font-size: 14px; color: ${isPositive ? 'green' : 'red'};">
          ${isPositive ? '↗' : '↘'} ${Math.abs(variation)}%
        </div>
      </div>
    `
  }).join('')
}

const generateIndicatorRows = (projections) => {
  if (!projections) return ''
  
  return Object.entries(projections).map(([indicator, data]) => {
    const years = Object.keys(data).sort()
    const value2025 = data['2025'] || data[years.find(y => y >= '2025')] || 'N/A'
    const value2030 = data['2030'] || data[years.find(y => y >= '2030')] || 'N/A'
    
    let trend = 'Estable'
    if (value2025 !== 'N/A' && value2030 !== 'N/A') {
      const variation = ((value2030 - value2025) / value2025 * 100)
      trend = variation > 5 ? 'Creciente' : variation < -5 ? 'Decreciente' : 'Estable'
    }
    
    return `
      <tr>
        <td>${indicator}</td>
        <td>${formatNumber(value2025)}</td>
        <td>${formatNumber(value2030)}</td>
        <td>${trend}</td>
      </tr>
    `
  }).join('')
}

const exportScenario = (scenario) => {
  exportToPDF(scenario)
}

const captureCharts = async () => {
  const charts = []
  
  try {
    // Buscar elementos de gráficas en el modal
    const chartElements = document.querySelectorAll('.chart-container, canvas, .recharts-wrapper, .highcharts-container')
    
    for (const element of chartElements) {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        // Usar html2canvas para capturar el elemento
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        charts.push({
          dataURL: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
          title: element.getAttribute('data-chart-title') || 'Gráfica'
        })
      }
    }
  } catch (error) {
    console.error('Error capturando gráficas:', error)
  }
  
  return charts
}

// Lifecycle
onMounted(() => {
  loadScenarios()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
