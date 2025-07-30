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
      <div v-if="filteredSectors.length === 0" class="text-center py-12">
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

// Datos de sectores económicos
const sectors = ref([
  {
    id: 1,
    name: 'Sector Primario',
    type: 'primario',
    description: 'Actividades que obtienen recursos directamente de la naturaleza',
    contribution: 12.3,
    color: '#16a34a',
    colorLight: '#dcfce7',
    icon: SearchIcon,
    expanded: false,
    stats: {
      jobs: '2.4 millones',
      growth: -1.2,
      companies: '124,500'
    },
    subsectors: [
      {
        name: 'Agricultura',
        description: 'Cultivo de plantas, frutas, verduras, hortalizas y forrajes',
        participation: 65
      },
      {
        name: 'Ganadería',
        description: 'Cría de animales para producción de carne, leche y derivados',
        participation: 20
      },
      {
        name: 'Pesca',
        description: 'Captura y cultivo de especies acuáticas para consumo humano',
        participation: 5
      },
      {
        name: 'Minería',
        description: 'Extracción de minerales, metales y recursos no renovables',
        participation: 8
      },
      {
        name: 'Silvicultura',
        description: 'Cultivo y explotación de bosques y recursos forestales',
        participation: 2
      }
    ],
    programs: [
      'Técnico en Producción Agropecuaria',
      'Tecnólogo en Gestión de Recursos Naturales',
      'Técnico en Explotación Agropecuaria Ecológica',
      'Tecnólogo en Producción Ganadera',
      'Técnico en Minería',
      'Tecnólogo en Gestión de Plantaciones Forestales'
    ]
  },
  {
    id: 2,
    name: 'Sector Secundario',
    type: 'secundario',
    description: 'Transformación de materias primas en productos elaborados o semielaborados',
    contribution: 27.8,
    color: '#2563eb',
    colorLight: '#dbeafe',
    icon: SearchIcon,
    expanded: false,
    stats: {
      jobs: '3.8 millones',
      growth: 2.4,
      companies: '87,300'
    },
    subsectors: [
      {
        name: 'Industria Manufacturera',
        description: 'Transformación mecánica, física o química de materiales en productos nuevos',
        participation: 58
      },
      {
        name: 'Construcción',
        description: 'Edificación de infraestructuras y obras civiles',
        participation: 32
      },
      {
        name: 'Generación de Energía',
        description: 'Producción y distribución de electricidad, gas y agua',
        participation: 10
      }
    ],
    programs: [
      'Técnico en Confección Industrial',
      'Tecnólogo en Construcción',
      'Técnico en Mecánica Industrial',
      'Tecnólogo en Mantenimiento Electromecánico',
      'Técnico en Procesamiento de Alimentos',
      'Tecnólogo en Gestión de la Producción Industrial'
    ]
  },
  {
    id: 3,
    name: 'Sector Terciario',
    type: 'terciario',
    description: 'Servicios y actividades que no producen bienes materiales',
    contribution: 52.6,
    color: '#9333ea',
    colorLight: '#f3e8ff',
    icon: SearchIcon,
    expanded: false,
    stats: {
      jobs: '8.7 millones',
      growth: 3.7,
      companies: '342,600'
    },
    subsectors: [
      {
        name: 'Comercio',
        description: 'Venta y distribución de productos al por mayor y menor',
        participation: 35
      },
      {
        name: 'Transporte',
        description: 'Traslado de personas y mercancías',
        participation: 15
      },
      {
        name: 'Turismo y Hostelería',
        description: 'Servicios de alojamiento, alimentación y actividades turísticas',
        participation: 12
      },
      {
        name: 'Servicios Financieros',
        description: 'Banca, seguros y actividades financieras',
        participation: 18
      },
      {
        name: 'Educación y Salud',
        description: 'Servicios educativos y de atención sanitaria',
        participation: 20
      }
    ],
    programs: [
      'Técnico en Ventas y Servicios',
      'Tecnólogo en Gestión Logística',
      'Técnico en Servicios Turísticos',
      'Tecnólogo en Gestión Bancaria y Entidades Financieras',
      'Técnico en Servicios de Salud',
      'Tecnólogo en Gestión Hotelera'
    ]
  },
  {
    id: 4,
    name: 'Sector Cuaternario',
    type: 'cuaternario',
    description: 'Servicios altamente intelectuales relacionados con la información y el conocimiento',
    contribution: 7.3,
    color: '#ea580c',
    colorLight: '#ffedd5',
    icon: SearchIcon,
    expanded: false,
    stats: {
      jobs: '1.2 millones',
      growth: 5.2,
      companies: '42,800'
    },
    subsectors: [
      {
        name: 'Tecnologías de la Información',
        description: 'Desarrollo de software, hardware y servicios informáticos',
        participation: 45
      },
      {
        name: 'Investigación y Desarrollo',
        description: 'Actividades científicas y de innovación',
        participation: 25
      },
      {
        name: 'Consultoría y Servicios Profesionales',
        description: 'Asesoramiento especializado a empresas y organizaciones',
        participation: 30
      }
    ],
    programs: [
      'Técnico en Programación de Software',
      'Tecnólogo en Análisis y Desarrollo de Sistemas',
      'Técnico en Sistemas',
      'Tecnólogo en Gestión de Redes',
      'Técnico en Diseño e Integración Multimedia',
      'Tecnólogo en Animación Digital'
    ]
  }
])

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
  setTimeout(() => {
    chartRendered.value = true
    // Aquí se podría inicializar un gráfico real con una librería como Chart.js
  }, 1000)
})
</script>