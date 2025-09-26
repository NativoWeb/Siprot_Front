<template>
  <div class="program-projections">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-700">🔮 Proyecciones a 10 años</h3>
      <div class="flex gap-2">
        <select v-model="selectedSector" @change="loadProjections" class="px-3 py-1 border rounded">
          <option value="">Todos los sectores</option>
          <option v-for="sector in sectors" :key="sector" :value="sector">{{ sector }}</option>
        </select>
        <button 
          @click="loadProjections" 
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Generando...' : 'Generar Proyecciones' }}
        </button>
        <button 
          @click="toggleDebugMode" 
          class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          {{ debugMode ? '🔍' : '🐛' }}
        </button>
      </div>
    </div>

    <!-- Debug Info -->
    <div v-if="debugMode" class="bg-yellow-50 p-3 rounded mb-4 text-sm">
      <p><strong>Debug:</strong></p>
      <p>Datos históricos: {{ historicalData.length }}</p>
      <p>Proyecciones: {{ projections.length }}</p>
      <p>Método usado: {{ projectionMethod }}</p>
      <p>Total puntos: {{ totalDataPoints }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Generando proyecciones con Machine Learning...</p>
    </div>

    <div v-else-if="hasProjectionData" class="space-y-6">
      <!-- Resumen de proyecciones -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-800">Crecimiento Promedio</h4>
          <p class="text-2xl font-bold text-blue-600">{{ averageGrowth }}%</p>
          <p class="text-sm text-blue-600">anual proyectado</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-green-800">Estudiantes en {{ futureYear }}</h4>
          <p class="text-2xl font-bold text-green-600">{{ projectedStudents }}</p>
          <p class="text-sm text-green-600">estudiantes estimados</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-semibold text-purple-800">Nuevos Programas</h4>
          <p class="text-2xl font-bold text-purple-600">{{ newProgramsNeeded }}</p>
          <p class="text-sm text-purple-600">programas recomendados</p>
        </div>
      </div>

      <!-- Gráfico con Chart.js -->
      <div class="bg-white border rounded-lg p-4 relative" style="min-height:400px;">
        <canvas 
          ref="projectionChart" 
          v-show="hasProjectionData"
          style="height:350px; width:100%;">
        </canvas>
        <div v-if="!hasProjectionData" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
            </svg>
            <p class="text-lg font-medium">Gráfico en preparación</p>
            <p class="text-sm">Los datos se cargarán automáticamente</p>
          </div>
        </div>
      </div>

      <!-- Tabla de proyecciones -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="p-4 border-b bg-gray-50">
          <h4 class="font-semibold">Datos de Proyección Detallados</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left">Año</th>
                <th class="px-4 py-2 text-left">Tipo</th>
                <th class="px-4 py-2 text-left">Programas</th>
                <th class="px-4 py-2 text-left">Estudiantes</th>
                <th class="px-4 py-2 text-left">Capacidad</th>
                <th class="px-4 py-2 text-left">Crecimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in combinedData" :key="`${item.year}-${item.type}`" 
                  :class="{ 'bg-blue-50': item.type === 'proyección', 'border-t': index > 0 }">
                <td class="px-4 py-2 font-semibold">{{ item.year }}</td>
                <td class="px-4 py-2">
                  <span :class="item.type === 'histórico' ? 'text-green-600' : 'text-blue-600'" 
                        class="text-sm font-medium">
                    {{ item.type }}
                  </span>
                </td>
                <td class="px-4 py-2">{{ item.values.Programas }}</td>
                <td class="px-4 py-2">{{ item.values.Estudiantes }}</td>
                <td class="px-4 py-2">{{ item.values.Capacidad }}</td>
                <td class="px-4 py-2" :class="item.growth >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ item.growth !== null ? (item.growth > 0 ? '+' : '') + item.growth.toFixed(1) + '%' : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !hasProjectionData" class="text-center py-8 text-gray-500">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      </div>
      <p class="text-lg font-medium">No hay datos para proyecciones</p>
      <p class="text-sm mt-2">Haz clic en "Generar Proyecciones" para crear estimaciones</p>
      <button @click="debugMode = !debugMode" class="mt-2 text-xs text-gray-400 hover:text-gray-600">
        {{ debugMode ? 'Ocultar' : 'Mostrar' }} debug
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'ProgramProjections',
  props: {
    programs: { type: Array, default: () => [] }
  },
  
  watch: {
    // Observar cambios en los programas
    programs: {
      handler(newPrograms, oldPrograms) {
        console.log('📊 Programas actualizados:', newPrograms.length);
        if (newPrograms.length > 0 && newPrograms.length !== oldPrograms?.length) {
          // Recargar proyecciones cuando cambien los programas
          setTimeout(() => {
            this.loadProjections();
          }, 500);
        }
      },
      deep: true,
      immediate: false
    },
    
    // Observar cambios en el sector seleccionado
    selectedSector: {
      handler(newSector, oldSector) {
        if (newSector !== oldSector && this.programs.length > 0) {
          console.log('🔄 Sector cambiado de', oldSector, 'a', newSector);
          
          // Destruir gráfico actual inmediatamente para evitar conflictos
          this.destroyChart();
          
          // Debounce para evitar múltiples llamadas rápidas
          if (this.sectorChangeTimeout) {
            clearTimeout(this.sectorChangeTimeout);
          }
          
          this.sectorChangeTimeout = setTimeout(() => {
            this.loadProjections();
          }, 300);
        }
      },
      immediate: false
    }
  },
  data() {
    return {
      historicalData: [],
      projections: [],
      loading: false,
      selectedSector: '',
      chart: null,
      projectionMethod: '',
      debugMode: false,
      totalDataPoints: 0,
      apiError: null,
      sectorChangeTimeout: null,
      renderingInProgress: false,
      chartId: 0 // ID único para cada gráfico
    };
  },
  computed: {
    sectors() {
      return [...new Set(this.programs.map(p => p.sector))].filter(Boolean);
    },
    
    hasProjectionData() {
      return this.historicalData.length > 0 || this.projections.length > 0;
    },
    
    combinedData() {
      const historical = this.historicalData.map((item, index) => ({
        ...item,
        type: 'histórico',
        growth: index > 0 ? this.calculateGrowth(this.historicalData[index-1], item) : null
      }));
      
      const projected = this.projections.map((item, index) => ({
        ...item,
        type: 'proyección',
        growth: index === 0 && historical.length > 0 
          ? this.calculateGrowth(historical[historical.length - 1], item)
          : index > 0 ? this.calculateGrowth(this.projections[index-1], item) : null
      }));
      
      return [...historical, ...projected];
    },
    
    averageGrowth() {
      const growthRates = this.combinedData
        .filter(item => item.growth !== null && !isNaN(item.growth))
        .map(item => item.growth);
      
      if (growthRates.length === 0) return 0;
      return (growthRates.reduce((a, b) => a + b, 0) / growthRates.length).toFixed(1);
    },
    
    futureYear() {
      return this.projections.length > 0 ? 
        Math.max(...this.projections.map(p => p.year)) : 
        new Date().getFullYear() + 10;
    },
    
    projectedStudents() {
      if (this.projections.length === 0) return 0;
      const lastProjection = this.projections[this.projections.length - 1];
      return lastProjection.values?.Estudiantes || 0;
    },
    
    newProgramsNeeded() {
      const currentStudents = this.programs.reduce((sum, p) => sum + (p.current_students || 0), 0);
      const projectedStudents = this.projectedStudents;
      const avgCapacityPerProgram = 30;
      const difference = Math.max(0, projectedStudents - currentStudents);
      return Math.ceil(difference / avgCapacityPerProgram);
    }
  },
  
  methods: {
    calculateGrowth(previous, current) {
      const prevStudents = previous.values?.Estudiantes || 0;
      const currStudents = current.values?.Estudiantes || 0;
      
      if (prevStudents === 0) return currStudents > 0 ? 100 : 0;
      return ((currStudents - prevStudents) / prevStudents) * 100;
    },
    
    async loadProjections() {
      if (!this.programs.length) {
        console.warn('No hay programas cargados');
        return;
      }
      
      // Cancelar cualquier renderizado pendiente y destruir gráfico actual
      this.destroyChart();
      
      this.loading = true;
      this.apiError = null;
      
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Token de autenticación no encontrado");
        }
        
        const params = { years: 10 };
        if (this.selectedSector) {
          params.sector = this.selectedSector;
        }
        
        console.log('🔄 Cargando proyecciones con parámetros:', params);
        
        const response = await axios.get("http://localhost:8000/programs/projections", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params
        });

        console.log('📊 Respuesta del API:', response.data);

        if (response.data.success === false) {
          throw new Error(response.data.error || 'Error en la generación de proyecciones');
        }

        // Procesar datos históricos
        this.historicalData = Array.isArray(response.data.historical_data) 
          ? response.data.historical_data 
          : [];

        // Procesar proyecciones
        this.projections = Array.isArray(response.data.projections) 
          ? response.data.projections 
          : [];

        this.projectionMethod = response.data.method || 'Desconocido';
        this.totalDataPoints = response.data.total_data_points || 0;

        console.log(`✅ Datos procesados: ${this.historicalData.length} históricos, ${this.projections.length} proyecciones`);

        // Renderizar gráfico con múltiples intentos para asegurar que el DOM esté listo
        this.$nextTick(() => {
          // Doble nextTick para asegurar que el DOM esté completamente renderizado
          this.$nextTick(() => {
            setTimeout(() => {
              this.renderChart();
            }, 50); // Pequeño delay adicional
          });
        });

      } catch (error) {
        console.error("❌ Error cargando proyecciones:", error);
        this.apiError = error.message;
        
        // Limpiar datos en caso de error
        this.historicalData = [];
        this.projections = [];
        
        // Opcional: mostrar datos de ejemplo para debugging
        if (this.debugMode) {
          this.generateSampleData();
        } else {
          // Asegurar que se intente renderizar incluso sin datos de proyección
          this.$nextTick(() => {
            this.$nextTick(() => {
              setTimeout(() => {
                // Intentar renderizar aunque sea un gráfico vacío o de error
                this.renderEmptyChart();
              }, 50);
            });
          });
        }
        
      } finally {
        this.loading = false;
      }
    },
    
    generateSampleData() {
      const currentYear = new Date().getFullYear();
      this.historicalData = [
        { year: currentYear - 2, values: { Programas: 10, Estudiantes: 300, Capacidad: 400 }},
        { year: currentYear - 1, values: { Programas: 15, Estudiantes: 450, Capacidad: 600 }},
        { year: currentYear, values: { Programas: 20, Estudiantes: 600, Capacidad: 800 }}
      ];
      
      this.projections = Array.from({length: 10}, (_, i) => ({
        year: currentYear + i + 1,
        values: {
          Programas: 20 + (i + 1) * 2,
          Estudiantes: 600 + (i + 1) * 50,
          Capacidad: 800 + (i + 1) * 60
        }
      }));
      
      this.projectionMethod = 'Datos de ejemplo';
      this.$nextTick(() => {
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart();
          }, 50);
        });
      });
    },
    
    renderEmptyChart() {
      // Verificar si el componente está siendo destruido
      if (this._isBeingDestroyed || this._isDestroyed || this.renderingInProgress) {
        return;
      }

      this.renderingInProgress = true;

      if (!this.$refs.projectionChart) {
        console.warn('Canvas ref no disponible para gráfico vacío');
        this.renderingInProgress = false;
        return;
      }

      let ctx;
      try {
        ctx = this.$refs.projectionChart.getContext('2d');
        if (!ctx) {
          this.renderingInProgress = false;
          return;
        }
      } catch (error) {
        console.error('Error obteniendo contexto para gráfico vacío:', error);
        this.renderingInProgress = false;
        return;
      }
      
      // Destruir gráfico existente de forma segura
      this.destroyChart();

      try {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Sin datos'],
            datasets: [{
              label: 'Sin datos disponibles',
              data: [0],
              borderColor: '#e5e7eb',
              backgroundColor: 'rgba(229,231,235,0.1)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0 // Desactivar animaciones
            },
            plugins: {
              title: {
                display: true,
                text: 'No hay datos disponibles para proyecciones'
              }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      } catch (error) {
        console.error('Error creando gráfico vacío:', error);
        this.chart = null;
      } finally {
        this.renderingInProgress = false;
      }
    },
    
    destroyChart() {
      if (this.chart) {
        try {
          // Parar todas las animaciones inmediatamente
          this.chart.stop();
          
          // Destruir el gráfico
          this.chart.destroy();
          
          console.log('✅ Gráfico destruido correctamente');
        } catch (error) {
          console.warn('⚠️ Error destruyendo gráfico:', error);
        } finally {
          this.chart = null;
          this.renderingInProgress = false;
        }
      }
    },

    renderChart() {
      // Verificar si ya hay un renderizado en progreso
      if (this.renderingInProgress) {
        console.warn('Renderizado ya en progreso, cancelando...');
        return;
      }

      // Verificar si el componente está siendo destruido
      if (this._isBeingDestroyed || this._isDestroyed) {
        console.warn('Componente destruido, cancelando renderizado');
        return;
      }

      // Marcar renderizado en progreso
      this.renderingInProgress = true;
      const currentChartId = ++this.chartId;

      // Verificar múltiples veces si el ref está disponible
      if (!this.$refs.projectionChart) {
        console.warn('Canvas ref no disponible, reintentando...');
        this.renderingInProgress = false;
        
        // Reintentar después de un breve delay
        setTimeout(() => {
          if (this.chartId === currentChartId && this.$refs.projectionChart && !this._isBeingDestroyed) {
            this.renderChart();
          } else {
            console.error('Canvas ref sigue no disponible o el componente cambió');
          }
        }, 100);
        return;
      }
      
      if (!this.hasProjectionData) {
        console.warn('No hay datos para renderizar');
        this.renderingInProgress = false;
        return;
      }

      // Asegurar que el canvas esté disponible y válido
      let ctx;
      try {
        ctx = this.$refs.projectionChart.getContext('2d');
        if (!ctx) {
          console.error('No se pudo obtener contexto 2d del canvas');
          this.renderingInProgress = false;
          return;
        }
      } catch (error) {
        console.error('Error obteniendo contexto del canvas:', error);
        this.renderingInProgress = false;
        return;
      }

      // Destruir gráfico existente de forma segura
      this.destroyChart();

      const allData = [...this.historicalData, ...this.projections];
      const labels = allData.map(item => item.year);
      const studentsData = allData.map(item => item.values?.Estudiantes || 0);
      const programsData = allData.map(item => item.values?.Programas || 0);
      
      const historicalLength = this.historicalData.length;

      console.log('🎨 Renderizando gráfico con:', {
        totalPoints: allData.length,
        historicalPoints: historicalLength,
        projectionPoints: this.projections.length
      });

      // Crear el gráfico de forma segura
      try {
        // Verificar una vez más que todo esté bien antes de crear
        if (this.chartId !== currentChartId || this._isBeingDestroyed) {
          console.warn('Estado del componente cambió durante renderizado');
          this.renderingInProgress = false;
          return;
        }

        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Estudiantes (Histórico)',
                data: studentsData.slice(0, historicalLength),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.2,
                pointRadius: 6,
                pointHoverRadius: 8
              },
              {
                label: 'Estudiantes (Proyección)',
                data: [
                  ...Array(historicalLength - 1).fill(null),
                  ...(historicalLength > 0 ? [studentsData[historicalLength - 1]] : []),
                  ...studentsData.slice(historicalLength)
                ],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                tension: 0.2,
                pointRadius: 6,
                pointHoverRadius: 8
              },
              {
                label: 'Programas',
                data: programsData,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.2,
                pointRadius: 4,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0 // Desactivar animaciones para evitar problemas
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              title: {
                display: true,
                text: `Proyecciones Educativas - ${this.selectedSector || 'Todos los sectores'}`,
                font: { size: 16 }
              },
              legend: {
                position: 'top'
              },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white'
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Año'
                },
                grid: {
                  display: true,
                  color: 'rgba(0,0,0,0.1)'
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Estudiantes'
                },
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(0,0,0,0.1)'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Programas'
                },
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }
        });

        console.log('✅ Gráfico creado exitosamente');
        
      } catch (error) {
        console.error('❌ Error creando el gráfico:', error);
        this.chart = null;
      } finally {
        this.renderingInProgress = false;
      }
    },
    
    toggleDebugMode() {
      this.debugMode = !this.debugMode;
      if (this.debugMode && !this.hasProjectionData) {
        console.log('🐛 Activando modo debug con datos de ejemplo');
        this.generateSampleData();
      }
    }
  },
  
  mounted() {
    console.log('🔄 Componente montado, programas disponibles:', this.programs.length);
    
    // Esperar a que el DOM esté completamente renderizado
    this.$nextTick(() => {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.programs.length > 0) {
            this.loadProjections();
          } else {
            console.log('⏳ No hay programas, esperando...');
            // Verificar periódicamente si se cargan los programas
            const checkPrograms = setInterval(() => {
              if (this.programs.length > 0) {
                clearInterval(checkPrograms);
                this.loadProjections();
              }
            }, 1000);
            
            // Limpiar el interval después de 10 segundos para evitar loops infinitos
            setTimeout(() => {
              clearInterval(checkPrograms);
            }, 10000);
          }
        }, 100);
      });
    });
  },
  
  beforeUnmount() {
    console.log('🧹 Limpiando componente...');
    
    // Limpiar timeout pendiente
    if (this.sectorChangeTimeout) {
      clearTimeout(this.sectorChangeTimeout);
    }
    
    // Destruir gráfico de forma segura
    this.destroyChart();
  }
};
</script>

<style scoped>
.program-projections {
  max-width: 100%;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

canvas {
  max-height: 100%;
  max-width: 100%;
}

table {
  font-size: 0.875rem;
}
</style>