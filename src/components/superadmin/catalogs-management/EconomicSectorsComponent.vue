<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold">Sectores Económicos</h1>
        <p class="mt-2 text-green-100">
          Análisis y visualización de los sectores productivos y su impacto en la economía nacional
        </p>
      </div>
    </header>

    <!-- Filtros y búsqueda -->
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="relative flex-grow">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar sector o actividad económica..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(sector, index) in sectorTypes"
              :key="index"
              @click="toggleSectorFilter(sector.id)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeSectorFilters.includes(sector.id)
                  ? `bg-${sector.color}-100 text-${sector.color}-800 border border-${sector.color}-300`
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              ]"
            >
              {{ sector.name }}
            </button>
            <button
              v-if="activeSectorFilters.length > 0 || searchTerm"
              @click="clearFilters"
              class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          v-for="(stat, index) in sectorStats" 
          :key="index"
          class="bg-white rounded-lg shadow-md p-4 border-l-4"
          :class="`border-${stat.color}-500`"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ stat.name }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-sm mt-1">
                <span 
                  :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                </span>
                <span class="text-gray-500 ml-1">vs año anterior</span>
              </p>
            </div>
            <div :class="`bg-${stat.color}-100 p-3 rounded-full`">
              <component :is="stat.icon" :class="`h-6 w-6 text-${stat.color}-600`" />
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de distribución -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-bold mb-4">Distribución del PIB por Sectores</h2>
        <div class="h-80 flex items-center justify-center">
          <div class="w-full h-full" ref="chartContainer">
            <!-- El gráfico se renderizará aquí -->
            <div class="flex items-center justify-center h-full" v-if="!chartRendered">
              <div class="flex flex-col items-center">
                <SearchIcon class="h-12 w-12 text-gray-400 animate-pulse" />
                <p class="text-gray-500 mt-2">Cargando gráfico...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de sectores -->
    <div class="container mx-auto px-4 pb-12">
      <!-- Added loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span class="ml-2 text-gray-600">Cargando sectores económicos...</span>
      </div>
      
      <div v-else-if="filteredSectors.length === 0" class="text-center py-12">
        <SearchIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-medium text-gray-600">No se encontraron sectores</h3>
        <p class="text-gray-500 mt-2">Intenta con otros términos de búsqueda o filtros</p>
      </div>

      <div v-else>
        <div v-for="(mainSector, index) in filteredSectors" :key="index" class="mb-8">
          <div 
            class="bg-white rounded-lg shadow-md overflow-hidden"
            :class="{'border-l-4': mainSector.expanded}"
            :style="mainSector.expanded ? `border-color: ${mainSector.color}` : ''"
          >
            <!-- Cabecera del sector principal -->
            <div 
              @click="toggleSector(mainSector.id)"
              class="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center">
                <div 
                  class="p-2 rounded-full mr-4"
                  :style="`background-color: ${mainSector.colorLight}`"
                >
                  <component :is="mainSector.icon" class="h-6 w-6" :style="`color: ${mainSector.color}`" />
                </div>
                <div>
                  <h2 class="text-xl font-bold">{{ mainSector.name }}</h2>
                  <p class="text-gray-600">{{ mainSector.description }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <span 
                  class="px-3 py-1 rounded-full text-sm font-medium mr-4"
                  :style="`background-color: ${mainSector.colorLight}; color: ${mainSector.color}`"
                >
                  {{ mainSector.contribution }}% del PIB
                </span>
                <ChevronDownIcon 
                  class="h-5 w-5 text-gray-400 transition-transform duration-300"
                  :class="{'transform rotate-180': mainSector.expanded}"
                />
              </div>
            </div>

            <!-- Contenido expandible -->
            <div v-if="mainSector.expanded" class="border-t border-gray-100">
              <!-- Estadísticas del sector -->
              <div class="p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-500">Empleos generados</p>
                    <p class="text-xl font-bold">{{ mainSector.stats.jobs }}</p>
                  </div>
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-500">Crecimiento anual</p>
                    <p class="text-xl font-bold" :class="mainSector.stats.growth >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ mainSector.stats.growth > 0 ? '+' : '' }}{{ mainSector.stats.growth }}%
                    </p>
                  </div>
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-500">Empresas registradas</p>
                    <p class="text-xl font-bold">{{ mainSector.stats.companies }}</p>
                  </div>
                </div>
              </div>

              <!-- Subsectores -->
              <div class="p-4">
                <h3 class="text-lg font-semibold mb-3">Subsectores</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    v-for="(subsector, subIndex) in mainSector.subsectors" 
                    :key="subIndex"
                    class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div class="flex items-center mb-2">
                      <div 
                        class="w-2 h-2 rounded-full mr-2"
                        :style="`background-color: ${mainSector.color}`"
                      ></div>
                      <h4 class="font-medium">{{ subsector.name }}</h4>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ subsector.description }}</p>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Participación:</span>
                      <span class="font-medium">{{ subsector.participation }}%</span>
                    </div>
                    <div class="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        class="h-1.5 rounded-full" 
                        :style="`width: ${subsector.participation}%; background-color: ${mainSector.color}`"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Programas de formación relacionados -->
              <div class="p-4 border-t border-gray-100">
                <h3 class="text-lg font-semibold mb-3">Programas de formación relacionados</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    v-for="(program, progIndex) in mainSector.programs" 
                    :key="progIndex"
                    class="flex items-center p-2 border border-gray-200 rounded-lg"
                  >
                    <AcademicCapIcon class="h-5 w-5 text-gray-500 mr-2" />
                    <span>{{ program }}</span>
                  </div>
                </div>
              </div>

              <!-- Botón para más información -->
              <div class="p-4 border-t border-gray-100 flex justify-end">
                <button 
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  :style="`background-color: ${mainSector.colorLight}; color: ${mainSector.color}`"
                >
                  Ver análisis completo
                  <SearchIcon class="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- Cerrado correctamente el div contenedor -->
    
    <!-- Added error notification -->
    <div v-if="showErrorNotification" class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  SearchIcon, 
  ChevronDownIcon, 
  AcademicCapIcon
} from '@heroicons/vue/outline'

const isLoading = ref(false);
const showErrorNotification = ref(false);
const errorMessage = ref('');

// Estado para búsqueda y filtros
const searchTerm = ref('')
const activeSectorFilters = ref([])
const chartRendered = ref(false)
const chartContainer = ref(null)

// Tipos de sectores para filtros
const sectorTypes = [
  { id: 'primario', name: 'Sector Primario', color: 'green' },
  { id: 'secundario', name: 'Sector Secundario', color: 'blue' },
  { id: 'terciario', name: 'Sector Terciario', color: 'purple' },
  { id: 'cuaternario', name: 'Sector Cuaternario', color: 'orange' }
]

// Estadísticas generales
const sectorStats = [
  { 
    name: 'Sector Primario', 
    value: '12.3%', 
    trend: -1.2, 
    color: 'green',
    icon: SearchIcon
  },
  { 
    name: 'Sector Secundario', 
    value: '27.8%', 
    trend: 2.4, 
    color: 'blue',
    icon: SearchIcon
  },
  { 
    name: 'Sector Terciario', 
    value: '52.6%', 
    trend: 3.7, 
    color: 'purple',
    icon: SearchIcon
  },
  { 
    name: 'Sector Cuaternario', 
    value: '7.3%', 
    trend: 5.2, 
    color: 'orange',
    icon: SearchIcon
  }
]

const sectors = ref([])

const fetchEconomicSectors = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/catalogs/sectors/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      sectors.value = data.map(sector => ({
        id: sector.id,
        name: sector.name,
        type: sector.sector_type || 'general',
        description: sector.description || '',
        contribution: sector.gdp_contribution || 0,
        color: getSectorColor(sector.sector_type),
        colorLight: getSectorColorLight(sector.sector_type),
        icon: SearchIcon,
        expanded: false,
        stats: {
          jobs: sector.jobs_generated || '0',
          growth: sector.annual_growth || 0,
          companies: sector.registered_companies || '0'
        },
        subsectors: sector.subsectors || [],
        programs: sector.related_programs || []
      }));
    } else {
      throw new Error('Error al cargar sectores económicos');
    }
  } catch (error) {
    console.error('Error loading economic sectors:', error);
    showError('Error al cargar los sectores económicos desde el servidor');
    // Fallback to mock data
    loadMockData();
  } finally {
    isLoading.value = false;
  }
};

const getSectorColor = (type) => {
  const colors = {
    'primario': '#16a34a',
    'secundario': '#2563eb',
    'terciario': '#9333ea',
    'cuaternario': '#ea580c'
  };
  return colors[type] || '#6b7280';
};

const getSectorColorLight = (type) => {
  const colors = {
    'primario': '#dcfce7',
    'secundario': '#dbeafe',
    'terciario': '#f3e8ff',
    'cuaternario': '#ffedd5'
  };
  return colors[type] || '#f3f4f6';
};

const showError = (message) => {
  errorMessage.value = message;
  showErrorNotification.value = true;
  setTimeout(() => {
    showErrorNotification.value = false;
  }, 5000);
};

const loadMockData = () => {
  sectors.value = [];
};

// Funciones para manejar filtros
const toggleSectorFilter = (sectorId) => {
  const index = activeSectorFilters.value.indexOf(sectorId)
  if (index === -1) {
    activeSectorFilters.value.push(sectorId)
  } else {
    activeSectorFilters.value.splice(index, 1)
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  activeSectorFilters.value = []
}

// Función para expandir/colapsar sectores
const toggleSector = (sectorId) => {
  const sector = sectors.value.find(s => s.id === sectorId)
  if (sector) {
    sector.expanded = !sector.expanded
  }
}

// Sectores filtrados según búsqueda y filtros activos
const filteredSectors = computed(() => {
  return sectors.value.filter(sector => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      searchTerm.value === '' || 
      sector.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sector.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sector.subsectors.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    
    // Filtrar por tipo de sector
    const matchesType = 
      activeSectorFilters.value.length === 0 || 
      activeSectorFilters.value.includes(sector.type)
    
    return matchesSearch && matchesType
  })
})

// Simulación de renderizado de gráfico
onMounted(() => {
  fetchEconomicSectors();
  setTimeout(() => {
    chartRendered.value = true
    // Aquí se podría inicializar un gráfico real con una librería como Chart.js
  }, 1000)
})
</script>
