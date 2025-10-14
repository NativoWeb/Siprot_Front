<template>
  <div class="indicator-chart">
    <!-- Loading State -->
    <div v-if="loading" class="h-64 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos históricos...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasData" class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="text-center px-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay datos históricos</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Los datos históricos se generarán a medida que se actualice el indicador
        </p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else class="relative">
      <canvas ref="chartCanvas" class="w-full" style="max-height: 400px;"></canvas>
      
      <!-- Chart Controls -->
      <div class="mt-4 flex justify-between items-center">
        <div class="flex gap-2">
          <button 
            @click="toggleDataset('valores')"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              visibleDatasets.valores 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
          >
            <span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            Valores
          </button>
          <button 
            @click="toggleDataset('metas')"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              visibleDatasets.metas 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
          >
            <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Metas
          </button>
          <button 
            v-if="showCumplimiento"
            @click="toggleDataset('cumplimiento')"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              visibleDatasets.cumplimiento 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
          >
            <span class="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            % Cumplimiento
          </button>
        </div>

        <div class="flex gap-2">
          <button 
            @click="changeChartType('line')"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
            title="Gráfico de línea"
          >
            📈
          </button>
          <button 
            @click="changeChartType('bar')"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
            title="Gráfico de barras"
          >
            📊
          </button>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Promedio</p>
          <p class="text-lg font-bold text-blue-900 dark:text-blue-100">
            {{ stats.average.toFixed(2) }} {{ unidad }}
          </p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p class="text-xs text-green-600 dark:text-green-400 font-medium">Máximo</p>
          <p class="text-lg font-bold text-green-900 dark:text-green-100">
            {{ stats.max.toFixed(2) }} {{ unidad }}
          </p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
          <p class="text-xs text-red-600 dark:text-red-400 font-medium">Mínimo</p>
          <p class="text-lg font-bold text-red-900 dark:text-red-100">
            {{ stats.min.toFixed(2) }} {{ unidad }}
          </p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">Tendencia</p>
          <p class="text-lg font-bold text-purple-900 dark:text-purple-100">
            {{ stats.trend > 0 ? '↗️ +' : stats.trend < 0 ? '↘️ ' : '→ ' }}{{ Math.abs(stats.trend).toFixed(1) }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'IndicatorChart',
  props: {
    historicos: {
      type: Array,
      default: () => []
    },
    metas: {
      type: Array,
      default: () => []
    },
    unidad: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    showCumplimiento: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      chartInstance: null,
      chartType: 'line',
      visibleDatasets: {
        valores: true,
        metas: true,
        cumplimiento: false
      }
    };
  },
  computed: {
    hasData() {
      return this.historicos && this.historicos.length > 0;
    },
    stats() {
      if (!this.hasData) {
        return { average: 0, max: 0, min: 0, trend: 0 };
      }

      const valores = this.historicos.map(h => h.valor);
      const sum = valores.reduce((a, b) => a + b, 0);
      const average = sum / valores.length;
      const max = Math.max(...valores);
      const min = Math.min(...valores);

      // Calcular tendencia (comparar primero vs último)
      const trend = valores.length > 1
        ? ((valores[valores.length - 1] - valores[0]) / valores[0]) * 100
        : 0;

      return { average, max, min, trend };
    }
  },
  watch: {
    historicos: {
      handler() {
        this.renderChart();
      },
      deep: true
    },
    metas: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
  methods: {
    renderChart() {
      if (!this.$refs.chartCanvas || !this.historicos || this.historicos.length === 0) {
        return;
      }

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = this.$refs.chartCanvas.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');

      const labels = this.historicos.map(h => h.periodo);
      const valores = this.historicos.map(h => h.valor);

      const metasData = this.metas && this.metas.length > 0
        ? this.metas.map(m => m.valor)
        : this.historicos.map((h, index) => {
            if (this.metas && this.metas[index]) {
              return this.metas[index].valor;
            }
            return null;
          });

      const cumplimientoData = this.historicos.map((h, index) => {
        const meta = metasData[index];
        if (!meta || meta === 0) return 0;
        return ((h.valor / meta) * 100).toFixed(2);
      });

      const datasets = [];

      if (this.visibleDatasets.valores) {
        datasets.push({
          label: `Valores (${this.unidad})`,
          data: valores,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: this.chartType === 'line',
          yAxisID: 'y'
        });
      }

      if (this.visibleDatasets.metas && metasData.some(m => m !== null)) {
        datasets.push({
          label: `Metas (${this.unidad})`,
          data: metasData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          yAxisID: 'y'
        });
      }

      // Only add cumplimiento dataset and scale if showCumplimiento is true
      const shouldShowCumplimiento = this.visibleDatasets.cumplimiento && this.showCumplimiento;
      
      if (shouldShowCumplimiento) {
        datasets.push({
          label: 'Cumplimiento (%)',
          data: cumplimientoData,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          yAxisID: 'y1'
        });
      }

      // Base scales configuration
      const scales = {
        x: {
          ticks: {
            color: isDarkMode ? '#d1d5db' : '#374151'
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: this.unidad,
            color: isDarkMode ? '#d1d5db' : '#374151'
          },
          ticks: {
            color: isDarkMode ? '#d1d5db' : '#374151'
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      };

      // Only add y1 scale if cumplimiento dataset is visible
      if (shouldShowCumplimiento) {
        scales.y1 = {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Cumplimiento (%)',
            color: isDarkMode ? '#d1d5db' : '#374151'
          },
          ticks: {
            color: isDarkMode ? '#d1d5db' : '#374151',
            callback: (value) => value + '%'
          },
          grid: {
            drawOnChartArea: false
          }
        };
      }

      this.chartInstance = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: isDarkMode ? '#d1d5db' : '#374151',
                padding: 15,
                font: { size: 12 },
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDarkMode ? '#d1d5db' : '#374151',
              bodyColor: isDarkMode ? '#d1d5db' : '#374151',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    if (context.dataset.yAxisID === 'y1') {
                      label += context.parsed.y + '%';
                    } else {
                      label += context.parsed.y + ' ' + this.unidad;
                    }
                  }
                  return label;
                }
              }
            }
          },
          scales: scales
        }
      });
    },

    formatFecha(fecha) {
      if (!fecha) return '';
      try {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return fecha;
      }
    },

    toggleDataset(dataset) {
      if (dataset === 'valores') {
        this.visibleDatasets.valores = !this.visibleDatasets.valores;
      } else if (dataset === 'metas') {
        this.visibleDatasets.metas = !this.visibleDatasets.metas;
      } else if (dataset === 'cumplimiento') {
        this.visibleDatasets.cumplimiento = !this.visibleDatasets.cumplimiento;
      }
      this.renderChart();
    },

    changeChartType(type) {
      this.chartType = type;
      this.renderChart();
    }
  }
};
</script>

<style scoped>
.indicator-chart {
  width: 100%;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
