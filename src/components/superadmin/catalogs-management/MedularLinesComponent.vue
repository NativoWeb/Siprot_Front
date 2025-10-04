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

      <!-- Formulario para nueva línea medular -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Línea Medular</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Línea Medular *
              </label>
              <input
                id="nombre"
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Tecnologías de la Información"
              />
              <div v-if="duplicateError" class="mt-1 text-sm text-red-600">
                Ya existe una línea medular con este nombre
              </div>
            </div>
            
            <div>
              <label for="sector" class="block text-sm font-medium text-gray-700 mb-1">
                Sector Económico
              </label>
              <select
                id="sector"
                v-model="formData.sector_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar sector</option>
                <option v-for="sector in sectores" :key="sector.id" :value="sector.id">
                  {{ sector.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe los objetivos y alcance de esta línea medular..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="resetForm"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting">Guardando...</span>
              <span v-else>Crear Línea Medular</span>
            </button>
          </div>
        </form>
        
        <!-- Success message -->
        <div v-if="showSuccessMessage" class="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">Línea medular creada exitosamente</p>
            </div>
          </div>
        </div>
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
              v-for="sector in sectores"
              :key="sector.id"
              @click="toggleSectorFilter(sector.id)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                sectorFilters.includes(sector.id)
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              ]"
            >
              {{ sector.name }}
            </button>
            
            <button
              v-if="searchTerm || sectorFilters.length > 0"
              @click="clearFilters"
              class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Added loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span class="ml-2 text-gray-600">Cargando líneas medulares...</span>
      </div>

      <!-- Visualización de líneas medulares -->
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
        v-if="filteredLineas.length === 0 && !isLoading"
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
    
    <!-- Added error notification -->
    <div v-if="showErrorNotification" class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414l2 2a1 1 0 01-1.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414l2 2a1 1 0 01-1.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  SearchIcon
} from '@heroicons/vue/outline'

const isLoading = ref(false);
const showErrorNotification = ref(false);
const errorMessage = ref('');

const formData = ref({
  name: '',
  description: '',
  sector_id: ''
});
const isSubmitting = ref(false);
const showSuccessMessage = ref(false);
const duplicateError = ref(false);

const sectores = ref([]);
const lineasMedulares = ref([]);

const sectorFilters = ref([]);
const searchTerm = ref(''); // Declared searchTerm variable

const checkDuplicate = () => {
  if (!formData.value.name.trim()) {
    duplicateError.value = false;
    return false;
  }
  
  const exists = lineasMedulares.value.some(linea => 
    linea.nombre.toLowerCase() === formData.value.name.trim().toLowerCase()
  );
  duplicateError.value = exists;
  return exists;
};

const fetchSectors = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/catalogs/sectors/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      sectores.value = data;
    } else {
      throw new Error('Error al cargar sectores');
    }
  } catch (error) {
    console.error('Error loading sectors:', error);
    showError('Error al cargar los sectores desde el servidor');
  }
};

const submitForm = async () => {
  console.log('Form submission started');
  
  // Validate for duplicates
  if (checkDuplicate()) {
    console.log('Duplicate found, stopping submission');
    return;
  }
  
  if (!formData.value.name.trim()) {
    showError('El nombre de la línea medular es requerido');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    console.log('Calling createMedularLine with:', formData.value);
    const success = await createMedularLine(formData.value);
    
    if (success) {
      console.log('Medular line created successfully');
      resetForm();
      showSuccessMessage.value = true;
      setTimeout(() => {
        showSuccessMessage.value = false;
      }, 3000);
    }
  } catch (error) {
    console.log('Error creating medular line:', error);
    showError('Error al crear la línea medular');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    sector_id: ''
  };
  duplicateError.value = false;
  showSuccessMessage.value = false;
};

const createMedularLine = async (lineData) => {
  try {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;
    
    const requestData = {
      name: lineData.name,
      description: lineData.description,
      sector_id: lineData.sector_id || null,
      is_active: true
    };
    
    console.log('Sending request to create medular line:', requestData);
    
    const response = await fetch('http://localhost:8000/catalogs/core-lines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
      console.log('Medular line created successfully, refreshing list');
      await fetchMedularLines();
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear línea medular');
    }
  } catch (error) {
    console.error('Error creating medular line:', error);
    showError(error.message || 'Error al crear la línea medular');
    return false;
  }
};

const toggleSectorFilter = (sectorId) => {
  const index = sectorFilters.value.indexOf(sectorId);
  if (index === -1) {
    sectorFilters.value.push(sectorId);
  } else {
    sectorFilters.value.splice(index, 1);
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  sectorFilters.value = [];
};

const toggleExpanded = (lineaId) => {
  const index = expandedLineas.value.indexOf(lineaId);
  if (index === -1) {
    expandedLineas.value.push(lineaId);
  } else {
    expandedLineas.value.splice(index, 1);
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

const getIconComponent = (iconName) => {
  const icons = {
    SearchIcon,
    SearchIcon,
    SearchIcon,
    SearchIcon
  };
  return icons[iconName] || SearchIcon;
};

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Activo':
      return 'bg-green-100 text-green-800';
    case 'Nuevo':
      return 'bg-blue-100 text-blue-800';
    case 'En desarrollo':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const filteredLineas = computed(() => {
  return lineasMedulares.value.filter(linea => {
    const matchesSearch = searchTerm.value === '' || 
      linea.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      linea.descripcion.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    const matchesSector = sectorFilters.value.length === 0 || 
      sectorFilters.value.includes(linea.sector_id);
    
    return matchesSearch && matchesSector;
  });
});

const fetchMedularLines = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/catalogs/core-lines/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      lineasMedulares.value = data.map(line => ({
        id: line.id,
        nombre: line.name,
        descripcion: line.description || '',
        categoria: getCategoryInfo(line.category),
        icono: 'SearchIcon',
        cumplimiento: line.objective_compliance || 0,
        objetivos: line.strategic_objectives || [],
        programas: line.associated_programs || [],
        sectores: line.related_sectors || []
      }));
    } else {
      throw new Error('Error al cargar líneas medulares');
    }
  } catch (error) {
    console.error('Error loading medular lines:', error);
    showError('Error al cargar las líneas medulares desde el servidor');
    // Fallback to mock data
    loadMockData();
  } finally {
    isLoading.value = false;
  }
};

const getCategoryInfo = (categoryId) => {
  const category = categorias.find(cat => cat.id === categoryId);
  return category || { id: 'general', nombre: 'General', color: 'gray' };
};

const showError = (message) => {
  errorMessage.value = message;
  showErrorNotification.value = true;
  setTimeout(() => {
    showErrorNotification.value = false;
  }, 5000);
};

const loadMockData = () => {
  lineasMedulares.value = [];
};

const stats = computed(() => ({
  totalLineas: lineasMedulares.value.length,
  totalProgramas: lineasMedulares.value.reduce((total, linea) => total + linea.programas.length, 0),
  aprendicesImpactados: 125840,
  sectoresVinculados: [...new Set(lineasMedulares.value.flatMap(linea => linea.sectores.map(sector => sector.id)))].length
}));

const categorias = [
  { id: 'tecnologica', nombre: 'Tecnológica', color: 'blue' },
  { id: 'pedagogica', nombre: 'Pedagógica', color: 'green' },
  { id: 'investigacion', nombre: 'Investigación', color: 'purple' },
  { id: 'emprendimiento', nombre: 'Emprendimiento', color: 'amber' },
  { id: 'sostenibilidad', nombre: 'Sostenibilidad', color: 'emerald' }
];

const expandedLineas = ref([]);

onMounted(() => {
  fetchSectors();
  fetchMedularLines();
});

watch(() => formData.value.name, () => {
  if (formData.value.name.trim()) {
    checkDuplicate();
  } else {
    duplicateError.value = false;
  }
});
</script>
