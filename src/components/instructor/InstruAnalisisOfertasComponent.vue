<template>
  <div class="mt-60 min-h-screen p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Análisis de Oferta Educativa</h1>
          <p class="text-gray-600 mt-2">
            Alineación de programas formativos con sectores estratégicos del territorio
          </p>
        </div>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Download class="h-4 w-4" />
          Exportar Análisis
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Panel de Filtros -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-medium flex items-center gap-2">
              <Filter class="h-5 w-5" />
              Filtros
            </h2>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="text-sm font-medium">Nivel Formativo</label>
              <select 
                v-model="selectedLevel" 
                class="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los niveles</option>
                <option value="tecnólogo">Tecnólogo</option>
                <option value="técnico">Técnico</option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium">Sector Estratégico</label>
              <select 
                v-model="selectedSector" 
                class="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los sectores</option>
                <option v-for="sector in sectores" :key="sector" :value="sector">
                  {{ sector }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">Líneas Medulares</label>
              <div class="space-y-2">
                <div v-for="linea in lineasMedulares" :key="linea" class="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    :id="linea" 
                    :checked="selectedLines.includes(linea)"
                    @change="handleLineToggle(linea)"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label :for="linea" class="text-sm">
                    {{ linea }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido Principal -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Resumen Ejecutivo -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Total Programas</p>
                    <p class="text-2xl font-bold">{{ filteredProgramas.length }}</p>
                  </div>
                  <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle class="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Cupos Ofertados</p>
                    <p class="text-2xl font-bold">{{ totalCupos }}</p>
                  </div>
                  <div class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp class="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Demanda Proyectada</p>
                    <p class="text-2xl font-bold">{{ totalDemanda }}</p>
                  </div>
                  <div class="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle class="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Matriz de Programas vs Sectores -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-medium">Matriz: Programas Formativos vs Sectores Estratégicos</h2>
              <p class="text-sm text-gray-600">
                Visualización de la distribución de programas por sector y nivel formativo
              </p>
            </div>
            <div class="p-4">
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left p-3 font-medium">Programa</th>
                      <th class="text-left p-3 font-medium">Nivel</th>
                      <th class="text-left p-3 font-medium">Sector</th>
                      <th class="text-left p-3 font-medium">Línea Medular</th>
                      <th class="text-center p-3 font-medium">Cupos</th>
                      <th class="text-center p-3 font-medium">Demanda</th>
                      <th class="text-center p-3 font-medium">Alineación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="programa in filteredProgramas" :key="programa.id" class="border-b hover:bg-gray-50">
                      <td class="p-3 font-medium">{{ programa.nombre }}</td>
                      <td class="p-3">
                        <span 
                          :class="[
                            'px-2 py-1 text-xs font-medium rounded-full', 
                            programa.nivel === 'tecnólogo' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          ]"
                        >
                          {{ programa.nivel }}
                        </span>
                      </td>
                      <td class="p-3">{{ programa.sector }}</td>
                      <td class="p-3 text-sm text-gray-600">{{ programa.lineaMedular }}</td>
                      <td class="p-3 text-center font-medium">{{ programa.cupos }}</td>
                      <td class="p-3 text-center font-medium">{{ programa.demanda }}</td>
                      <td class="p-3 text-center">
                        <div class="flex items-center justify-center">
                          <component 
                            :is="getAlignmentStatus(programa.cupos, programa.demanda).icon" 
                            class="h-4 w-4" 
                            :class="getAlignmentStatus(programa.cupos, programa.demanda).color" 
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Comparación Oferta vs Demanda -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-medium">Análisis Oferta vs Demanda por Sector</h2>
              <p class="text-sm text-gray-600">Comparación detallada entre la oferta actual y la demanda proyectada</p>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <template v-for="sector in sectores" :key="sector">
                  <div 
                    v-if="getProgramasBySector(sector).length > 0" 
                    class="border rounded-lg p-4"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <h4 class="font-medium">{{ sector }}</h4>
                      <span 
                        :class="[
                          'px-2 py-1 text-xs font-medium rounded-full', 
                          getPorcentajeCobertura(sector) >= 90 && getPorcentajeCobertura(sector) <= 110
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        ]"
                      >
                        {{ getPorcentajeCobertura(sector) }}% cobertura
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p class="text-sm text-gray-600">Oferta Actual</p>
                        <p class="text-lg font-semibold">{{ getCuposBySector(sector) }} cupos</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Demanda Proyectada</p>
                        <p class="text-lg font-semibold">{{ getDemandaBySector(sector) }} cupos</p>
                      </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                        :style="{ width: `${Math.min(getPorcentajeCobertura(sector), 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Texto Explicativo -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-medium">Interpretación de Resultados</h2>
            </div>
            <div class="p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-start gap-3">
                  <CheckCircle class="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 class="font-medium text-green-800">Alineación Óptima</h4>
                    <p class="text-sm text-gray-600">La oferta cubre entre 90-110% de la demanda proyectada</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <TrendingUp class="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 class="font-medium text-red-800">Déficit de Oferta</h4>
                    <p class="text-sm text-gray-600">La oferta es menor al 90% de la demanda proyectada</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <TrendingDown class="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 class="font-medium text-orange-800">Exceso de Oferta</h4>
                    <p class="text-sm text-gray-600">La oferta supera el 110% de la demanda proyectada</p>
                  </div>
                </div>
              </div>

              <hr class="border-t border-gray-200 my-4" />

              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-medium text-blue-900 mb-2">Recomendaciones Estratégicas</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Considerar incrementar cupos en programas con alta demanda no cubierta</li>
                  <li>• Evaluar la pertinencia de programas con baja demanda</li>
                  <li>• Fortalecer la articulación con sectores productivos estratégicos</li>
                  <li>• Monitorear tendencias del mercado laboral para ajustes futuros</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-vue-next'

const selectedLevel = ref('all')
const selectedSector = ref('all')
const selectedLines = ref([])

// Datos de ejemplo
const programas = ref([
  {
    id: 1,
    nombre: "Desarrollo de Software",
    nivel: "tecnólogo",
    sector: "TIC",
    lineaMedular: "Tecnología Digital",
    cupos: 120,
    demanda: 150,
  },
  {
    id: 2,
    nombre: "Redes y Telecomunicaciones",
    nivel: "técnico",
    sector: "TIC",
    lineaMedular: "Tecnología Digital",
    cupos: 80,
    demanda: 95,
  },
  {
    id: 3,
    nombre: "Gestión Empresarial",
    nivel: "tecnólogo",
    sector: "Servicios",
    lineaMedular: "Gestión y Administración",
    cupos: 100,
    demanda: 85,
  },
  {
    id: 4,
    nombre: "Contabilidad y Finanzas",
    nivel: "técnico",
    sector: "Servicios",
    lineaMedular: "Gestión y Administración",
    cupos: 90,
    demanda: 110,
  },
  {
    id: 5,
    nombre: "Mecatrónica Industrial",
    nivel: "tecnólogo",
    sector: "Industrial",
    lineaMedular: "Manufactura Avanzada",
    cupos: 60,
    demanda: 75,
  },
  {
    id: 6,
    nombre: "Mantenimiento Electromecánico",
    nivel: "técnico",
    sector: "Industrial",
    lineaMedular: "Manufactura Avanzada",
    cupos: 70,
    demanda: 80,
  },
  {
    id: 7,
    nombre: "Logística Empresarial",
    nivel: "tecnólogo",
    sector: "Logística",
    lineaMedular: "Cadena de Suministro",
    cupos: 85,
    demanda: 95,
  },
  {
    id: 8,
    nombre: "Gestión Ambiental",
    nivel: "técnico",
    sector: "Ambiental",
    lineaMedular: "Sostenibilidad",
    cupos: 50,
    demanda: 40,
  },
])

const sectores = ["TIC", "Industrial", "Servicios", "Logística", "Ambiental"]
const lineasMedulares = [
  "Tecnología Digital",
  "Manufactura Avanzada",
  "Gestión y Administración",
  "Cadena de Suministro",
  "Sostenibilidad",
]

const handleLineToggle = (line) => {
  if (selectedLines.value.includes(line)) {
    selectedLines.value = selectedLines.value.filter(l => l !== line)
  } else {
    selectedLines.value.push(line)
  }
}

const filteredProgramas = computed(() => {
  return programas.value.filter(programa => {
    if (selectedLevel.value !== 'all' && programa.nivel !== selectedLevel.value) return false
    if (selectedSector.value !== 'all' && programa.sector !== selectedSector.value) return false
    if (selectedLines.value.length > 0 && !selectedLines.value.includes(programa.lineaMedular)) return false
    return true
  })
})

const getAlignmentStatus = (cupos, demanda) => {
  const ratio = cupos / demanda
  if (ratio >= 0.9 && ratio <= 1.1) return { status: "optimal", icon: CheckCircle, color: "text-green-600" }
  if (ratio > 1.1) return { status: "oversupply", icon: TrendingDown, color: "text-orange-600" }
  return { status: "undersupply", icon: TrendingUp, color: "text-red-600" }
}

const totalCupos = computed(() => {
  return filteredProgramas.value.reduce((sum, p) => sum + p.cupos, 0)
})

const totalDemanda = computed(() => {
  return filteredProgramas.value.reduce((sum, p) => sum + p.demanda, 0)
})

const getProgramasBySector = (sector) => {
  return filteredProgramas.value.filter(p => p.sector === sector)
}

const getCuposBySector = (sector) => {
  return getProgramasBySector(sector).reduce((sum, p) => sum + p.cupos, 0)
}

const getDemandaBySector = (sector) => {
  return getProgramasBySector(sector).reduce((sum, p) => sum + p.demanda, 0)
}

const getPorcentajeCobertura = (sector) => {
  const cupos = getCuposBySector(sector)
  const demanda = getDemandaBySector(sector)
  return Math.round((cupos / demanda) * 100)
}
</script>