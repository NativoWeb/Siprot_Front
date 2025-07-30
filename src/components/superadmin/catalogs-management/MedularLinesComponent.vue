<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Encabezado -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Líneas Medulares Institucionales</h1>
        <p class="mt-2 text-gray-600">
          Ejes fundamentales que articulan la formación profesional y el desarrollo institucional
        </p>
      </div>

      <!-- Panel de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 mr-4">
              <SearchIcon class="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Líneas Activas</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalLineas }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 mr-4">
              <SearchIcon class="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Programas Asociados</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalProgramas }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 mr-4">
              <SearchIcon class="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Aprendices Impactados</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.aprendicesImpactados) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-amber-100 mr-4">
              <SearchIcon class="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Sectores Vinculados</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.sectoresVinculados }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="relative flex-grow">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por nombre o descripción..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button
              v-for="categoria in categorias"
              :key="categoria.id"
              @click="toggleCategoriaFilter(categoria.id)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                categoriaFilters.includes(categoria.id)
                  ? `bg-${categoria.color}-100 text-${categoria.color}-800 border border-${categoria.color}-300`
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              ]"
            >
              {{ categoria.nombre }}
            </button>
            
            <button
              v-if="searchTerm || categoriaFilters.length > 0"
              @click="clearFilters"
              class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Visualización de líneas medulares -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div
          v-for="linea in filteredLineas"
          :key="linea.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-t-4"
          :class="`border-${linea.categoria.color}-500`"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <div 
                  class="p-3 rounded-full mr-4"
                  :class="`bg-${linea.categoria.color}-100`"
                >
                  <component 
                    :is="getIconComponent(linea.icono)" 
                    class="h-6 w-6"
                    :class="`text-${linea.categoria.color}-500`"
                  />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">{{ linea.nombre }}</h2>
                  <div class="flex items-center mt-1">
                    <span 
                      class="text-xs font-medium px-2 py-0.5 rounded-full"
                      :class="`bg-${linea.categoria.color}-100 text-${linea.categoria.color}-800`"
                    >
                      {{ linea.categoria.nombre }}
                    </span>
                    <span class="mx-2 text-gray-400">•</span>
                    <span class="text-sm text-gray-500">{{ linea.programas.length }} programas</span>
                  </div>
                </div>
              </div>
              <button 
                @click="toggleExpanded(linea.id)"
                class="p-1 rounded-full hover:bg-gray-100"
              >
                <SearchIcon 
                  class="h-5 w-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedLineas.includes(linea.id) }"
                />
              </button>
            </div>
            
            <p class="mt-4 text-gray-600">{{ linea.descripcion }}</p>
            
            <div class="mt-4">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Cumplimiento de objetivos</span>
                <span class="text-sm font-medium text-gray-700">{{ linea.cumplimiento }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full"
                  :class="`bg-${linea.categoria.color}-500`"
                  :style="{ width: `${linea.cumplimiento}%` }"
                ></div>
              </div>
            </div>
            
            <!-- Contenido expandible -->
            <div 
              v-if="expandedLineas.includes(linea.id)"
              class="mt-6 border-t border-gray-200 pt-4 transition-all duration-500 ease-in-out"
            >
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Objetivos Estratégicos</h3>
              <ul class="space-y-2">
                <li 
                  v-for="(objetivo, index) in linea.objetivos" 
                  :key="index"
                  class="flex items-start"
                >
                  <SearchIcon class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span class="text-gray-600">{{ objetivo }}</span>
                </li>
              </ul>
              
              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">Programas Asociados</h3>
              <div class="space-y-3">
                <div 
                  v-for="programa in linea.programas" 
                  :key="programa.id"
                  class="bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ programa.nombre }}</h4>
                      <p class="text-sm text-gray-500">{{ programa.nivel }}</p>
                    </div>
                    <span 
                      class="text-xs font-medium px-2 py-0.5 rounded-full"
                      :class="getEstadoClass(programa.estado)"
                    >
                      {{ programa.estado }}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">Sectores Económicos Relacionados</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="sector in linea.sectores" 
                  :key="sector.id"
                  class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {{ sector.nombre }}
                </span>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button 
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Ver detalles completos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mensaje sin resultados -->
      <div 
        v-if="filteredLineas.length === 0"
        class="bg-white rounded-lg shadow p-8 text-center"
      >
        <SearchIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">No se encontraron resultados</h3>
        <p class="text-gray-500">Intenta con otros términos de búsqueda o elimina los filtros aplicados.</p>
        <button 
          @click="clearFilters"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  SearchIcon
} from '@heroicons/vue/outline'

// Datos de ejemplo
const categorias = [
  { id: 'tecnologica', nombre: 'Tecnológica', color: 'blue' },
  { id: 'pedagogica', nombre: 'Pedagógica', color: 'green' },
  { id: 'investigacion', nombre: 'Investigación', color: 'purple' },
  { id: 'emprendimiento', nombre: 'Emprendimiento', color: 'amber' },
  { id: 'sostenibilidad', nombre: 'Sostenibilidad', color: 'emerald' }
]

const lineasMedulares = [
  {
    id: 1,
    nombre: 'Transformación Digital',
    descripcion: 'Integración de tecnologías digitales en todos los procesos formativos y administrativos para potenciar la innovación y eficiencia institucional.',
    categoria: { id: 'tecnologica', nombre: 'Tecnológica', color: 'blue' },
    icono: 'SearchIcon',
    cumplimiento: 78,
    objetivos: [
      'Implementar plataformas digitales para la formación virtual y presencial',
      'Desarrollar competencias digitales en instructores y aprendices',
      'Modernizar la infraestructura tecnológica institucional',
      'Fomentar la cultura digital en todos los niveles organizacionales'
    ],
    programas: [
      { id: 101, nombre: 'Desarrollo de Software', nivel: 'Tecnólogo', estado: 'Activo' },
      { id: 102, nombre: 'Análisis de Datos', nivel: 'Especialización', estado: 'Nuevo' },
      { id: 103, nombre: 'Ciberseguridad', nivel: 'Tecnólogo', estado: 'Activo' },
      { id: 104, nombre: 'Inteligencia Artificial', nivel: 'Especialización', estado: 'En desarrollo' }
    ],
    sectores: [
      { id: 201, nombre: 'Tecnologías de la Información' },
      { id: 202, nombre: 'Telecomunicaciones' },
      { id: 203, nombre: 'Industria 4.0' }
    ]
  },
  {
    id: 2,
    nombre: 'Formación Basada en Proyectos',
    descripcion: 'Metodología pedagógica centrada en el desarrollo de proyectos reales que integran competencias técnicas y transversales para responder a necesidades del sector productivo.',
    categoria: { id: 'pedagogica', nombre: 'Pedagógica', color: 'green' },
    icono: 'SearchIcon',
    cumplimiento: 85,
    objetivos: [
      'Implementar metodologías activas centradas en el aprendiz',
      'Desarrollar proyectos formativos con impacto en el sector productivo',
      'Fortalecer el trabajo colaborativo y las competencias blandas',
      'Evaluar por resultados de aprendizaje demostrables'
    ],
    programas: [
      { id: 105, nombre: 'Gestión de Proyectos', nivel: 'Tecnólogo', estado: 'Activo' },
      { id: 106, nombre: 'Diseño de Experiencias de Aprendizaje', nivel: 'Curso', estado: 'Activo' },
      { id: 107, nombre: 'Evaluación por Competencias', nivel: 'Diplomado', estado: 'Activo' }
    ],
    sectores: [
      { id: 204, nombre: 'Educación' },
      { id: 205, nombre: 'Consultoría' },
      { id: 206, nombre: 'Gestión del Conocimiento' }
    ]
  },
  {
    id: 3,
    nombre: 'Investigación Aplicada',
    descripcion: 'Desarrollo de procesos de investigación orientados a la solución de problemas reales del sector productivo y la generación de innovación tecnológica y social.',
    categoria: { id: 'investigacion', nombre: 'Investigación', color: 'purple' },
    icono: 'SearchIcon',
    cumplimiento: 62,
    objetivos: [
      'Fortalecer grupos de investigación aplicada en áreas estratégicas',
      'Desarrollar proyectos de innovación con el sector productivo',
      'Fomentar la cultura investigativa en aprendices e instructores',
      'Transferir conocimiento y tecnología a las empresas'
    ],
    programas: [
      { id: 108, nombre: 'Semilleros de Investigación', nivel: 'Transversal', estado: 'Activo' },
      { id: 109, nombre: 'Metodología de la Investigación', nivel: 'Curso', estado: 'Activo' },
      { id: 110, nombre: 'Gestión de la Innovación', nivel: 'Especialización', estado: 'Nuevo' }
    ],
    sectores: [
      { id: 207, nombre: 'Investigación y Desarrollo' },
      { id: 208, nombre: 'Biotecnología' },
      { id: 209, nombre: 'Energías Renovables' }
    ]
  },
  {
    id: 4,
    nombre: 'Emprendimiento e Innovación',
    descripcion: 'Fomento de la cultura emprendedora y el desarrollo de competencias para la creación y gestión de empresas innovadoras que respondan a las necesidades del mercado.',
    categoria: { id: 'emprendimiento', nombre: 'Emprendimiento', color: 'amber' },
    icono: 'SearchIcon',
    cumplimiento: 70,
    objetivos: [
      'Desarrollar competencias emprendedoras en los aprendices',
      'Incubar proyectos empresariales innovadores',
      'Fortalecer el ecosistema de emprendimiento institucional',
      'Conectar emprendimientos con fuentes de financiación'
    ],
    programas: [
      { id: 111, nombre: 'Creación de Startups', nivel: 'Tecnólogo', estado: 'Activo' },
      { id: 112, nombre: 'Modelos de Negocio', nivel: 'Curso', estado: 'Activo' },
      { id: 113, nombre: 'Financiación de Emprendimientos', nivel: 'Diplomado', estado: 'En desarrollo' }
    ],
    sectores: [
      { id: 210, nombre: 'Emprendimiento' },
      { id: 211, nombre: 'Economía Naranja' },
      { id: 212, nombre: 'Fintech' }
    ]
  },
  {
    id: 5,
    nombre: 'Desarrollo Sostenible',
    descripcion: 'Integración de principios de sostenibilidad ambiental, social y económica en todos los procesos formativos y operativos de la institución.',
    categoria: { id: 'sostenibilidad', nombre: 'Sostenibilidad', color: 'emerald' },
    icono: 'SearchIcon',
    cumplimiento: 65,
    objetivos: [
      'Implementar prácticas sostenibles en ambientes de formación',
      'Desarrollar competencias en economía circular y verde',
      'Reducir la huella ambiental institucional',
      'Fomentar proyectos de impacto social y ambiental'
    ],
    programas: [
      { id: 114, nombre: 'Gestión Ambiental', nivel: 'Tecnólogo', estado: 'Activo' },
      { id: 115, nombre: 'Economía Circular', nivel: 'Curso', estado: 'Nuevo' },
      { id: 116, nombre: 'Energías Renovables', nivel: 'Tecnólogo', estado: 'Activo' }
    ],
    sectores: [
      { id: 213, nombre: 'Medio Ambiente' },
      { id: 214, nombre: 'Energías Limpias' },
      { id: 215, nombre: 'Desarrollo Social' }
    ]
  },
  {
    id: 6,
    nombre: 'Bilingüismo y Competencias Globales',
    descripcion: 'Fortalecimiento de competencias comunicativas en lenguas extranjeras y habilidades interculturales para la inserción en mercados globales.',
    categoria: { id: 'pedagogica', nombre: 'Pedagógica', color: 'green' },
    icono: 'SearchIcon',
    cumplimiento: 55,
    objetivos: [
      'Implementar estrategias de bilingüismo en todos los programas',
      'Desarrollar competencias interculturales en aprendices',
      'Fomentar la movilidad internacional académica',
      'Certificar competencias en lenguas extranjeras'
    ],
    programas: [
      { id: 117, nombre: 'Inglés para Propósitos Específicos', nivel: 'Curso', estado: 'Activo' },
      { id: 118, nombre: 'Comunicación Intercultural', nivel: 'Diplomado', estado: 'En desarrollo' },
      { id: 119, nombre: 'Preparación para Certificaciones Internacionales', nivel: 'Curso', estado: 'Activo' }
    ],
    sectores: [
      { id: 216, nombre: 'Servicios Internacionales' },
      { id: 217, nombre: 'Turismo' },
      { id: 218, nombre: 'BPO' }
    ]
  }
]

// Estadísticas calculadas
const stats = {
  totalLineas: lineasMedulares.length,
  totalProgramas: lineasMedulares.reduce((total, linea) => total + linea.programas.length, 0),
  aprendicesImpactados: 125840,
  sectoresVinculados: [...new Set(lineasMedulares.flatMap(linea => linea.sectores.map(sector => sector.id)))].length
}

// Estado reactivo
const searchTerm = ref('')
const categoriaFilters = ref([])
const expandedLineas = ref([])

// Métodos
const toggleCategoriaFilter = (categoriaId) => {
  const index = categoriaFilters.value.indexOf(categoriaId)
  if (index === -1) {
    categoriaFilters.value.push(categoriaId)
  } else {
    categoriaFilters.value.splice(index, 1)
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  categoriaFilters.value = []
}

const toggleExpanded = (lineaId) => {
  const index = expandedLineas.value.indexOf(lineaId)
  if (index === -1) {
    expandedLineas.value.push(lineaId)
  } else {
    expandedLineas.value.splice(index, 1)
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const getIconComponent = (iconName) => {
  const icons = {
    SearchIcon,
    SearchIcon,
    SearchIcon,
    SearchIcon
  }
  return icons[iconName] || SearchIcon
}

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Activo':
      return 'bg-green-100 text-green-800'
    case 'Nuevo':
      return 'bg-blue-100 text-blue-800'
    case 'En desarrollo':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Datos filtrados
const filteredLineas = computed(() => {
  return lineasMedulares.filter(linea => {
    const matchesSearch = searchTerm.value === '' || 
      linea.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      linea.descripcion.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesCategoria = categoriaFilters.value.length === 0 || 
      categoriaFilters.value.includes(linea.categoria.id)
    
    return matchesSearch && matchesCategoria
  })
})
</script>