<template>
  <div class="w-full h-full relative">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    
    <!-- Leyenda -->
    <div class="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
      <div class="space-y-2">
        <div
          v-for="(serie, index) in series"
          :key="serie.name"
          class="flex items-center gap-2 text-sm"
        >
          <div
            class="w-3 h-3 rounded"
            :style="{ backgroundColor: colors[index] || '#3B82F6' }"
          ></div>
          <span class="text-gray-700">{{ serie.name }}</span>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10 text-sm"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="font-semibold">Año {{ tooltip.year }}</div>
      <div v-for="item in tooltip.data" :key="item.name" class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded"
          :style="{ backgroundColor: item.color }"
        ></div>
        <span>{{ item.name }}: {{ formatNumber(item.value) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

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
  }
})

const chartCanvas = ref(null)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  year: '',
  data: []
})

let chartDimensions = {
  padding: 80,
  chartWidth: 0,
  chartHeight: 0,
  minYear: 0,
  maxYear: 0,
  maxValue: 0
}

const formatNumber = (value) => {
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
  if (!props.data.length || !props.series.length) return

  const years = props.data.map(d => d.year)
  chartDimensions.minYear = Math.min(...years)
  chartDimensions.maxYear = Math.max(...years)

  // Encontrar el valor máximo considerando todas las series
  chartDimensions.maxValue = 0
  props.series.forEach(serie => {
    props.data.forEach(d => {
      const value = getNestedValue(d, serie.key)
      if (value > chartDimensions.maxValue) {
        chartDimensions.maxValue = value
      }
    })
  })

  // Agregar un poco de espacio arriba del valor máximo
  chartDimensions.maxValue = chartDimensions.maxValue * 1.1
}

const drawChart = () => {
  if (!chartCanvas.value || !props.data.length || !props.series.length) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  
  // Set canvas size
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height)

  // Chart dimensions
  chartDimensions.chartWidth = rect.width - chartDimensions.padding * 2
  chartDimensions.chartHeight = rect.height - chartDimensions.padding * 2

  calculateChartBounds()

  // Draw background
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, rect.width, rect.height)

  // Draw grid
  drawGrid(ctx)

  // Draw axes
  drawAxes(ctx)

  // Draw data lines
  drawDataLines(ctx)

  // Draw axis labels
  drawLabels(ctx)
}

const drawGrid = (ctx) => {
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 0.5

  const { padding, chartWidth, chartHeight } = chartDimensions

  // Vertical grid lines (años)
  const yearRange = chartDimensions.maxYear - chartDimensions.minYear
  const yearStep = Math.max(1, Math.floor(yearRange / 10))
  
  for (let year = chartDimensions.minYear; year <= chartDimensions.maxYear; year += yearStep) {
    const x = padding + ((year - chartDimensions.minYear) / yearRange) * chartWidth
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, padding + chartHeight)
    ctx.stroke()
  }

  // Horizontal grid lines (valores)
  const valueStep = chartDimensions.maxValue / 5
  for (let i = 0; i <= 5; i++) {
    const y = padding + chartHeight - (i * chartHeight / 5)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + chartWidth, y)
    ctx.stroke()
  }
}

const drawAxes = (ctx) => {
  const { padding, chartWidth, chartHeight } = chartDimensions

  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 2
  ctx.beginPath()
  // Eje Y
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + chartHeight)
  // Eje X
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()
}

const drawDataLines = (ctx) => {
  const { padding, chartWidth, chartHeight, minYear, maxYear, maxValue } = chartDimensions

  props.series.forEach((serie, index) => {
    const color = props.colors[index] || '#3B82F6'
    
    // Filtrar datos válidos para esta serie
    const validData = props.data.filter(d => {
      const value = getNestedValue(d, serie.key)
      return value !== undefined && value !== null && !isNaN(value)
    })

    if (validData.length === 0) return

    // Dibujar línea
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

    // Dibujar puntos
    ctx.fillStyle = color
    validData.forEach(d => {
      const x = padding + ((d.year - minYear) / (maxYear - minYear)) * chartWidth
      const value = getNestedValue(d, serie.key)
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Borde blanco en los puntos
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

  // Etiquetas del eje X (años)
  ctx.textAlign = 'center'
  const yearRange = maxYear - minYear
  const yearStep = Math.max(1, Math.floor(yearRange / 8))
  
  for (let year = minYear; year <= maxYear; year += yearStep) {
    const x = padding + ((year - minYear) / yearRange) * chartWidth
    ctx.fillText(year.toString(), x, padding + chartHeight + 20)
  }

  // Etiquetas del eje Y (valores)
  ctx.textAlign = 'right'
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue / 5) * (5 - i)
    const y = padding + (chartHeight / 5) * i + 5
    ctx.fillText(formatNumber(Math.round(value)), padding - 10, y)
  }

  // Título del eje Y
  ctx.save()
  ctx.translate(20, padding + chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#6B7280'
  ctx.fillText('Valores', 0, 0)
  ctx.restore()

  // Título del eje X
  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#6B7280'
  ctx.fillText('Años', padding + chartWidth / 2, padding + chartHeight + 50)
}

const handleMouseMove = (event) => {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const { padding, chartWidth, minYear, maxYear } = chartDimensions

  // Verificar si está dentro del área del gráfico
  if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartDimensions.chartHeight) {
    // Calcular el año más cercano
    const relativeX = (x - padding) / chartWidth
    const year = Math.round(minYear + relativeX * (maxYear - minYear))

    // Buscar datos para ese año
    const yearData = props.data.find(d => d.year === year)
    if (yearData) {
      const tooltipData = props.series.map((serie, index) => ({
        name: serie.name,
        value: getNestedValue(yearData, serie.key),
        color: props.colors[index] || '#3B82F6'
      }))

      tooltip.value = {
        visible: true,
        x: Math.min(x, rect.width - 200), // Evitar que se salga del canvas
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

onMounted(() => {
  nextTick(() => {
    drawChart()
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

watch([() => props.data, () => props.series, () => props.colors], () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })
</script>