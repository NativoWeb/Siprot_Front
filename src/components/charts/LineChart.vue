<template>
  <div class="w-full h-full">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

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
    default: () => ['#3B82F6', '#10B981', '#EF4444']
  }
})

const chartCanvas = ref(null)
let chart = null

const drawChart = () => {
  if (!chartCanvas.value || !props.data.length) return

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
  const padding = 60
  const chartWidth = rect.width - padding * 2
  const chartHeight = rect.height - padding * 2

  // Get data ranges
  const years = props.data.map(d => d.year)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  // Find max value across all series
  let maxValue = 0
  props.series.forEach(serie => {
    props.data.forEach(d => {
      const value = getNestedValue(d, serie.key)
      if (value > maxValue) maxValue = value
    })
  })

  // Draw grid
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1

  // Vertical grid lines
  for (let i = 0; i <= 10; i++) {
    const x = padding + (chartWidth / 10) * i
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, padding + chartHeight)
    ctx.stroke()
  }

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + chartWidth, y)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + chartHeight)
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()

  // Draw data lines
  props.series.forEach((serie, index) => {
    const color = props.colors[index] || '#3B82F6'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    let firstPoint = true
    props.data.forEach(d => {
      const x = padding + ((d.year - minYear) / (maxYear - minYear)) * chartWidth
      const value = getNestedValue(d, serie.key)
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      if (firstPoint) {
        ctx.moveTo(x, y)
        firstPoint = false
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    ctx.fillStyle = color
    props.data.forEach(d => {
      const x = padding + ((d.year - minYear) / (maxYear - minYear)) * chartWidth
      const value = getNestedValue(d, serie.key)
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  })

  // Draw labels
  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'

  // X-axis labels (years)
  years.forEach(year => {
    const x = padding + ((year - minYear) / (maxYear - minYear)) * chartWidth
    ctx.fillText(year.toString(), x, padding + chartHeight + 20)
  })

  // Y-axis labels
  ctx.textAlign = 'right'
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue / 5) * (5 - i)
    const y = padding + (chartHeight / 5) * i + 5
    ctx.fillText(Math.round(value).toString(), padding - 10, y)
  }
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || 0
}

onMounted(() => {
  nextTick(() => {
    drawChart()
  })
})

watch([() => props.data, () => props.series], () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })
</script>

