<template>
  <div class="program-charts space-y-6">
    <h2 class="text-lg font-semibold">Análisis de la oferta educativa</h2>

    <!-- Gráfica de barras: programas por sector -->
    <div class="chart-container">
      <h3 class="text-base font-medium mb-2">Programas por sector</h3>
      <BarChart
        v-if="barData.length"
        :data="barData"
        data-key="sector"
        :series="[{ name: 'Programas', key: 'count' }]"
      />
      <p v-else class="text-sm text-gray-500">No hay datos para mostrar</p>
    </div>

    <!-- Gráfica de líneas: programas por año (basado en created_at) -->
    <div class="chart-container">
      <h3 class="text-base font-medium mb-2">Evolución / Proyección de Programas</h3>
      <LineChart
        v-if="lineData.length"
        :data="lineData"
        data-key="year"
        :series="[{ name: 'Programas', key: 'count' }]"
      />
      <p v-else class="text-sm text-gray-500">No hay datos para mostrar</p>
    </div>
  </div>
</template>

<script>
import BarChart from "@/components/charts/BarChart.vue";
import LineChart from "@/components/charts/LineChart.vue";

export default {
  name: "ProgramCharts",
  components: { BarChart, LineChart },
  props: {
    programs: { type: Array, required: true }
  },
  computed: {
    // Datos para gráfica de barras (programas por sector)
    barData() {
      const counts = {};
      this.programs.forEach(p => {
        counts[p.sector] = (counts[p.sector] || 0) + 1;
      });
      return Object.entries(counts).map(([sector, count]) => ({
        sector,
        count
      }));
    },

    // Datos para gráfica de líneas (programas por año usando created_at)
// Datos para gráfica de líneas (programas por año usando created_at)
lineData() {
  const counts = {};
  this.programs.forEach(p => {
    const year = p.created_at
      ? new Date(p.created_at).getFullYear()
      : new Date().getFullYear();
    counts[year] = (counts[year] || 0) + 1;
  });

  let data = Object.entries(counts)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  // 🔧 Prevención: si todos los datos están en el mismo año, duplicamos para mostrar
  if (data.length === 1) {
    data = [
      { year: data[0].year - 1, count: 0 },
      data[0]
    ];
  }

  return data;
}
  }
  }
</script>

<style scoped>
.chart-container {
  background: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
