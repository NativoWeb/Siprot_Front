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
    default: () => ['#3B82F6']
  }
})

const chartCanvas = ref(null)

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
  const padding = 40
  const chartWidth = rect.width - padding * 2
  const chartHeight = rect.height - padding * 2

  // Find max value
  let maxValue = 0
  props.data.forEach(d => {
    props.series.forEach(serie => {
      const value = d[serie.key] || 0
      if (value > maxValue) maxValue = value
    })
  })

  // Bar dimensions
  const barWidth = chartWidth / props.data.length * 0.8
  const barSpacing = chartWidth / props.data.length * 0.2

  // Draw bars
  props.data.forEach((d, index) => {
    const x = padding + index * (chartWidth / props.data.length) + barSpacing / 2
    
    props.series.forEach((serie, serieIndex) => {
      const value = d[serie.key] || 0
      const barHeight = (value / maxValue) * chartHeight
      const y = padding + chartHeight - barHeight

      ctx.fillStyle = props.colors[serieIndex] || '#3B82F6'
      ctx.fillRect(x + serieIndex * (barWidth / props.series.length), y, barWidth / props.series.length, barHeight)
    })
  })

  // Draw axes
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, padding + chartHeight)
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()

  // Draw labels
  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'

  // X-axis labels
  props.data.forEach((d, index) => {
    const x = padding + index * (chartWidth / props.data.length) + (chartWidth / props.data.length) / 2
    ctx.fillText(d.year?.toString() || index.toString(), x, padding + chartHeight + 20)
  })
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
