<template>
  <div class="w-full h-full relative">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    
    <!-- Leyenda -->
    <div v-if="series.length > 1" class="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
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
      <div class="font-semibold">{{ tooltip.label }}</div>
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
  label: '',
  data: []
})

let chartDimensions = {
  padding: 60,
  chartWidth: 0,
  chartHeight: 0,
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

const calculateMaxValue = () => {
  chartDimensions.maxValue = 0
  props.data.forEach(d => {
    props.series.forEach(serie => {
      const value = getNestedValue(d, serie.key)
      if (value > chartDimensions.maxValue) {
        chartDimensions.maxValue = value
      }
    })
  })
  // Agregar espacio arriba
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

  calculateMaxValue()

  // Draw background
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, rect.width, rect.height)

  // Draw grid
  drawGrid(ctx)

  // Draw axes
  drawAxes(ctx)

  // Draw bars
  drawBars(ctx)

  // Draw labels
  drawLabels(ctx)
}

const drawGrid = (ctx) => {
  const { padding, chartWidth, chartHeight } = chartDimensions

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 0.5

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
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

  ctx.lineTo(padding, padding + chartHeight)
  // Eje X
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()
}

const drawBars = (ctx) => {
  const { padding, chartWidth, chartHeight, maxValue } = chartDimensions

  if (!props.data.length) return

  const groupWidth = chartWidth / props.data.length * 0.8
  const barWidth = groupWidth / props.series.length
  const groupSpacing = chartWidth / props.data.length * 0.2

  props.data.forEach((d, dataIndex) => {
    const groupX = padding + dataIndex * (chartWidth / props.data.length) + groupSpacing / 2

    props.series.forEach((serie, serieIndex) => {
      const value = getNestedValue(d, serie.key)
      const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0
      const barX = groupX + serieIndex * barWidth
      const barY = padding + chartHeight - barHeight

      // Gradiente para las barras
      const gradient = ctx.createLinearGradient(0, barY, 0, barY + barHeight)
      const color = props.colors[serieIndex] || '#3B82F6'
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color + '80') // Más transparente abajo

      ctx.fillStyle = gradient
      ctx.fillRect(barX, barY, barWidth * 0.9, barHeight) // 0.9 para un poco de espacio entre barras

      // Borde de la barra
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barWidth * 0.9, barHeight)

      // Valor en la parte superior de la barra
      if (barHeight > 20) { // Solo mostrar si hay espacio
        ctx.fillStyle = '#374151'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          formatNumber(value),
          barX + (barWidth * 0.9) / 2,
          barY - 5
        )
      }
    })
  })
}

const drawLabels = (ctx) => {
  const { padding, chartWidth, chartHeight, maxValue } = chartDimensions

  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'

  // Etiquetas del eje X
  ctx.textAlign = 'center'
  props.data.forEach((d, index) => {
    const x = padding + index * (chartWidth / props.data.length) + (chartWidth / props.data.length) / 2
    const label = d.year?.toString() || d.label?.toString() || index.toString()
    ctx.fillText(label, x, padding + chartHeight + 20)
  })
}

const handleMouseMove = (event) => {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const { padding, chartWidth, chartHeight } = chartDimensions

  // Verificar si está dentro del área del gráfico
  if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartHeight) {
    // Determinar qué barra está siendo hover
    const dataIndex = Math.floor((x - padding) / (chartWidth / props.data.length))
    
    if (dataIndex >= 0 && dataIndex < props.data.length) {
      const d = props.data[dataIndex]
      const tooltipData = props.series.map((serie, index) => ({
        name: serie.name,
        value: getNestedValue(d, serie.key),
        color: props.colors[index] || '#3B82F6'
      }))

      tooltip.value = {
        visible: true,
        x: Math.min(x, rect.width - 200),
        y: Math.max(y - 100, 10),
        label: d.year?.toString() || d.label?.toString() || `Item ${dataIndex + 1}`,
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