<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6 flex items-center">
      <!-- Icono antes del texto -->
       <img src="/src/assets/book.svg" alt="Icono" class="w-6 h-6 mr-2">
       Biblioteca de Documentos Estratégicos
      </h1>

    <p class="text-gray-600 mb-8">
      Consulta documentos como planes de desarrollo, matrices DOFA, estudios prospectivos y más.
    </p>
    
    <!-- Sección de filtros -->
    <div class="bg-white rounded-lg shadow mb-6 p-6">
      <div class="text-lg font-medium mb-4">Filtros</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Filtro por año -->
        <div>
          <label class="text-sm font-medium mb-1 block">Año de vigencia</label>
          <select 
            v-model="filtroAño" 
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option v-for="año in años" :key="año" :value="año">{{ año }}</option>
          </select>
        </div>

        <!-- Filtro por sector -->
        <div>
          <label class="text-sm font-medium mb-1 block">Sector económico</label>
          <select 
            v-model="filtroSector" 
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option v-for="sector in sectores" :key="sector" :value="sector">{{ sector }}</option>
          </select>
        </div>

        <!-- Filtro por línea medular -->
        <div>
          <label class="text-sm font-medium mb-1 block">Línea medular</label>
          <select 
            v-model="filtroLinea" 
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option v-for="linea in lineasMedulares" :key="linea" :value="linea">{{ linea }}</option>
          </select>
        </div>

        <!-- Filtro por tipo de documento -->
        <div>
          <label class="text-sm font-medium mb-1 block">Tipo de documento</label>
          <select 
            v-model="filtroTipo" 
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">{{ tipo }}</option>
          </select>
        </div>

        <!-- Buscador por nombre -->
        <div>
          <label class="text-sm font-medium mb-1 block">Buscar por nombre</label>
          <div class="relative">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar documento..."
              class="w-full pl-8 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de resultados -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre del documento
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vigencia
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sector
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Línea medular
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo de documento
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="documentosFiltrados.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-gray-500">
              No se encontraron documentos con los criterios seleccionados.
            </td>
          </tr>
          <tr v-for="documento in documentosFiltrados" :key="documento.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ documento.nombre }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ documento.vigencia }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ documento.sector }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ documento.lineaMedular }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ documento.tipo }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button 
                  @click="verDocumento(documento)" 
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Eye class="h-4 w-4 mr-1" />
                  Ver
                </button>
                <a 
                  :href="documento.url" 
                  download 
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Download class="h-4 w-4 mr-1" />
                  Descargar
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para visualizar documentos -->
    <div v-if="visorAbierto" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Fondo oscuro -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="visorAbierto = false"></div>

        <!-- Contenido del modal -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ documentoSeleccionado?.nombre }}
                </h3>
                <div class="mt-4 h-[60vh]">
                  <div class="bg-gray-100 rounded-md p-4 h-full flex items-center justify-center">
                    <div class="flex flex-col items-center gap-2">
                      <FileText class="h-16 w-16 text-gray-400" />
                      <p class="text-center text-gray-500">
                        Visor de PDF embebido (en un entorno real, aquí se mostraría el documento)
                      </p>
                      <a 
                        :href="documentoSeleccionado?.url" 
                        download 
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <Download class="h-4 w-4 mr-2" />
                        Descargar documento
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="visorAbierto = false"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, FileText, Download, Eye } from 'lucide-vue-next'

// Datos de ejemplo
const documentosEjemplo = [
  {
    id: 1,
    nombre: "Plan de Desarrollo Estratégico 2023",
    vigencia: "2023-2025",
    sector: "Tecnología",
    lineaMedular: "Innovación",
    tipo: "Plan de Desarrollo",
    url: "/documentos/plan-desarrollo-2023.pdf",
  },
  {
    id: 2,
    nombre: "Matriz DOFA Sector Agrícola",
    vigencia: "2023-2024",
    sector: "Agricultura",
    lineaMedular: "Sostenibilidad",
    tipo: "Matriz DOFA",
    url: "/documentos/dofa-agricultura.pdf",
  },
  {
    id: 3,
    nombre: "Estudio Prospectivo Energías Renovables",
    vigencia: "2023-2030",
    sector: "Energía",
    lineaMedular: "Sostenibilidad",
    tipo: "Estudio Prospectivo",
    url: "/documentos/estudio-energias.pdf",
  },
  {
    id: 4,
    nombre: "Plan Estratégico de Transformación Digital",
    vigencia: "2022-2025",
    sector: "Tecnología",
    lineaMedular: "Digitalización",
    tipo: "Plan Estratégico",
    url: "/documentos/plan-transformacion-digital.pdf",
  },
  {
    id: 5,
    nombre: "Análisis de Mercado Sector Financiero",
    vigencia: "2023-2024",
    sector: "Finanzas",
    lineaMedular: "Análisis",
    tipo: "Estudio de Mercado",
    url: "/documentos/analisis-financiero.pdf",
  },
]

// Opciones para los filtros
const años = ["Todos", "2022", "2023", "2024", "2025", "2026"]
const sectores = ["Todos", "Tecnología", "Agricultura", "Energía", "Finanzas", "Salud", "Educación"]
const lineasMedulares = ["Todas", "Innovación", "Sostenibilidad", "Digitalización", "Análisis", "Desarrollo"]
const tiposDocumento = [
  "Todos",
  "Plan de Desarrollo",
  "Matriz DOFA",
  "Estudio Prospectivo",
  "Plan Estratégico",
  "Estudio de Mercado",
]

// Estados reactivos
const filtroAño = ref("Todos")
const filtroSector = ref("Todos")
const filtroLinea = ref("Todas")
const filtroTipo = ref("Todos")
const busqueda = ref("")
const documentoSeleccionado = ref(null)
const visorAbierto = ref(false)

// Filtrar documentos según los criterios seleccionados
const documentosFiltrados = computed(() => {
  return documentosEjemplo.filter((doc) => {
    // Filtrar por año
    if (filtroAño.value !== "Todos" && !doc.vigencia.includes(filtroAño.value)) {
      return false
    }

    // Filtrar por sector
    if (filtroSector.value !== "Todos" && doc.sector !== filtroSector.value) {
      return false
    }

    // Filtrar por línea medular
    if (filtroLinea.value !== "Todas" && doc.lineaMedular !== filtroLinea.value) {
      return false
    }

    // Filtrar por tipo de documento
    if (filtroTipo.value !== "Todos" && doc.tipo !== filtroTipo.value) {
      return false
    }

    // Filtrar por texto de búsqueda
    if (busqueda.value && !doc.nombre.toLowerCase().includes(busqueda.value.toLowerCase())) {
      return false
    }

    return true
  })
})

// Función para ver un documento
const verDocumento = (documento) => {
  documentoSeleccionado.value = documento
  visorAbierto.value = true
}
</script>