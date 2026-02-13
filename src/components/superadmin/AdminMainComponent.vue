<template>
  <div class="w-[90%]">
    <!-- Bienvenida -->
    <div class="mt-12 bg-[#08ac04] text-white rounded-lg p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-2">¡Bienvenido, Superadministrador!</h1>
          <p class="text-green-100">
            Gestiona el sistema SENA desde este panel de control. Aquí tienes un resumen de la actividad reciente.
          </p>
        </div>
      </div>
    </div>

    <!-- Totales -->
    <div class="mt-6 flex gap-20">
      <div class="container-info w-[100%]">
        <h2>Usuarios Registrados</h2>
        <span>{{ stats.usuarios }}</span>
      </div>
      <div class="container-info w-[100%]">
        <h2>Documentos Cargados</h2>
        <span>{{ stats.documentos }}</span>
      </div>
    </div>

    <!-- Gráficos -->
    <!-- Gráficos -->
<div class="mt-6 flex gap-20">
  <div class="container-info w-[100%]">
    <h3>Usuarios Registrados</h3>
    <span class="subtitle">Evolución mensual de usuarios</span>
    <div class="h-64">
      <BarChart
        :data="stats.usuarios_mensual.map(d => `${d.month}/${d.year}`)"
        :labels="stats.usuarios_mensual.map(d => `${d.month}/${d.year}`)"
        :series="[{ name: 'Usuarios', data: stats.usuarios_mensual.map(d => d.count) }]"
      />
    </div>
  </div>
  <div class="container-info w-[100%]">
    <h3>Documentos</h3>
    <span class="subtitle">Estadísticas de documentos por mes</span>
    <div class="h-64">
      <BarChart
        :data="stats.documentos_mensual.map(d => `${d.month}/${d.year}`)"
        :labels="stats.documentos_mensual.map(d => `${d.month}/${d.year}`)"
        :series="[{ name: 'Documentos', data: stats.documentos_mensual.map(d => d.count) }]"
      />
    </div>
  </div>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import BarChart from "../charts/BarChart.vue"

const stats = ref({
  usuarios: 0,
  documentos: 0,
  usuarios_mensual: [] as any[],
  documentos_mensual: [] as any[],
})

const API_BASE_URL = "http://localhost:8000"
const getAuthHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("access_token")}`
})

const loadStats = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() })
  if (res.ok) {
    stats.value = await res.json()
  } else {
    console.error("Error cargando stats:", res.status, await res.text())
  }
}

onMounted(loadStats)
</script>
