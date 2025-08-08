<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              Escenarios Prospectivos - <span class="text-[#08ac04]">SIPROT-IA</span>
            </h1>
            <p class="text-gray-600">
              Herramientas para explorar posibles futuros a mediano y largo plazo del territorio y la formación
            </p>
          </div>
          <div class="flex gap-3">
            <button 
              v-if="canEdit"
              @click="showConfigDialog = true"
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Configurar Parámetros
            </button>
            <button 
              @click="exportScenario"
              class="flex items-center gap-2 px-4 py-2 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Exportar Escenario
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Scenario Selector -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            v-for="scenario in scenarios"
            :key="scenario.id"
            @click="selectedScenario = scenario.id"
            class="flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 min-w-[200px]"
            :class="selectedScenario === scenario.id 
              ? `${scenario.activeClass} shadow-lg transform scale-105` 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'"
          >
            <span class="text-2xl">{{ scenario.icon }}</span>
            <div class="text-left">
              <div class="font-semibold text-gray-800">{{ scenario.name }}</div>
              <div class="text-sm text-gray-600">{{ scenario.subtitle }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Current Scenario Content -->
      <div v-if="currentScenario" class="space-y-8">
        <!-- Scenario Description -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div class="flex items-start gap-4">
            <div class="text-4xl">{{ currentScenario.icon }}</div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-800 mb-3">
                {{ currentScenario.name }}
              </h2>
              <p class="text-gray-600 leading-relaxed text-lg">
                {{ currentScenario.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Key Indicators Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="indicator in currentScenario.indicators"
            :key="indicator.name"
            class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
          >
            <div class="text-3xl mb-3">{{ indicator.icon }}</div>
            <h3 class="font-semibold text-gray-800 mb-2">{{ indicator.name }}</h3>
            <div class="text-2xl font-bold mb-1" :class="indicator.color">
              {{ indicator.value }}
            </div>
            <div class="text-sm text-gray-500">{{ indicator.description }}</div>
            <div class="mt-3 flex items-center justify-center gap-1">
              <svg 
                v-if="indicator.trend === 'up'" 
                class="w-4 h-4 text-green-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <svg 
                v-else-if="indicator.trend === 'down'" 
                class="w-4 h-4 text-red-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <svg 
                v-else 
                class="w-4 h-4 text-yellow-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-xs text-gray-500">{{ indicator.trendText }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Population Growth Chart -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span>
              Proyección Población Objetivo (2024-2034)
            </h3>
            <div class="h-64 flex items-end justify-between gap-2 bg-gray-50 rounded-lg p-4">
              <div 
                v-for="(year, index) in populationData"
                :key="year.year"
                class="flex flex-col items-center flex-1"
              >
                <div 
                  class="w-full rounded-t-md transition-all duration-1000 ease-out"
                  :class="currentScenario.chartColor"
                  :style="{ height: `${(year.value / Math.max(...populationData.map(d => d.value))) * 200}px` }"
                ></div>
                <div class="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                  {{ year.year }}
                </div>
                <div class="text-xs font-medium text-gray-800">
                  {{ year.value.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sector Demand Chart -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏭</span>
              Demanda por Sectores (2034)
            </h3>
            <div class="space-y-4">
              <div 
                v-for="sector in sectorData"
                :key="sector.name"
                class="flex items-center gap-4"
              >
                <div class="w-24 text-sm font-medium text-gray-700">
                  {{ sector.name }}
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    :class="sector.color"
                    :style="{ width: `${sector.percentage}%` }"
                  >
                    <span class="text-xs font-medium text-white">
                      {{ sector.percentage }}%
                    </span>
                  </div>
                </div>
                <div class="w-16 text-sm text-gray-600 text-right">
                  {{ sector.value.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Section -->
        <div v-if="showComparison" class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span>⚖️</span>
            Comparación entre Escenarios
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-800">Indicador</th>
                  <th 
                    v-for="scenario in scenarios"
                    :key="scenario.id"
                    class="text-center py-3 px-4 font-semibold text-gray-800"
                  >
                    <div class="flex items-center justify-center gap-2">
                      <span>{{ scenario.icon }}</span>
                      {{ scenario.name }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="comparison in comparisonData"
                  :key="comparison.indicator"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-3 px-4 font-medium text-gray-700">
                    {{ comparison.indicator }}
                  </td>
                  <td 
                    v-for="value in comparison.values"
                    :key="value"
                    class="py-3 px-4 text-center font-semibold"
                    :class="getComparisonColor(value, comparison.values)"
                  >
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Toggle Comparison Button -->
        <div class="text-center">
          <button 
            @click="showComparison = !showComparison"
            class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ showComparison ? 'Ocultar' : 'Mostrar' }} Comparación entre Escenarios
          </button>
        </div>
      </div>

      <!-- Role Info -->
      <div class="mt-8 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          Rol actual: {{ userRole }} | {{ canEdit ? 'Permisos de configuración' : 'Solo visualización' }}
        </span>
      </div>
    </div>

    <!-- Configuration Modal -->
    <div v-if="showConfigDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Configurar Parámetros de Escenarios</h3>
        </div>
        <div class="p-6 space-y-6">
          <!-- Growth Rate -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Crecimiento Anual (%)
            </label>
            <div class="flex items-center gap-4">
              <input 
                v-model="configParams.growthRate" 
                type="range" 
                min="0" 
                max="10" 
                step="0.1"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="w-16 text-center font-medium text-gray-800">
                {{ configParams.growthRate }}%
              </span>
            </div>
          </div>

          <!-- Technology Adoption -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adopción Tecnológica
            </label>
            <select 
              v-model="configParams.techAdoption" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08ac04] focus:border-transparent"
            >
              <option value="low">Baja (20-40%)</option>
              <option value="medium">Media (40-70%)</option>
              <option value="high">Alta (70-90%)</option>
            </select>
          </div>

          <!-- Economic Scenario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contexto Económico
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="context in ['recession', 'stable', 'growth']"
                :key="context"
                @click="configParams.economicContext = context"
                class="p-3 border rounded-lg transition-colors"
                :class="configParams.economicContext === context 
                  ? 'border-[#08ac04] bg-green-50 text-[#08ac04]' 
                  : 'border-gray-300 hover:border-gray-400'"
              >
                {{ context === 'recession' ? '📉 Recesión' : context === 'stable' ? '📊 Estable' : '📈 Crecimiento' }}
              </button>
            </div>
          </div>

          <!-- Investment Level -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Inversión en Educación
            </label>
            <div class="flex items-center gap-4">
              <input 
                v-model="configParams.investmentLevel" 
                type="range" 
                min="50" 
                max="200" 
                step="10"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="w-20 text-center font-medium text-gray-800">
                {{ configParams.investmentLevel }}%
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Porcentaje respecto al nivel base actual
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-200 flex gap-3">
          <button 
            @click="applyConfiguration"
            class="flex-1 px-4 py-3 bg-[#08ac04] text-white rounded-lg hover:bg-[#07a003] transition-colors"
          >
            Aplicar Configuración
          </button>
          <button 
            @click="showConfigDialog = false"
            class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Scenario {
  id: string
  name: string
  subtitle: string
  icon: string
  description: string
  activeClass: string
  chartColor: string
  indicators: Array<{
    name: string
    icon: string
    value: string
    description: string
    color: string
    trend: 'up' | 'down' | 'stable'
    trendText: string
  }>
}

// Estado reactivo
const userRole = ref<'Planeacion' | 'Directivos' | 'Instructores'>('Directivos')
const selectedScenario = ref('tendencial')
const showComparison = ref(false)
const showConfigDialog = ref(false)

const configParams = ref({
  growthRate: 3.5,
  techAdoption: 'medium',
  economicContext: 'stable',
  investmentLevel: 100
})

// Escenarios predefinidos
const scenarios = ref<Scenario[]>([
  {
    id: 'tendencial',
    name: 'Tendencial',
    subtitle: 'Continuidad actual',
    icon: '📊',
    description: 'Este escenario proyecta la continuidad de las tendencias actuales sin cambios significativos en políticas o inversiones. La demanda formativa crecerá de manera moderada, manteniendo los sectores tradicionales como principales empleadores.',
    activeClass: 'border-blue-500 bg-blue-50',
    chartColor: 'bg-blue-500',
    indicators: [
      {
        name: 'Población Objetivo',
        icon: '👥',
        value: '125,000',
        description: 'Personas en edad formativa',
        color: 'text-blue-600',
        trend: 'up',
        trendText: '+2.5% anual'
      },
      {
        name: 'Demanda Laboral',
        icon: '💼',
        value: '85,000',
        description: 'Empleos proyectados',
        color: 'text-blue-600',
        trend: 'up',
        trendText: '+1.8% anual'
      },
      {
        name: 'Adopción Tech',
        icon: '💻',
        value: '45%',
        description: 'Penetración tecnológica',
        color: 'text-blue-600',
        trend: 'up',
        trendText: '+3% anual'
      },
      {
        name: 'Inversión Educativa',
        icon: '💰',
        value: '$2.5B',
        description: 'Presupuesto proyectado',
        color: 'text-blue-600',
        trend: 'stable',
        trendText: 'Estable'
      }
    ]
  },
  {
    id: 'optimista',
    name: 'Optimista',
    subtitle: 'Crecimiento acelerado',
    icon: '🚀',
    description: 'Escenario de crecimiento acelerado donde la región logra diversificar su economía exitosamente. Aumenta significativamente la inversión en educación y tecnología, generando alta demanda de técnicos especializados en sectores emergentes como energías renovables y tecnología.',
    activeClass: 'border-green-500 bg-green-50',
    chartColor: 'bg-green-500',
    indicators: [
      {
        name: 'Población Objetivo',
        icon: '👥',
        value: '165,000',
        description: 'Personas en edad formativa',
        color: 'text-green-600',
        trend: 'up',
        trendText: '+4.2% anual'
      },
      {
        name: 'Demanda Laboral',
        icon: '💼',
        value: '135,000',
        description: 'Empleos proyectados',
        color: 'text-green-600',
        trend: 'up',
        trendText: '+5.5% anual'
      },
      {
        name: 'Adopción Tech',
        icon: '💻',
        value: '75%',
        description: 'Penetración tecnológica',
        color: 'text-green-600',
        trend: 'up',
        trendText: '+8% anual'
      },
      {
        name: 'Inversión Educativa',
        icon: '💰',
        value: '$4.2B',
        description: 'Presupuesto proyectado',
        color: 'text-green-600',
        trend: 'up',
        trendText: '+6% anual'
      }
    ]
  },
  {
    id: 'pesimista',
    name: 'Pesimista',
    subtitle: 'Desafíos estructurales',
    icon: '⚠️',
    description: 'Escenario donde persisten los desafíos estructurales actuales. Limitaciones presupuestales, baja adopción tecnológica y competencia de plataformas privadas reducen la capacidad de respuesta del SENA. La demanda se concentra en sectores tradicionales con menor crecimiento.',
    activeClass: 'border-red-500 bg-red-50',
    chartColor: 'bg-red-500',
    indicators: [
      {
        name: 'Población Objetivo',
        icon: '👥',
        value: '95,000',
        description: 'Personas en edad formativa',
        color: 'text-red-600',
        trend: 'down',
        trendText: '-0.5% anual'
      },
      {
        name: 'Demanda Laboral',
        icon: '💼',
        value: '65,000',
        description: 'Empleos proyectados',
        color: 'text-red-600',
        trend: 'down',
        trendText: '-1.2% anual'
      },
      {
        name: 'Adopción Tech',
        icon: '💻',
        value: '25%',
        description: 'Penetración tecnológica',
        color: 'text-red-600',
        trend: 'up',
        trendText: '+1% anual'
      },
      {
        name: 'Inversión Educativa',
        icon: '💰',
        value: '$1.8B',
        description: 'Presupuesto proyectado',
        color: 'text-red-600',
        trend: 'down',
        trendText: '-2% anual'
      }
    ]
  }
])

// Computed properties
const canEdit = computed(() => userRole.value === 'Planeacion')

const currentScenario = computed(() => 
  scenarios.value.find(s => s.id === selectedScenario.value)
)

const populationData = computed(() => {
  const baseYear = 2024
  const basePopulation = selectedScenario.value === 'optimista' ? 100000 : 
                        selectedScenario.value === 'pesimista' ? 100000 : 100000
  const growthRate = selectedScenario.value === 'optimista' ? 0.042 : 
                    selectedScenario.value === 'pesimista' ? -0.005 : 0.025

  return Array.from({ length: 11 }, (_, i) => ({
    year: baseYear + i,
    value: Math.round(basePopulation * Math.pow(1 + growthRate, i))
  }))
})

const sectorData = computed(() => {
  const sectors = selectedScenario.value === 'optimista' ? [
    { name: 'Tecnología', percentage: 35, value: 47250, color: 'bg-blue-500' },
    { name: 'Energías Renovables', percentage: 25, value: 33750, color: 'bg-green-500' },
    { name: 'Manufactura', percentage: 20, value: 27000, color: 'bg-yellow-500' },
    { name: 'Servicios', percentage: 15, value: 20250, color: 'bg-purple-500' },
    { name: 'Agricultura', percentage: 5, value: 6750, color: 'bg-orange-500' }
  ] : selectedScenario.value === 'pesimista' ? [
    { name: 'Servicios', percentage: 40, value: 26000, color: 'bg-purple-500' },
    { name: 'Manufactura', percentage: 30, value: 19500, color: 'bg-yellow-500' },
    { name: 'Agricultura', percentage: 20, value: 13000, color: 'bg-orange-500' },
    { name: 'Tecnología', percentage: 8, value: 5200, color: 'bg-blue-500' },
    { name: 'Energías Renovables', percentage: 2, value: 1300, color: 'bg-green-500' }
  ] : [
    { name: 'Servicios', percentage: 30, value: 25500, color: 'bg-purple-500' },
    { name: 'Manufactura', percentage: 25, value: 21250, color: 'bg-yellow-500' },
    { name: 'Tecnología', percentage: 20, value: 17000, color: 'bg-blue-500' },
    { name: 'Agricultura', percentage: 15, value: 12750, color: 'bg-orange-500' },
    { name: 'Energías Renovables', percentage: 10, value: 8500, color: 'bg-green-500' }
  ]

  return sectors
})

const comparisonData = ref([
  {
    indicator: 'Población Objetivo 2034',
    values: ['95,000', '125,000', '165,000']
  },
  {
    indicator: 'Empleos Proyectados',
    values: ['65,000', '85,000', '135,000']
  },
  {
    indicator: 'Adopción Tecnológica',
    values: ['25%', '45%', '75%']
  },
  {
    indicator: 'Inversión Educativa',
    values: ['$1.8B', '$2.5B', '$4.2B']
  }
])

// Métodos
const getComparisonColor = (value: string, allValues: string[]) => {
  const numValue = parseFloat(value.replace(/[^0-9.]/g, ''))
  const allNumValues = allValues.map(v => parseFloat(v.replace(/[^0-9.]/g, '')))
  const maxValue = Math.max(...allNumValues)
  const minValue = Math.min(...allNumValues)
  
  if (numValue === maxValue) return 'text-green-600'
  if (numValue === minValue) return 'text-red-600'
  return 'text-yellow-600'
}

const applyConfiguration = () => {
  // Aquí se aplicarían los parámetros de configuración
  // Por ahora solo cerramos el modal
  showConfigDialog.value = false
  
  // Simular recálculo de datos
  console.log('Aplicando configuración:', configParams.value)
}

const exportScenario = () => {
  alert(`Exportando escenario: ${currentScenario.value?.name}`)
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Custom slider styles */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #08ac04;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #08ac04;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
