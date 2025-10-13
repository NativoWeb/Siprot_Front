<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foreground font-serif">Dashboard Ejecutivo</h1>
          <p class="text-muted-foreground mt-2">Visualización y análisis de indicadores estratégicos</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="cargarDatos"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            title="Refrescar datos"
          >
            🔄 Refrescar
          </button>
          <button
            @click="$router.push('/indicadores')"
            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            📋 Gestionar Indicadores
          </button>
        </div>
      </div>

      <!-- Resumen Ejecutivo -->
      <div v-if="resumen" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">Total Indicadores</p>
              <p class="text-3xl font-bold text-foreground">{{ resumen.total_indicadores }}</p>
            </div>
            <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>
        
        <div class="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">En Meta</p>
              <p class="text-3xl font-bold text-green-600">{{ resumen.verde }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ calcularPorcentaje(resumen.verde, resumen.total_indicadores) }}%
              </p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">En Progreso</p>
              <p class="text-3xl font-bold text-yellow-600">{{ resumen.amarillo }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ calcularPorcentaje(resumen.amarillo, resumen.total_indicadores) }}%
              </p>
            </div>
            <div class="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
              ⚠️
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">Críticos</p>
              <p class="text-3xl font-bold text-red-600">{{ resumen.rojo }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ calcularPorcentaje(resumen.rojo, resumen.total_indicadores) }}%
              </p>
            </div>
            <div class="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
              🚨
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Distribución de Estados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-card rounded-xl p-6 border shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-foreground">Distribución por Estado</h3>
          <div class="h-64">
            <canvas id="estadosChart"></canvas>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-foreground">Cumplimiento por Categoría</h3>
          <div class="h-64">
            <canvas id="categoriasChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Gráficos de Tendencias por Categoría -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-foreground">Tendencias por Categoría</h2>
          <select v-model="categoriaSeleccionada" class="p-2 border rounded-lg bg-input">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        
        <div class="grid grid-cols-1 gap-6">
          <div 
            v-for="indicador in indicadoresFiltradosPorCategoria" 
            :key="indicador.id"
            class="bg-card rounded-xl p-6 border shadow-sm"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 rounded-full" :class="getSemaforoClass(indicador.estado_semaforo)"></div>
                  <h3 class="text-lg font-semibold text-foreground">{{ indicador.nombre }}</h3>
                  <span class="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {{ indicador.categoria }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">{{ indicador.descripcion }}</p>
              </div>
              <div class="text-right ml-4">
                <p class="text-2xl font-bold text-foreground">{{ indicador.valor_actual }} {{ indicador.unidad }}</p>
                <p class="text-sm text-muted-foreground">Meta: {{ indicador.meta }} {{ indicador.unidad }}</p>
                <p class="text-sm font-semibold" :class="getTextClass(indicador.estado_semaforo)">
                  {{ Math.round(indicador.cumplimiento) }}% Cumplimiento
                </p>
              </div>
            </div>
            
            <IndicatorChart
              v-if="indicador.historicos"
              :historicos="indicador.historicos"
              :metas="indicador.metas"
              :unidad="indicador.unidad"
              :loading="false"
              :show-cumplimiento="true"
            />
            <div v-else class="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button 
                @click="cargarHistorico(indicador.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📈 Cargar Histórico
              </button>
            </div>
          </div>
        </div>

        <div v-if="indicadoresFiltradosPorCategoria.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">No hay indicadores para mostrar en esta categoría</p>
        </div>
      </div>

      <!-- Top Indicadores (Mejor y Peor Desempeño) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-card rounded-xl p-6 border shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
            🏆 Top 5 - Mejor Desempeño
          </h3>
          <div class="space-y-3">
            <div 
              v-for="(ind, index) in topMejores" 
              :key="ind.id"
              class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="font-bold text-green-700 dark:text-green-400 text-lg">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium text-foreground">{{ ind.nombre }}</p>
                  <p class="text-xs text-muted-foreground">{{ ind.categoria }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-green-700 dark:text-green-400">{{ Math.round(ind.cumplimiento) }}%</p>
                <p class="text-xs text-muted-foreground">{{ ind.valor_actual }} / {{ ind.meta }} {{ ind.unidad }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
            ⚠️ Top 5 - Requiere Atención
          </h3>
          <div class="space-y-3">
            <div 
              v-for="(ind, index) in topPeores" 
              :key="ind.id"
              class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="font-bold text-red-700 dark:text-red-400 text-lg">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium text-foreground">{{ ind.nombre }}</p>
                  <p class="text-xs text-muted-foreground">{{ ind.categoria }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-red-700 dark:text-red-400">{{ Math.round(ind.cumplimiento) }}%</p>
                <p class="text-xs text-muted-foreground">{{ ind.valor_actual }} / {{ ind.meta }} {{ ind.unidad }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";
import Chart from 'chart.js/auto';
import IndicatorChart from '@/components/charts/IndicatorChart.vue';

export default {
  name: 'DashboardIndicadores',
  components: {
    IndicatorChart
  },
  data() {
    return {
      userRole: 'directivos',
      indicadores: [],
      resumen: null,
      categoriaSeleccionada: '',
      loading: false,
      estadosChartInstance: null,
      categoriasChartInstance: null,
      autoRefreshInterval: null
    };
  },
  computed: {
    categoriasDisponibles() {
      return [...new Set(this.indicadores.map(ind => ind.categoria).filter(Boolean))];
    },
    indicadoresFiltradosPorCategoria() {
      if (!this.categoriaSeleccionada) return this.indicadores;
      return this.indicadores.filter(ind => ind.categoria === this.categoriaSeleccionada);
    },
    topMejores() {
      return [...this.indicadores]
        .sort((a, b) => b.cumplimiento - a.cumplimiento)
        .slice(0, 5);
    },
    topPeores() {
      return [...this.indicadores]
        .sort((a, b) => a.cumplimiento - b.cumplimiento)
        .slice(0, 5);
    }
  },
  async mounted() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role) this.userRole = decoded.role;
      } catch (e) {
        console.error("Error al decodificar token:", e);
      }
    }
    await this.cargarDatos();
    this.renderCharts();

    // Auto-refresh cada 5 minutos
    this.autoRefreshInterval = setInterval(() => {
      this.cargarDatos();
    }, 300000);
  },
  beforeUnmount() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    if (this.estadosChartInstance) {
      this.estadosChartInstance.destroy();
    }
    if (this.categoriasChartInstance) {
      this.categoriasChartInstance.destroy();
    }
  },
  methods: {
    async cargarDatos() {
      this.loading = true;
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const token = localStorage.getItem('access_token');
      
      try {
        if (!token) throw new Error("No token");

        const response = await fetch(`${baseUrl}/indicators/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        this.indicadores = await response.json();

        const resumenResponse = await fetch(`${baseUrl}/indicators/resumen`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.resumen = resumenResponse.ok ? await resumenResponse.json() : null;

        await this.$nextTick();
        this.renderCharts();
      } catch (err) {
        console.error("Error cargando datos:", err.message);
      } finally {
        this.loading = false;
      }
    },

    async cargarHistorico(indicadorId) {
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const token = localStorage.getItem('access_token');
      
      try {
        const response = await fetch(`${baseUrl}/indicators/${indicadorId}/history?years=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        
        const ind = this.indicadores.find(i => i.id === indicadorId);
        if (ind) {
          ind.historicos = data.historicos;
          ind.metas = data.metas;
        }
      } catch (err) {
        console.error("Error cargando histórico:", err.message);
      }
    },

    renderCharts() {
      this.$nextTick(() => {
        this.renderEstadosChart();
        this.renderCategoriasChart();
      });
    },

    renderEstadosChart() {
      const canvas = document.getElementById('estadosChart');
      if (!canvas || !this.resumen) return;

      if (this.estadosChartInstance) {
        this.estadosChartInstance.destroy();
      }

      const ctx = canvas.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');

      this.estadosChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['En Meta', 'En Progreso', 'Críticos'],
          datasets: [{
            data: [this.resumen.verde, this.resumen.amarillo, this.resumen.rojo],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(234, 179, 8)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: isDarkMode ? '#d1d5db' : '#374151',
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDarkMode ? '#d1d5db' : '#374151',
              bodyColor: isDarkMode ? '#d1d5db' : '#374151',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1
            }
          }
        }
      });
    },

    renderCategoriasChart() {
      const canvas = document.getElementById('categoriasChart');
      if (!canvas || !this.indicadores.length) return;

      if (this.categoriasChartInstance) {
        this.categoriasChartInstance.destroy();
      }

      // Calcular cumplimiento promedio por categoría
      const cumplimientoPorCategoria = {};
      this.indicadores.forEach(ind => {
        const cat = ind.categoria || 'Sin categoría';
        if (!cumplimientoPorCategoria[cat]) {
          cumplimientoPorCategoria[cat] = { suma: 0, count: 0 };
        }
        cumplimientoPorCategoria[cat].suma += ind.cumplimiento;
        cumplimientoPorCategoria[cat].count += 1;
      });

      const labels = Object.keys(cumplimientoPorCategoria);
      const data = labels.map(cat => 
        cumplimientoPorCategoria[cat].suma / cumplimientoPorCategoria[cat].count
      );

      const ctx = canvas.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');

      this.categoriasChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '% Cumplimiento Promedio',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDarkMode ? '#d1d5db' : '#374151',
              bodyColor: isDarkMode ? '#d1d5db' : '#374151',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  return `Cumplimiento: ${context.parsed.y.toFixed(2)}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 120,
              ticks: {
                color: isDarkMode ? '#d1d5db' : '#374151',
                callback: (value) => value + '%'
              },
              grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              ticks: {
                color: isDarkMode ? '#d1d5db' : '#374151'
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    },

    calcularPorcentaje(valor, total) {
      if (!total) return 0;
      return Math.round((valor / total) * 100);
    },

    getSemaforoClass(estado) {
      return {
        'verde': 'bg-green-500',
        'amarillo': 'bg-yellow-500',
        'rojo': 'bg-red-500'
      }[estado] || 'bg-gray-500';
    },

    getTextClass(estado) {
      return {
        'verde': 'text-green-600',
        'amarillo': 'text-yellow-600',
        'rojo': 'text-red-600'
      }[estado] || 'text-gray-600';
    }
  }
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
