<template>
  <!-- Wrapper graficos tipo bar -->
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
// Se importa Chart JS y sus componentes para construir graficas de barras
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


// Registro de componentes
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


// Se definen los Datos del grafico - HARDCODED JOB DATA por el momento
const chartData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
  datasets: [
    {
      label: 'Usuarios registrados por mes',
      backgroundColor: '#42A5F5', // Color de las barras
      data: [40, 20, 12, 39, 4] // Hardcoded Job Data
    }
  ]
}

// Se definen las opciones del grafico
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Gráfico de Ventas Mensuales' // Titulo del grafico
    }
  }
}
</script>