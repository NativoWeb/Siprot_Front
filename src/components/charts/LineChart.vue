<!-- LineChart.vue - Versión con leyenda separada -->
<template>
  <!-- Opción 1: Leyenda arriba del gráfico -->
  <div class="w-full h-full flex flex-col">
    <!-- Leyenda superior -->
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="text-sm font-medium text-gray-700 mr-2">
          Indicadores:
        </div>
        
        <!-- Series en línea horizontal -->
        <div class="flex flex-wrap items-center gap-3">
          <div
            v-for="(serie, index) in series"
            :key="serie.name"
            @click="toggleSerie(index)"
            class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
          >
            <!-- Checkbox visual -->
            <div class="relative">
              <div
                class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                :class="[
                  selectedSeries[index] 
                    ? 'border-transparent' 
                    : 'border-gray-300 bg-white'
                ]"
                :style="selectedSeries[index] ? { backgroundColor: getSerieColor(index) } : {}"
              >
                <svg 
                  v-if="selectedSeries[index]"
                  class="w-3 h-3 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <!-- Indicador de color -->
            <div
              class="w-3 h-3 rounded transition-opacity"
              :class="selectedSeries[index] ? 'opacity-100' : 'opacity-30'"
              :style="{ backgroundColor: getSerieColor(index) }"
            ></div>
            
            <!-- Nombre de la serie -->
            <span 
              class="text-gray-700 transition-opacity select-none"
              :class="selectedSeries[index] ? 'opacity-100 font-medium' : 'opacity-50'"
            >
              {{ serie.name }}
            </span>
            
            <!-- Valor actual si está disponible -->
            <span 
              v-if="getCurrentValue(serie, index)"
              class="text-xs text-gray-500"
              :class="selectedSeries[index] ? 'opacity-100' : 'opacity-30'"
            >
              ({{ formatNumber(getCurrentValue(serie, index)) }})
            </span>
          </div>
        </div>
        
        <!-- Controles de selección -->
        <div class="flex gap-1 ml-auto">
          <button
            @click="selectAllSeries"
            class="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            Todas
          </button>
          <button
            @click="deselectAllSeries"
            class="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
          >
            Ninguna
          </button>
          <button
            @click="resetSelection"
            class="text-xs px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <!-- Contador de series seleccionadas -->
        <div class="text-xs text-gray-400">
          {{ selectedSeriesCount }}/{{ series.length }}
        </div>
      </div>
    </div>

    <!-- Área del gráfico -->
    <div class="flex-1 relative bg-white rounded-lg shadow-sm border border-gray-200">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      
      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10 text-sm"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-semibold">Año {{ tooltip.year }}</div>
        <div 
          v-for="item in tooltip.data" 
          :key="item.name" 
          class="flex items-center gap-2"
          v-show="item.visible"
        >
          <div
            class="w-2 h-2 rounded"
            :style="{ backgroundColor: item.color }"
          ></div>
          <span>{{ item.name }}: {{ formatNumber(item.value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  series: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6']
  },
  defaultSelected: {
    type: Array,
    default: null
  },
  legendPosition: {
    type: String,
    default: 'top', // 'top', 'bottom', 'left', 'right'
    validator: value => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const emit = defineEmits(['selection-changed'])

const chartCanvas = ref(null)
const selectedSeries = ref([])
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  year: '',
  data: []
})

let chartDimensions = {
  padding: 60,
  chartWidth: 0,
  chartHeight: 0,
  minYear: 0,
  maxYear: 0,
  maxValue: 0
}

// Computed para asegurar que siempre tengamos colores válidos
const validColors = computed(() => {
  return props.colors && props.colors.length > 0 ? props.colors : ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6']
})

const selectedSeriesCount = computed(() => {
  return selectedSeries.value.filter(Boolean).length
})

const visibleSeries = computed(() => {
  return props.series.filter((_, index) => selectedSeries.value[index])
})

const getSerieColor = (index) => {
  return validColors.value[index % validColors.value.length]
}

const getCurrentValue = (serie, index) => {
  if (!props.data.length || !selectedSeries.value[index]) return null
  const lastDataPoint = props.data[props.data.length - 1]
  return getNestedValue(lastDataPoint, serie.key)
}

const initializeSelection = () => {
  if (props.defaultSelected && Array.isArray(props.defaultSelected)) {
    selectedSeries.value = props.series.map((_, index) => 
      props.defaultSelected.includes(index)
    )
  } else {
    selectedSeries.value = new Array(props.series.length).fill(true)
  }
}

const toggleSerie = (index) => {
  selectedSeries.value[index] = !selectedSeries.value[index]
  
  if (selectedSeriesCount.value === 0) {
    selectedSeries.value[index] = true
  }
  
  nextTick(() => {
    drawChart()
    emitSelectionChange()
  })
}

const selectAllSeries = () => {
  selectedSeries.value = new Array(props.series.length).fill(true)
  nextTick(() => {
    drawChart()
    emitSelectionChange()
  })
}

const deselectAllSeries = () => {
  selectedSeries.value = props.series.map((_, index) => index === 0)
  nextTick(() => {
    drawChart()
    emitSelectionChange()
  })
}

const resetSelection = () => {
  initializeSelection()
  nextTick(() => {
    drawChart()
    emitSelectionChange()
  })
}

const emitSelectionChange = () => {
  const selectedIndices = selectedSeries.value
    .map((selected, index) => selected ? index : -1)
    .filter(index => index !== -1)
  
  emit('selection-changed', {
    selectedIndices,
    selectedSeries: selectedIndices.map(index => props.series[index]),
    visibleSeriesCount: selectedSeriesCount.value
  })
}

const formatNumber = (value) => {
  if (!value || isNaN(value)) return '0'
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toLocaleString()
}

const getNestedValue = (obj, path) => {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return 0
    }
  }
  return typeof result === 'number' ? result : 0
}

const calculateChartBounds = () => {
  if (!props.data.length || !visibleSeries.value.length) return

  const years = props.data.map(d => d.year)
  chartDimensions.minYear = Math.min(...years)
  chartDimensions.maxYear = Math.max(...years)

  chartDimensions.maxValue = 0
  visibleSeries.value.forEach(serie => {
    props.data.forEach(d => {
      const value = getNestedValue(d, serie.key)
      if (value > chartDimensions.maxValue) {
        chartDimensions.maxValue = value
      }
    })
  })

  chartDimensions.maxValue = chartDimensions.maxValue * 1.1 || 100
}

const drawChart = () => {
  if (!chartCanvas.value || !props.data.length || !visibleSeries.value.length) {
    if (chartCanvas.value) {
      const ctx = chartCanvas.value.getContext('2d')
      const rect = chartCanvas.value.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Selecciona al menos un indicador para ver el gráfico', 
                   rect.width / 2, rect.height / 2)
    }
    return
  }

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  ctx.clearRect(0, 0, rect.width, rect.height)

  chartDimensions.chartWidth = rect.width - chartDimensions.padding * 2
  chartDimensions.chartHeight = rect.height - chartDimensions.padding * 2

  calculateChartBounds()

  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, rect.width, rect.height)

  drawGrid(ctx)
  drawAxes(ctx)
  drawDataLines(ctx)
  drawLabels(ctx)
}

const drawGrid = (ctx) => {
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 0.5

  const { padding, chartWidth, chartHeight } = chartDimensions

  const yearRange = chartDimensions.maxYear - chartDimensions.minYear
  const yearStep = Math.max(1, Math.floor(yearRange / 10))
  
  for (let year = chartDimensions.minYear; year <= chartDimensions.maxYear; year += yearStep) {
    const x = padding + ((year - chartDimensions.minYear) / yearRange) * chartWidth
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, padding + chartHeight)
    ctx.stroke()
  }

  if (chartDimensions.maxValue > 0) {
    const valueStep = chartDimensions.maxValue / 5
    for (let i = 0; i <= 5; i++) {
      const y = padding + chartHeight - (i * chartHeight / 5)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }
  }
}

const drawAxes = (ctx) => {
  const { padding, chartWidth, chartHeight } = chartDimensions

  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + chartHeight)
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()
}

const drawDataLines = (ctx) => {
  const { padding, chartWidth, chartHeight, minYear, maxYear, maxValue } = chartDimensions

  props.series.forEach((serie, index) => {
    if (!selectedSeries.value[index]) return
    
    const color = getSerieColor(index)
    
    const validData = props.data.filter(d => {
      const value = getNestedValue(d, serie.key)
      return value !== undefined && value !== null && !isNaN(value)
    })

    if (validData.length === 0) return

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()

    validData.forEach((d, pointIndex) => {
      const x = padding + ((d.year - minYear) / (maxYear - minYear)) * chartWidth
      const value = getNestedValue(d, serie.key)
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      if (pointIndex === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    ctx.fillStyle = color
    validData.forEach(d => {
      const x = padding + ((d.year - minYear) / (maxYear - minYear)) * chartWidth
      const value = getNestedValue(d, serie.key)
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  })
}

const drawLabels = (ctx) => {
  const { padding, chartWidth, chartHeight, minYear, maxYear, maxValue } = chartDimensions

  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'

  ctx.textAlign = 'center'
  const yearRange = maxYear - minYear
  const yearStep = Math.max(1, Math.floor(yearRange / 8))
  
  for (let year = minYear; year <= maxYear; year += yearStep) {
    const x = padding + ((year - minYear) / yearRange) * chartWidth
    ctx.fillText(year.toString(), x, padding + chartHeight + 20)
  }

  ctx.textAlign = 'right'
  if (maxValue > 0) {
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i + 5
      ctx.fillText(formatNumber(Math.round(value)), padding - 10, y)
    }
  }

  ctx.save()
  ctx.translate(20, padding + chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#6B7280'
  ctx.fillText('Valores', 0, 0)
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#6B7280'
  ctx.fillText('Años', padding + chartWidth / 2, padding + chartHeight + 50)
}

const handleMouseMove = (event) => {
  if (!chartCanvas.value || visibleSeries.value.length === 0) return

  const canvas = chartCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const { padding, chartWidth, minYear, maxYear } = chartDimensions

  if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartDimensions.chartHeight) {
    const relativeX = (x - padding) / chartWidth
    const year = Math.round(minYear + relativeX * (maxYear - minYear))

    const yearData = props.data.find(d => d.year === year)
    if (yearData) {
      const tooltipData = props.series.map((serie, index) => ({
        name: serie.name,
        value: getNestedValue(yearData, serie.key),
        color: getSerieColor(index),
        visible: selectedSeries.value[index]
      }))

      tooltip.value = {
        visible: true,
        x: Math.min(x, rect.width - 200),
        y: Math.max(y - 100, 10),
        year: year,
        data: tooltipData
      }
    } else {
      tooltip.value.visible = false
    }
  } else {
    tooltip.value.visible = false
  }
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

watch([() => props.data, () => props.series, () => props.colors], () => {
  initializeSelection()
  nextTick(() => {
    drawChart()
    emitSelectionChange()
  })
}, { deep: true })

watch(selectedSeries, () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })

onMounted(() => {
  initializeSelection()
  nextTick(() => {
    drawChart()
    emitSelectionChange()
    if (chartCanvas.value) {
      chartCanvas.value.addEventListener('mousemove', handleMouseMove)
      chartCanvas.value.addEventListener('mouseleave', handleMouseLeave)
    }
  })
})

onUnmounted(() => {
  if (chartCanvas.value) {
    chartCanvas.value.removeEventListener('mousemove', handleMouseMove)
    chartCanvas.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>