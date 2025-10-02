<template>
  <div class="program-charts space-y-6">
    <h2 class="text-lg font-semibold">Análisis de la oferta educativa</h2>

    <!-- Gráfica de barras: programas por sector -->
    <div class="chart-container">
      <h3 class="text-base font-medium mb-2">📊 Cantidad de programas por sector</h3>
      <BarChart
        v-if="barData.length"
        :data="barData"
        data-key="sector"
        :series="[{ name: 'Número de Programas', key: 'count' }]"
        :show-labels="true"
      />
      <p v-else class="text-sm text-gray-500">No hay datos para mostrar</p>
      <p class="text-xs text-gray-400 mt-2">
        Cada barra representa la cantidad total de programas registrados en ese sector educativo.
      </p>
    </div>

    <!-- Gráfica de líneas -->
    <div class="chart-container">
      <h3 class="text-base font-medium mb-2">📈 Evolución de Programas por año (basado en program_date)</h3>
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

    // Datos para gráfica de líneas (programas por año usando program_date)
    lineData() {
      const counts = {};
      this.programs.forEach(p => {
        const year = p.program_date
          ? new Date(p.program_date).getFullYear()
          : new Date().getFullYear();
        counts[year] = (counts[year] || 0) + 1;
      });

      let data = Object.entries(counts)
        .map(([year, count]) => ({ year: Number(year), count }))
        .sort((a, b) => a.year - b.year);

      if (data.length === 1) {
        data = [
          { year: data[0].year - 1, count: 0 },
          data[0]
        ];
      }

      return data;
    }
  }
};
</script>

<style scoped>
.chart-container {
  background: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
