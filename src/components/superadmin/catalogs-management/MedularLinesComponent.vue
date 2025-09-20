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

      <!-- 🔹 Formulario de creación -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Crear nueva línea medular</h2>
        <form @submit.prevent="createCoreLine" class="grid gap-4 md:grid-cols-2">
          <input
            v-model="newCoreLine.name"
            type="text"
            placeholder="Nombre de la línea"
            class="border p-2 rounded col-span-2"
            required
          />
          <textarea
            v-model="newCoreLine.description"
            placeholder="Descripción"
            class="border p-2 rounded col-span-2"
          ></textarea>

          <select
            v-model="newCoreLine.sector_id"
            class="border p-2 rounded col-span-2"
            required
          >
            <option value="">Selecciona un sector</option>
            <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
              {{ sector.name }}
            </option>
          </select>

          <button
            type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-2"
            :disabled="loading"
          >
            {{ loading ? "Creando..." : "Crear línea medular" }}
          </button>
        </form>
        <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
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

      <!-- 🔹 Loading -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span class="ml-2 text-gray-600">Cargando líneas medulares...</span>
      </div>

      <!-- 🔹 Visualización de líneas -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div
          v-for="linea in filteredLineas"
          :key="linea.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-t-4"
          :class="`border-${linea.categoria.color}-500`"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <div class="p-3 rounded-full mr-4" :class="`bg-${linea.categoria.color}-100`">
                  <SearchIcon class="h-6 w-6" :class="`text-${linea.categoria.color}-500`" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">{{ linea.nombre }}</h2>
                  <p class="text-sm text-gray-500">{{ linea.descripcion }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <!-- Botón editar -->
                <button
                  @click="editCoreLine(linea)"
                  class="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <!-- Botón eliminar -->
                <button
                  @click="deleteCoreLine(linea.id)"
                  class="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔹 Mensaje sin resultados -->
      <div v-if="filteredLineas.length === 0 && !isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <SearchIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">No se encontraron resultados</h3>
        <p class="text-gray-500">Intenta con otros términos de búsqueda o elimina los filtros aplicados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SearchIcon } from '@heroicons/vue/outline'

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)
const editingId = ref(null)

// Sectores
const sectors = ref([])

// Nueva/Editar línea
const newCoreLine = ref({
  name: '',
  description: '',
  sector_id: null
})

// Fetch sectores
const fetchSectors = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/catalogs/sectors/', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    if (response.ok) {
      sectors.value = await response.json()
    }
  } catch (err) {
    console.error('Error al cargar sectores:', err)
  }
}

// Crear línea
const createCoreLine = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const token = localStorage.getItem('access_token')
    const method = editingId.value ? 'PUT' : 'POST'
    const url = editingId.value
      ? `http://localhost:8000/catalogs/core-lines/${editingId.value}`
      : `http://localhost:8000/catalogs/core-lines/`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(newCoreLine.value)
    })

    if (!response.ok) throw new Error('Error al guardar línea medular')
    const data = await response.json()

    if (editingId.value) {
      const index = lineasMedulares.value.findIndex((l) => l.id === editingId.value)
      if (index !== -1) lineasMedulares.value[index].nombre = data.name
      successMessage.value = '✅ Línea actualizada con éxito'
    } else {
      lineasMedulares.value.push({
        id: data.id,
        nombre: data.name,
        descripcion: data.description,
        categoria: { id: 'general', nombre: 'General', color: 'gray' }
      })
      successMessage.value = '✅ Línea creada con éxito'
    }

    newCoreLine.value = { name: '', description: '', sector_id: null }
    editingId.value = null
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

// Editar línea
const editCoreLine = (linea) => {
  newCoreLine.value = {
    name: linea.nombre,
    description: linea.descripcion,
    sector_id: linea.sector_id || null
  }
  editingId.value = linea.id
}

// Eliminar línea
const deleteCoreLine = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar esta línea?')) return
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`http://localhost:8000/catalogs/core-lines/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    if (!response.ok) throw new Error('Error al eliminar línea')
    lineasMedulares.value = lineasMedulares.value.filter((l) => l.id !== id)
    successMessage.value = '✅ Línea eliminada con éxito'
  } catch (err) {
    errorMessage.value = err.message
  }
}

// Lista líneas
const lineasMedulares = ref([])
const fetchMedularLines = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/catalogs/core-lines/', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    if (response.ok) {
      const data = await response.json()
      lineasMedulares.value = data.map((line) => ({
        id: line.id,
        nombre: line.name,
        descripcion: line.description || '',
        categoria: { id: 'general', nombre: 'General', color: 'gray' }
      }))
    }
  } catch (error) {
    console.error('Error loading medular lines:', error)
  } finally {
    isLoading.value = false
  }
}

// Estadísticas
const stats = computed(() => ({
  totalLineas: lineasMedulares.value.length,
  totalProgramas: 0,
  aprendicesImpactados: 125840,
  sectoresVinculados: 0
}))

const formatNumber = (num) => new Intl.NumberFormat().format(num)

// Filtrados
const searchTerm = ref('')
const filteredLineas = computed(() => {
  return lineasMedulares.value.filter((linea) => {
    return (
      searchTerm.value === '' ||
      linea.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      linea.descripcion.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })
})

onMounted(() => {
  fetchMedularLines()
  fetchSectors()
})
</script>
