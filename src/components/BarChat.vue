<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
  datasets: [
    {
      label: 'Usuarios registrados por mes',
      backgroundColor: '#42A5F5',
      data: [40, 20, 12, 39, 4]
    }
  ]
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Gráfico de Ventas Mensuales'
    }
  }
}
</script>