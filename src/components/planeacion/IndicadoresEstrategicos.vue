<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foreground font-serif">Panel de Indicadores Estratégicos</h1>
          <p class="text-muted-foreground mt-2">Monitoreo y gestión de KPIs institucionales</p>
        </div>
        <div class="flex gap-3">
          <button
            v-if="canEdit"
            @click="showCreateModal = true"
            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            ➕ Nuevo Indicador
          </button>
          <button
            @click="exportData"
            class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            📊 Exportar
          </button>
        </div>
      </div>

      <!-- Resumen Ejecutivo -->
      <div v-if="resumen" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-card rounded-xl p-6 border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">Total Indicadores</p>
              <p class="text-2xl font-bold">{{ resumen.total_indicadores }}</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              📈
            </div>
          </div>
        </div>
        
        <div class="bg-card rounded-xl p-6 border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">En Meta</p>
              <p class="text-2xl font-bold text-green-600">{{ resumen.verde }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              🟢
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">En Progreso</p>
              <p class="text-2xl font-bold text-yellow-600">{{ resumen.amarillo }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              🟡
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm">Críticos</p>
              <p class="text-2xl font-bold text-red-600">{{ resumen.rojo }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              🔴
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-card rounded-xl p-6 mb-8 border">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Categoría</label>
            <select v-model="filtroCategoria" class="w-full p-3 border rounded-lg bg-input">
              <option value="">Todas</option>
              <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Estado</label>
            <select v-model="filtroEstado" class="w-full p-3 border rounded-lg bg-input">
              <option value="">Todos</option>
              <option value="verde">Verde</option>
              <option value="amarillo">Amarillo</option>
              <option value="rojo">Rojo</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Período</label>
            <select v-model="filtroPeriodo" class="w-full p-3 border rounded-lg bg-input">
              <option value="actual">Actual</option>
              <option value="trimestre">Trimestre</option>
              <option value="año">Año</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Grid de Indicadores -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="indicador in indicadoresFiltrados"
          :key="indicador.id"
          class="bg-card rounded-xl p-6 border hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
          @click="verDetalle(indicador)"
        >
          <!-- Estado Semáforo -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full" :class="getSemaforoClass(indicador.estado_semaforo)"></div>
              <span class="text-sm text-muted-foreground">{{ indicador.categoria }}</span>
            </div>
            <div v-if="canEdit" class="flex gap-1">
              <button @click.stop="editarIndicador(indicador)" class="p-1 text-muted-foreground hover:text-primary transition-colors">✏️</button>
              <button @click.stop="eliminarIndicador(indicador.id)" class="p-1 text-muted-foreground hover:text-red-500 transition-colors">🗑️</button>
            </div>
          </div>

          <!-- Contenido -->
          <h3 class="text-lg font-semibold mb-2 text-foreground">{{ indicador.nombre }}</h3>
          <p class="text-sm text-muted-foreground mb-4">{{ indicador.descripcion }}</p>

          <!-- Valores -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Valor Actual</span>
              <span class="text-xl font-bold text-foreground">{{ indicador.valor_actual }} {{ indicador.unidad }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Meta</span>
              <span class="text-lg font-semibold text-foreground">{{ indicador.meta }} {{ indicador.unidad }}</span>
            </div>
            
            <!-- Barra de Progreso -->
            <div class="w-full bg-muted rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all"
                :class="getSemaforoClass(indicador.estado_semaforo)"
                :style="{ width: Math.min(indicador.cumplimiento, 100) + '%' }"
              ></div>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Cumplimiento</span>
              <span class="font-semibold" :class="getTextClass(indicador.estado_semaforo)">
                {{ Math.round(indicador.cumplimiento) }}%
              </span>
            </div>
          </div>

          <!-- Tendencia -->
          <div class="mt-4 pt-4 border-t border-border">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Tendencia</span>
              <span :class="getTendenciaClass(indicador.tendencia)">
                {{ getTendenciaIcon(indicador.tendencia) }} {{ indicador.tendencia }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Detalle -->
      <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ indicadorSeleccionado?.nombre }}</h2>
            <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-xl">✕</button>
          </div>
          
          <div v-if="indicadorSeleccionado" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-900 dark:text-white">Descripción</label>
                  <p class="text-gray-600 dark:text-gray-300">{{ indicadorSeleccionado.descripcion }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-900 dark:text-white">Categoría</label>
                  <p class="text-gray-600 dark:text-gray-300">{{ indicadorSeleccionado.categoria }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-900 dark:text-white">Última Actualización</label>
                  <p class="text-gray-600 dark:text-gray-300">{{ formatDate(indicadorSeleccionado.fecha_actualizacion) }}</p>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-center">
                  <div class="w-6 h-6 rounded-full mx-auto mb-2" :class="getSemaforoClass(indicadorSeleccionado.estado_semaforo)"></div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ indicadorSeleccionado.valor_actual }} {{ indicadorSeleccionado.unidad }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Valor Actual</p>
                </div>
                
                <div class="text-center">
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">Meta: {{ indicadorSeleccionado.meta }} {{ indicadorSeleccionado.unidad }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Cumplimiento: {{ Math.round(indicadorSeleccionado.cumplimiento) }}%</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Evolución Histórica</h3>
              <div class="h-64 flex items-center justify-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                📊 Gráfico histórico del indicador
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Crear/Editar -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ showCreateModal ? 'Nuevo Indicador' : 'Editar Indicador' }}</h2>
            <button @click="cerrarModales" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-xl">✕</button>
          </div>
          
          <form @submit.prevent="guardarIndicador" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Nombre</label>
                <input v-model="formulario.nombre" type="text" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Descripción</label>
              <textarea v-model="formulario.descripcion" rows="3" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Valor Actual</label>
                <input v-model.number="formulario.valor_actual" type="number" step="0.01" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Meta</label>
                <input v-model.number="formulario.meta" type="number" step="0.01" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Unidad</label>
                <input v-model="formulario.unidad" type="text" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Categoría</label>
                <select v-model="formulario.categoria" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="">Seleccionar</option>
                  <option value="Académico">Académico</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Calidad">Calidad</option>
                  <option value="Innovación">Innovación</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Tendencia</label>
                <select v-model="formulario.tendencia" required class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="">Seleccionar</option>
                  <option value="ascendente">Ascendente</option>
                  <option value="estable">Estable</option>
                  <option value="descendente">Descendente</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6">
              <button type="button" @click="cerrarModales" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors">Cancelar</button>
              <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {{ showCreateModal ? 'Crear' : 'Actualizar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";

export default {
  name: 'IndicadoresEstrategicos',
  data() {
    return {
      userRole: 'directivos', // se actualiza al montar según el token
      indicadores: [],
      resumen: null,
      showDetailModal: false,
      showCreateModal: false,
      showEditModal: false,
      indicadorSeleccionado: null,
      filtroCategoria: '',
      filtroEstado: '',
      filtroPeriodo: 'actual',
      loading: false,
      error: null,
      formulario: {
        nombre: '',
        descripcion: '',
        valor_actual: 0,
        meta: 0,
        unidad: '',
        categoria: '',
        tendencia: ''
      },
      mockData: [] // puedes poner indicadores de prueba aquí
    }
  },
  computed: {
    canEdit() {
      return this.userRole === 'planeacion' || this.userRole === 'superadmin';
    },
    categoriasDisponibles() {
      return [...new Set(this.indicadores.map(ind => ind.categoria).filter(Boolean))];
    },
    indicadoresFiltrados() {
      return this.indicadores.filter(ind => {
        const categoriaMatch = !this.filtroCategoria || ind.categoria === this.filtroCategoria;
        const estadoMatch = !this.filtroEstado || ind.estado_semaforo === this.filtroEstado;
        const periodoMatch = this.filtroPeriodo === 'actual' || ind.periodo === this.filtroPeriodo;
        return categoriaMatch && estadoMatch && periodoMatch;
      });
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
  },
  methods: {
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
    },
    getTendenciaClass(tendencia) {
      return {
        'ascendente': 'text-green-600',
        'estable': 'text-yellow-600',
        'descendente': 'text-red-600'
      }[tendencia] || 'text-gray-600';
    },
    getTendenciaIcon(tendencia) {
      return {
        'ascendente': '📈',
        'descendente': '📉',
        'estable': '➡️'
      }[tendencia] || '➡️';
    },
      formatDate(fecha) {
    if (!fecha) return "—";
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      console.warn("Error al formatear fecha:", fecha, e);
      return fecha;
    }
  },

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
        this.resumen = resumenResponse.ok ? await resumenResponse.json() : this.generateMockResumen();
      } catch (err) {
        console.warn("Fallo API, usando mock:", err.message);
        this.useMockData();
      } finally {
        this.loading = false;
      }
    },

    useMockData() {
      this.indicadores = [...this.mockData];
      this.generateMockResumen();
    },

    generateMockResumen() {
      const data = this.indicadores;
      this.resumen = {
        total_indicadores: data.length,
        verde: data.filter(ind => ind.estado_semaforo === 'verde').length,
        amarillo: data.filter(ind => ind.estado_semaforo === 'amarillo').length,
        rojo: data.filter(ind => ind.estado_semaforo === 'rojo').length,
        cumplimiento_general: data.length ? data.reduce((a, ind) => a + ind.cumplimiento, 0) / data.length : 0
      };
    },

    verDetalle(ind) {
      this.indicadorSeleccionado = ind;
      this.showDetailModal = true;
    },
    editarIndicador(ind) {
      this.formulario = { ...ind };
      this.showEditModal = true;
    },

    async eliminarIndicador(id) {
      if (!confirm('¿Seguro que desea eliminar este indicador?')) return;

      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const token = localStorage.getItem('access_token');
      try {
        if (!token) throw new Error("No token");

        const res = await fetch(`${baseUrl}/indicators/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al eliminar");

        await this.cargarDatos();
      } catch (err) {
        console.warn("Error eliminando, borrando local:", err.message);
        this.indicadores = this.indicadores.filter(ind => ind.id !== id);
        this.generateMockResumen();
      }
    },

    async guardarIndicador() {
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const token = localStorage.getItem('access_token');
      const method = this.showCreateModal ? 'POST' : 'PUT';
      const url = `${baseUrl}/indicators/`

      try {
        if (!token) throw new Error("No token");

        const res = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formulario)
        });

        if (!res.ok) throw new Error("Error al guardar");

        await this.cargarDatos();
        this.cerrarModales();
      } catch (err) {
        console.warn("Guardando local:", err.message);
        this.saveToLocalStorage();
      }
    },

    saveToLocalStorage() {
      const calc = (val, meta) => {
        const c = (val / meta) * 100;
        return c >= 100 ? 'verde' : c >= 70 ? 'amarillo' : 'rojo';
      };

      if (this.showCreateModal) {
        this.indicadores.push({
          ...this.formulario,
          estado_semaforo: calc(this.formulario.valor_actual, this.formulario.meta),
          cumplimiento: (this.formulario.valor_actual / this.formulario.meta) * 100,
          fecha_actualizacion: new Date().toISOString()
        });
      } else {
        const i = this.indicadores.findIndex(ind => ind.id === this.formulario.id);
        if (i !== -1) {
          this.indicadores[i] = {
            ...this.formulario,
            estado_semaforo: calc(this.formulario.valor_actual, this.formulario.meta),
            cumplimiento: (this.formulario.valor_actual / this.formulario.meta) * 100,
            fecha_actualizacion: new Date().toISOString()
          };
        }
      }
      this.generateMockResumen();
      this.cerrarModales();
    },

    async exportData() {
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const token = localStorage.getItem('access_token');

      try {
        if (!token) throw new Error("No token");

        const res = await fetch(`${baseUrl}/indicators/export?format=excel`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error exportando");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'indicadores_estrategicos.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn("Fallo exportación, usando CSV:", err.message);
        this.exportToCSV();
      }
    },

    exportToCSV() {
      const headers = ['ID','Nombre','Descripción','Valor Actual','Meta','Unidad','Categoría','Estado','Cumplimiento'];
      const csv = [
        headers.join(','),
        ...this.indicadores.map(ind => [
          ind.id, `"${ind.nombre}"`, `"${ind.descripcion}"`,
          ind.valor_actual, ind.meta, ind.unidad,
          ind.categoria, ind.estado_semaforo,
          Math.round(ind.cumplimiento)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'indicadores_estrategicos.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    cerrarModales() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.formulario = {
        nombre: '',
        descripcion: '',
        valor_actual: 0,
        meta: 0,
        unidad: '',
        categoria: '',
        tendencia: ''
      };
    }
  }
}
</script>