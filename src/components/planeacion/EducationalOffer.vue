<template>
  <div class="container mx-auto py-6 px-4">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Análisis de Oferta Educativa</h1>
      <p class="text-gray-600">Gestión y análisis estratégico de la oferta educativa del Centro SENA</p>
    </div>

    <!-- Tabs de navegación -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          :disabled="!tab.enabled"
        >
          {{ tab.name }}
          <span v-if="!tab.enabled" class="ml-1 text-xs text-gray-400">(Solo Planeación)</span>
        </button>
      </nav>
    </div>

    <!-- Contenido de las pestañas -->
    <div class="bg-white rounded-lg shadow">
      <!-- R3.1: Gestión de Programas Educativos -->
      <div v-if="activeTab === 'programs'" class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Gestión de Programas Educativos</h2>
          <button
            v-if="canManagePrograms"
            @click="showAddProgramModal = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <PlusIcon class="h-4 w-4" />
            Nuevo Programa
          </button>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select v-model="programFilters.level" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos los niveles</option>
              <option v-for="level in educationLevels" :key="level" :value="level">{{ level }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select v-model="programFilters.sector" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos los sectores</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Línea Medular</label>
            <select v-model="programFilters.coreLine" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todas las líneas</option>
              <option v-for="line in coreLines" :key="line" :value="line">{{ line }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="applyProgramFilters"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Filtrar
            </button>
          </div>
        </div>

        <!-- Tabla de programas -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Línea Medular
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cupos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aprendices
                </th>
                <th v-if="canManagePrograms" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="program in filteredPrograms" :key="program.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ program.name }}</div>
                  <div class="text-sm text-gray-500">{{ program.code }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ program.level }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ program.sector }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ program.core_line }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ program.capacity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ program.current_students }}
                </td>
                <td v-if="canManagePrograms" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editProgram(program)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <EditIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteProgram(program)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- R3.2: Análisis Matricial -->
      <div v-if="activeTab === 'analysis'" class="p-6">
        <h2 class="text-xl font-semibold mb-6">Análisis Matricial de Oferta Educativa</h2>
        
        <!-- Controles de visualización -->
        <div class="mb-6 flex gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Análisis</label>
            <select v-model="analysisType" class="px-3 py-2 border rounded-lg">
              <option value="programs">Número de Programas</option>
              <option value="students">Número de Aprendices</option>
              <option value="capacity">Capacidad Total</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nivel de Formación</label>
            <select v-model="analysisLevel" class="px-3 py-2 border rounded-lg">
              <option value="">Todos los niveles</option>
              <option v-for="level in educationLevels" :key="level" :value="level">{{ level }}</option>
            </select>
          </div>
        </div>

        <!-- Matriz de análisis -->
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-r">
                  Sector / Línea Medular
                </th>
                <th
                  v-for="line in coreLines"
                  :key="line"
                  class="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r"
                >
                  {{ line }}
                </th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b bg-blue-50">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sector in sectors" :key="sector" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900 border-b border-r bg-gray-50">
                  {{ sector }}
                </td>
                <td
                  v-for="line in coreLines"
                  :key="`${sector}-${line}`"
                  class="px-4 py-3 text-center text-sm border-b border-r"
                  :class="getMatrixCellClass(getMatrixValue(sector, line))"
                >
                  {{ getMatrixValue(sector, line) }}
                </td>
                <td class="px-4 py-3 text-center text-sm font-semibold border-b bg-blue-50">
                  {{ getSectorTotal(sector) }}
                </td>
              </tr>
              <tr class="bg-blue-50 font-semibold">
                <td class="px-4 py-3 text-sm text-gray-900 border-r">Total</td>
                <td
                  v-for="line in coreLines"
                  :key="`total-${line}`"
                  class="px-4 py-3 text-center text-sm border-r"
                >
                  {{ getCoreLineTotal(line) }}
                </td>
                <td class="px-4 py-3 text-center text-sm">
                  {{ getGrandTotal() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Gráfico de barras -->
        <div class="mt-8">
          <h3 class="text-lg font-medium mb-4">Distribución por Sector</h3>
          <div class="space-y-2">
            <div v-for="sector in sectors" :key="sector" class="flex items-center">
              <div class="w-32 text-sm text-gray-700">{{ sector }}</div>
              <div class="flex-1 bg-gray-200 rounded-full h-6 ml-4">
                <div
                  class="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  :style="{ width: `${(getSectorTotal(sector) / getGrandTotal()) * 100}%` }"
                >
                  <span class="text-white text-xs font-medium">{{ getSectorTotal(sector) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- R3.3: Análisis de Demanda -->
      <div v-if="activeTab === 'demand'" class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Análisis de Oferta vs Demanda</h2>
          <button
            v-if="canManagePrograms"
            @click="showDemandModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon class="h-4 w-4" />
            Actualizar Demanda
          </button>
        </div>

        <!-- Indicadores de demanda -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="text-lg font-semibold text-green-800 mb-2">Sectores Subatendidos</h3>
            <div class="text-3xl font-bold text-green-600">{{ underservedSectors.length }}</div>
            <p class="text-sm text-green-700">Requieren más programas</p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">Sectores Equilibrados</h3>
            <div class="text-3xl font-bold text-yellow-600">{{ balancedSectors.length }}</div>
            <p class="text-sm text-yellow-700">Oferta adecuada</p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 class="text-lg font-semibold text-red-800 mb-2">Sectores Sobreofertados</h3>
            <div class="text-3xl font-bold text-red-600">{{ oversuppliedSectors.length }}</div>
            <p class="text-sm text-red-700">Exceso de oferta</p>
          </div>
        </div>

        <!-- Tabla de análisis de demanda -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demanda Laboral
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programas Actuales
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Egresados/Año
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brecha
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="analysis in demandAnalysis" :key="analysis.sector">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ analysis.sector }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ analysis.demand }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ analysis.programs }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ analysis.graduates }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getDemandStatusClass(analysis.status)"
                  >
                    {{ analysis.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ analysis.gap > 0 ? '+' : '' }}{{ analysis.gap }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- R3.4: Filtros Avanzados -->
      <div v-if="activeTab === 'filters'" class="p-6">
        <h2 class="text-xl font-semibold mb-6">Análisis Filtrado</h2>
        
        <!-- Controles de filtro -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Regional/Territorio</label>
            <select v-model="advancedFilters.region" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todas las regionales</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nivel de Formación</label>
            <select v-model="advancedFilters.level" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos los niveles</option>
              <option v-for="level in educationLevels" :key="level" :value="level">{{ level }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sector Específico</label>
            <select v-model="advancedFilters.sector" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos los sectores</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
        </div>

        <!-- Resultados filtrados -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Gráfico de programas por nivel -->
          <div class="bg-white p-6 border rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Programas por Nivel</h3>
            <div class="space-y-3">
              <div v-for="level in educationLevels" :key="level" class="flex items-center justify-between">
                <span class="text-sm text-gray-700">{{ level }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 bg-gray-200 rounded-full h-4">
                    <div
                      class="bg-blue-600 h-4 rounded-full"
                      :style="{ width: `${(getProgramsByLevel(level) / getTotalPrograms()) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ getProgramsByLevel(level) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Detalles del sector seleccionado -->
          <div v-if="advancedFilters.sector" class="bg-white p-6 border rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Detalles: {{ advancedFilters.sector }}</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Total de Programas:</span>
                <span class="font-semibold">{{ getSectorPrograms(advancedFilters.sector).length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total de Aprendices:</span>
                <span class="font-semibold">{{ getSectorStudents(advancedFilters.sector) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Capacidad Total:</span>
                <span class="font-semibold">{{ getSectorCapacity(advancedFilters.sector) }}</span>
              </div>
              <div class="mt-4">
                <h4 class="font-medium mb-2">Programas en este sector:</h4>
                <ul class="space-y-1">
                  <li
                    v-for="program in getSectorPrograms(advancedFilters.sector)"
                    :key="program.id"
                    class="text-sm text-gray-600"
                  >
                    • {{ program.name }} ({{ program.level }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- R3.5: Proyección a 10 años -->
      <div v-if="activeTab === 'projection'" class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Proyección a 10 Años</h2>
          <button
            v-if="canManagePrograms"
            @click="showProjectionModal = true"
            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <TrendingUpIcon class="h-4 w-4" />
            Configurar Proyección
          </button>
        </div>

        <!-- Parámetros de proyección -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tasa de Crecimiento Base</label>
            <input
              v-model.number="projectionParams.baseGrowthRate"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border rounded-lg"
              :disabled="!canManagePrograms"
            />
            <p class="text-xs text-gray-500 mt-1">% anual</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sector Prioritario</label>
            <select v-model="projectionParams.prioritySector" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Seleccionar sector</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tasa Sector Prioritario</label>
            <input
              v-model.number="projectionParams.priorityGrowthRate"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border rounded-lg"
              :disabled="!canManagePrograms"
            />
            <p class="text-xs text-gray-500 mt-1">% anual</p>
          </div>
        </div>

        <!-- Gráfico de proyección -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold mb-4">Proyección de Programas por Sector</h3>
          <div class="bg-white border rounded-lg p-6">
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2">Sector</th>
                    <th class="text-center py-2">Actual</th>
                    <th class="text-center py-2">2027</th>
                    <th class="text-center py-2">2030</th>
                    <th class="text-center py-2">2035</th>
                    <th class="text-center py-2">Crecimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="projection in sectorProjections" :key="projection.sector" class="border-b">
                    <td class="py-2 font-medium">{{ projection.sector }}</td>
                    <td class="text-center py-2">{{ projection.current }}</td>
                    <td class="text-center py-2">{{ projection.year2027 }}</td>
                    <td class="text-center py-2">{{ projection.year2030 }}</td>
                    <td class="text-center py-2">{{ projection.year2035 }}</td>
                    <td class="text-center py-2">
                      <span class="text-green-600 font-semibold">+{{ projection.growth }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recomendaciones -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-4">Recomendaciones Estratégicas</h3>
          <ul class="space-y-2 text-blue-700">
            <li v-for="recommendation in projectionRecommendations" :key="recommendation" class="flex items-start gap-2">
              <CheckCircleIcon class="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{{ recommendation }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- R3.6: Reportes -->
      <div v-if="activeTab === 'reports'" class="p-6">
        <h2 class="text-xl font-semibold mb-6">Reportes de Alineación Estratégica</h2>
        
        <!-- Métricas de alineación -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 class="text-lg font-semibold text-green-800 mb-2">Programas Alineados</h3>
            <div class="text-3xl font-bold text-green-600">{{ alignmentMetrics.aligned }}%</div>
            <p class="text-sm text-green-700">Con sectores prioritarios</p>
          </div>
          <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">Cobertura Sectorial</h3>
            <div class="text-3xl font-bold text-yellow-600">{{ alignmentMetrics.coverage }}%</div>
            <p class="text-sm text-yellow-700">Sectores cubiertos</p>
          </div>
          <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 class="text-lg font-semibold text-blue-800 mb-2">Eficiencia</h3>
            <div class="text-3xl font-bold text-blue-600">{{ alignmentMetrics.efficiency }}%</div>
            <p class="text-sm text-blue-700">Ocupación promedio</p>
          </div>
        </div>

        <!-- Generador de reportes -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Generar Reporte</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
              <select v-model="reportConfig.type" class="w-full px-3 py-2 border rounded-lg">
                <option value="alignment">Alineación Estratégica</option>
                <option value="demand">Análisis de Demanda</option>
                <option value="projection">Proyección 10 años</option>
                <option value="complete">Reporte Completo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Formato</label>
              <select v-model="reportConfig.format" class="w-full px-3 py-2 border rounded-lg">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="word">Word</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <button
              @click="generateReport"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileTextIcon class="h-4 w-4" />
              Generar Reporte
            </button>
          </div>
        </div>

        <!-- Resumen ejecutivo -->
        <div class="mt-8 bg-gray-50 border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Resumen Ejecutivo</h3>
          <div class="prose max-w-none text-gray-700">
            <p class="mb-4">
              <strong>Estado Actual de la Oferta Educativa:</strong>
              El {{ alignmentMetrics.aligned }}% de los programas actuales están alineados con sectores prioritarios,
              mientras que el {{ 100 - alignmentMetrics.aligned }}% requiere revisión estratégica.
            </p>
            <p class="mb-4">
              <strong>Cobertura Sectorial:</strong>
              Se tiene cobertura en {{ alignmentMetrics.coverage }}% de los sectores identificados como prioritarios.
              Los sectores con mayor demanda son: {{ topDemandSectors.join(', ') }}.
            </p>
            <p class="mb-4">
              <strong>Proyección 2035:</strong>
              Para el año 2035 se proyecta requerir {{ projectedNewPrograms }} nuevos programas,
              principalmente en los sectores de {{ projectionParams.prioritySector || 'tecnología y sostenibilidad' }}.
            </p>
            <p>
              <strong>Recomendaciones:</strong>
              Se sugiere fortalecer la oferta en sectores subatendidos y evaluar la pertinencia
              de programas en sectores sobreofertados.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar programa -->
    <div v-if="showAddProgramModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">{{ editingProgram ? 'Editar' : 'Nuevo' }} Programa</h3>
            <button @click="closeAddProgramModal" class="text-gray-400 hover:text-gray-600">
              <XIcon class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveProgram" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Programa *</label>
                <input
                  v-model="programForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  v-model="programForm.code"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                <select
                  v-model="programForm.level"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar nivel</option>
                  <option v-for="level in educationLevels" :key="level" :value="level">{{ level }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                <select
                  v-model="programForm.sector"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar sector</option>
                  <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Línea Medular *</label>
                <select
                  v-model="programForm.core_line"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar línea</option>
                  <option v-for="line in coreLines" :key="line" :value="line">{{ line }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
                <input
                  v-model.number="programForm.capacity"
                  type="number"
                  required
                  min="1"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Aprendices Actuales</label>
                <input
                  v-model.number="programForm.current_students"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Regional</label>
                <select
                  v-model="programForm.region"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar regional</option>
                  <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                v-model="programForm.description"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeAddProgramModal"
                class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ editingProgram ? 'Actualizar' : 'Crear' }} Programa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="showNotification" class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <CheckCircleIcon class="h-5 w-5 text-green-400" />
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ notificationMessage }}</p>
        </div>
        <button @click="showNotification = false" class="ml-auto pl-3">
          <XIcon class="h-5 w-5 text-green-500" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  FileTextIcon
} from 'lucide-vue-next'

// Interfaces
interface EducationProgram {
  id: number
  name: string
  code: string
  level: string
  sector: string
  core_line: string
  capacity: number
  current_students: number
  region?: string
  description?: string
  created_at?: string
}

interface DemandAnalysis {
  sector: string
  demand: number
  programs: number
  graduates: number
  status: 'Subatendido' | 'Equilibrado' | 'Sobreofertado'
  gap: number
}

// Estado principal
const activeTab = ref('programs')
const userRole = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')

// Datos base
const educationLevels = ref([
  'Técnico',
  'Tecnólogo',
  'Especialización Técnica',
  'Especialización Tecnológica',
  'Curso Complementario',
  'Curso Especial'
])

const sectors = ref([
  'Tecnología e Informática',
  'Salud y Bienestar',
  'Agroindustria',
  'Turismo y Hotelería',
  'Construcción',
  'Manufactura',
  'Servicios Financieros',
  'Energías Renovables',
  'Logística y Transporte',
  'Comercio y Ventas'
])

const coreLines = ref([
  'Innovación y Desarrollo Tecnológico',
  'Formación para el Trabajo',
  'Emprendimiento y Empresarismo',
  'Investigación Aplicada',
  'Desarrollo Sostenible',
  'Competitividad Sectorial',
  'Internacionalización'
])

const regions = ref([
  'Antioquia',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Cundinamarca',
  'Valle del Cauca',
  'Santander',
  'Norte de Santander'
])

// Estado de programas
const programs = ref<EducationProgram[]>([])
const showAddProgramModal = ref(false)
const editingProgram = ref<EducationProgram | null>(null)

// Formulario de programa
const programForm = reactive({
  name: '',
  code: '',
  level: '',
  sector: '',
  core_line: '',
  capacity: 0,
  current_students: 0,
  region: '',
  description: ''
})

// Filtros
const programFilters = reactive({
  level: '',
  sector: '',
  coreLine: ''
})

const advancedFilters = reactive({
  region: '',
  level: '',
  sector: ''
})

// Análisis
const analysisType = ref('programs')
const analysisLevel = ref('')

// Proyección
const projectionParams = reactive({
  baseGrowthRate: 3.5,
  prioritySector: '',
  priorityGrowthRate: 8.0
})

const showProjectionModal = ref(false)
const showDemandModal = ref(false)

// Reportes
const reportConfig = reactive({
  type: 'alignment',
  format: 'pdf'
})

// Configuración de tabs
const tabs = computed(() => [
  { id: 'programs', name: 'Gestión de Programas', enabled: true },
  { id: 'analysis', name: 'Análisis Matricial', enabled: true },
  { id: 'demand', name: 'Oferta vs Demanda', enabled: true },
  { id: 'filters', name: 'Análisis Filtrado', enabled: true },
  { id: 'projection', name: 'Proyección 10 años', enabled: true },
  { id: 'reports', name: 'Reportes', enabled: true }
])

// Permisos
const canManagePrograms = computed(() => {
  return ['planeacion', 'superadmin'].includes(userRole.value)
})

// Programas filtrados
const filteredPrograms = computed(() => {
  let filtered = programs.value

  if (programFilters.level) {
    filtered = filtered.filter(p => p.level === programFilters.level)
  }
  if (programFilters.sector) {
    filtered = filtered.filter(p => p.sector === programFilters.sector)
  }
  if (programFilters.coreLine) {
    filtered = filtered.filter(p => p.core_line === programFilters.coreLine)
  }

  return filtered
})

// Análisis de demanda
const demandAnalysis = computed((): DemandAnalysis[] => {
  return sectors.value.map(sector => {
    const sectorPrograms = programs.value.filter(p => p.sector === sector)
    const programCount = sectorPrograms.length
    const graduates = sectorPrograms.reduce((sum, p) => sum + (p.current_students * 0.8), 0) // Estimación
    
    // Simulación de demanda (en producción vendría de datos reales)
    const demand = Math.floor(Math.random() * 100) + 20
    
    let status: 'Subatendido' | 'Equilibrado' | 'Sobreofertado'
    let gap = 0
    
    if (graduates < demand * 0.7) {
      status = 'Subatendido'
      gap = Math.floor(demand * 0.8 - graduates)
    } else if (graduates > demand * 1.3) {
      status = 'Sobreofertado'
      gap = Math.floor(graduates - demand)
    } else {
      status = 'Equilibrado'
      gap = 0
    }

    return {
      sector,
      demand,
      programs: programCount,
      graduates: Math.floor(graduates),
      status,
      gap
    }
  })
})

// Sectores por estado
const underservedSectors = computed(() => 
  demandAnalysis.value.filter(d => d.status === 'Subatendido')
)

const balancedSectors = computed(() => 
  demandAnalysis.value.filter(d => d.status === 'Equilibrado')
)

const oversuppliedSectors = computed(() => 
  demandAnalysis.value.filter(d => d.status === 'Sobreofertado')
)

// Métricas de alineación
const alignmentMetrics = computed(() => {
  const totalPrograms = programs.value.length
  const prioritySectors = ['Tecnología e Informática', 'Energías Renovables', 'Salud y Bienestar']
  const alignedPrograms = programs.value.filter(p => prioritySectors.includes(p.sector)).length
  
  return {
    aligned: totalPrograms > 0 ? Math.round((alignedPrograms / totalPrograms) * 100) : 0,
    coverage: Math.round((sectors.value.length / 10) * 100), // Simulación
    efficiency: Math.round(programs.value.reduce((sum, p) => sum + (p.current_students / p.capacity), 0) / totalPrograms * 100) || 0
  }
})

// Proyecciones por sector
const sectorProjections = computed(() => {
  return sectors.value.map(sector => {
    const current = programs.value.filter(p => p.sector === sector).length
    const growthRate = sector === projectionParams.prioritySector 
      ? projectionParams.priorityGrowthRate 
      : projectionParams.baseGrowthRate
    
    const year2027 = Math.round(current * Math.pow(1 + growthRate/100, 3))
    const year2030 = Math.round(current * Math.pow(1 + growthRate/100, 6))
    const year2035 = Math.round(current * Math.pow(1 + growthRate/100, 11))
    
    return {
      sector,
      current,
      year2027,
      year2030,
      year2035,
      growth: Math.round(((year2035 - current) / current) * 100) || 0
    }
  })
})

// Recomendaciones de proyección
const projectionRecommendations = computed(() => {
  const recommendations = []
  
  if (projectionParams.prioritySector) {
    recommendations.push(`Fortalecer significativamente el sector ${projectionParams.prioritySector} con una tasa de crecimiento del ${projectionParams.priorityGrowthRate}%`)
  }
  
  underservedSectors.value.forEach(sector => {
    recommendations.push(`Incrementar la oferta en ${sector.sector} para cubrir la brecha de ${sector.gap} egresados`)
  })
  
  if (recommendations.length === 0) {
    recommendations.push('Mantener el crecimiento equilibrado en todos los sectores')
    recommendations.push('Evaluar periódicamente la demanda del mercado laboral')
  }
  
  return recommendations
})

// Sectores con mayor demanda
const topDemandSectors = computed(() => {
  return demandAnalysis.value
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 3)
    .map(d => d.sector)
})

// Programas proyectados nuevos
const projectedNewPrograms = computed(() => {
  return sectorProjections.value.reduce((sum, p) => sum + (p.year2035 - p.current), 0)
})

// Funciones de análisis matricial
const getMatrixValue = (sector: string, coreLine: string) => {
  const filtered = programs.value.filter(p => 
    p.sector === sector && 
    p.core_line === coreLine &&
    (!analysisLevel.value || p.level === analysisLevel.value)
  )
  
  switch (analysisType.value) {
    case 'programs':
      return filtered.length
    case 'students':
      return filtered.reduce((sum, p) => sum + p.current_students, 0)
    case 'capacity':
      return filtered.reduce((sum, p) => sum + p.capacity, 0)
    default:
      return 0
  }
}

const getMatrixCellClass = (value: number) => {
  if (value === 0) return 'bg-gray-100 text-gray-400'
  if (value <= 2) return 'bg-yellow-100 text-yellow-800'
  if (value <= 5) return 'bg-blue-100 text-blue-800'
  return 'bg-green-100 text-green-800'
}

const getSectorTotal = (sector: string) => {
  return coreLines.value.reduce((sum, line) => sum + getMatrixValue(sector, line), 0)
}

const getCoreLineTotal = (coreLine: string) => {
  return sectors.value.reduce((sum, sector) => sum + getMatrixValue(sector, coreLine), 0)
}

const getGrandTotal = () => {
  return sectors.value.reduce((sum, sector) => sum + getSectorTotal(sector), 0)
}

// Funciones de filtros avanzados
const getProgramsByLevel = (level: string) => {
  let filtered = programs.value.filter(p => p.level === level)
  
  if (advancedFilters.region) {
    filtered = filtered.filter(p => p.region === advancedFilters.region)
  }
  if (advancedFilters.sector) {
    filtered = filtered.filter(p => p.sector === advancedFilters.sector)
  }
  
  return filtered.length
}

const getTotalPrograms = () => {
  let filtered = programs.value
  
  if (advancedFilters.region) {
    filtered = filtered.filter(p => p.region === advancedFilters.region)
  }
  if (advancedFilters.level) {
    filtered = filtered.filter(p => p.level === advancedFilters.level)
  }
  if (advancedFilters.sector) {
    filtered = filtered.filter(p => p.sector === advancedFilters.sector)
  }
  
  return filtered.length
}

const getSectorPrograms = (sector: string) => {
  return programs.value.filter(p => p.sector === sector)
}

const getSectorStudents = (sector: string) => {
  return programs.value
    .filter(p => p.sector === sector)
    .reduce((sum, p) => sum + p.current_students, 0)
}

const getSectorCapacity = (sector: string) => {
  return programs.value
    .filter(p => p.sector === sector)
    .reduce((sum, p) => sum + p.capacity, 0)
}

// Funciones de gestión de programas
const applyProgramFilters = () => {
  // Los filtros se aplican automáticamente a través del computed
}

const editProgram = (program: EducationProgram) => {
  editingProgram.value = program
  Object.assign(programForm, program)
  showAddProgramModal.value = true
}

const deleteProgram = async (program: EducationProgram) => {
  if (confirm(`¿Está seguro de eliminar el programa "${program.name}"?`)) {
    try {
      // Aquí iría la llamada al backend
      programs.value = programs.value.filter(p => p.id !== program.id)
      showSuccess('Programa eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar programa:', error)
    }
  }
}

const saveProgram = async () => {
  try {
    if (editingProgram.value) {
      // Actualizar programa existente
      const index = programs.value.findIndex(p => p.id === editingProgram.value!.id)
      if (index !== -1) {
        programs.value[index] = { ...editingProgram.value, ...programForm }
      }
      showSuccess('Programa actualizado exitosamente')
    } else {
      // Crear nuevo programa
      const newProgram: EducationProgram = {
        id: Date.now(),
        ...programForm
      }
      programs.value.push(newProgram)
      showSuccess('Programa creado exitosamente')
    }
    
    closeAddProgramModal()
  } catch (error) {
    console.error('Error al guardar programa:', error)
  }
}

const closeAddProgramModal = () => {
  showAddProgramModal.value = false
  editingProgram.value = null
  Object.assign(programForm, {
    name: '',
    code: '',
    level: '',
    sector: '',
    core_line: '',
    capacity: 0,
    current_students: 0,
    region: '',
    description: ''
  })
}

// Funciones de utilidad
const getDemandStatusClass = (status: string) => {
  switch (status) {
    case 'Subatendido':
      return 'bg-red-100 text-red-800'
    case 'Equilibrado':
      return 'bg-green-100 text-green-800'
    case 'Sobreofertado':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const generateReport = () => {
  // Aquí iría la lógica para generar el reporte
  showSuccess(`Generando reporte de ${reportConfig.type} en formato ${reportConfig.format}`)
}

const showSuccess = (message: string) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Funciones de inicialización
const getUserInfo = async () => {
  try {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      userRole.value = user.role || ''
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error)
  }
}

const loadSampleData = () => {
  // Datos de ejemplo para demostración
  programs.value = [
    {
      id: 1,
      name: 'Tecnología en Desarrollo de Software',
      code: 'TDS-001',
      level: 'Tecnólogo',
      sector: 'Tecnología e Informática',
      core_line: 'Innovación y Desarrollo Tecnológico',
      capacity: 30,
      current_students: 28,
      region: 'Bogotá D.C.',
      description: 'Programa enfocado en el desarrollo de aplicaciones web y móviles'
    },
    {
      id: 2,
      name: 'Técnico en Enfermería',
      code: 'ENF-002',
      level: 'Técnico',
      sector: 'Salud y Bienestar',
      core_line: 'Formación para el Trabajo',
      capacity: 25,
      current_students: 23,
      region: 'Antioquia',
      description: 'Formación integral en cuidados de enfermería'
    },
    {
      id: 3,
      name: 'Tecnología en Gestión Hotelera',
      code: 'GHT-003',
      level: 'Tecnólogo',
      sector: 'Turismo y Hotelería',
      core_line: 'Competitividad Sectorial',
      capacity: 20,
      current_students: 18,
      region: 'Valle del Cauca',
      description: 'Gestión integral de servicios hoteleros y turísticos'
    },
    {
      id: 4,
      name: 'Especialización en Energías Renovables',
      code: 'ENR-004',
      level: 'Especialización Tecnológica',
      sector: 'Energías Renovables',
      core_line: 'Desarrollo Sostenible',
      capacity: 15,
      current_students: 12,
      region: 'Santander',
      description: 'Especialización en sistemas de energía solar y eólica'
    },
    {
      id: 5,
      name: 'Técnico en Construcción',
      code: 'CON-005',
      level: 'Técnico',
      sector: 'Construcción',
      core_line: 'Formación para el Trabajo',
      capacity: 35,
      current_students: 32,
      region: 'Cundinamarca',
      description: 'Técnicas de construcción y supervisión de obras'
    }
  ]
}

// Lifecycle
onMounted(async () => {
  await getUserInfo()
  loadSampleData()
})
</script>

<style scoped>
.prose {
  line-height: 1.6;
}

.prose p {
  margin-bottom: 1rem;
}

.prose strong {
  font-weight: 600;
  color: #374151;
}
</style>
