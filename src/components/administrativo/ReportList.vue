<script setup>
import { onMounted, computed, ref } from 'vue'
import { useReports } from '../../composables/useReports'

const {
  reportes,
  listarMisReportes,
  descargarReporte,
  loading,
  error
} = useReports()

const tabActiva = ref('todos')
const filtroEstado = ref('')
const paginaActual = ref(1)
const reportesPorPagina = ref(10) // Puedes ajustar este número según necesites

// Definir los tabs disponibles
const tabs = [
  { id: 'todos', label: 'Todos', icon: 'fas fa-th-large' },
  { id: 'indicadores', label: 'Indicadores', icon: 'fas fa-chart-bar' },
  { id: 'prospectiva', label: 'Prospectiva', icon: 'fas fa-crystal-ball' },
  { id: 'oferta_educativa', label: 'Oferta Educativa', icon: 'fas fa-graduation-cap' },
  { id: 'consolidado', label: 'Consolidado', icon: 'fas fa-file-alt' }
]

// Contar reportes por tipo
const contadoresPorTipo = computed(() => {
  const contadores = {
    todos: reportes.value.length,
    indicadores: 0,
    prospectiva: 0,
    oferta_educativa: 0,
    consolidado: 0
  }
  
  reportes.value.forEach(reporte => {
    if (contadores[reporte.tipo] !== undefined) {
      contadores[reporte.tipo]++
    }
  })
  
  return contadores
})

// Filtrar reportes según tab activa y estado
const reportesFiltrados = computed(() => {
  return reportes.value.filter(reporte => {
    const coincideTipo = tabActiva.value === 'todos' || reporte.tipo === tabActiva.value
    const coincideEstado = !filtroEstado.value || reporte.estado === filtroEstado.value
    return coincideTipo && coincideEstado
  })
})

// Calcular total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(reportesFiltrados.value.length / reportesPorPagina.value)
})

// Reportes paginados
const reportesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * reportesPorPagina.value
  const fin = inicio + reportesPorPagina.value
  return reportesFiltrados.value.slice(inicio, fin)
})

// Generar array de números de página para mostrar
const numerosPaginas = computed(() => {
  const paginas = []
  const total = totalPaginas.value
  const actual = paginaActual.value
  
  // Lógica para mostrar máximo 7 páginas con puntos suspensivos
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      paginas.push(i)
    }
  } else {
    if (actual <= 4) {
      for (let i = 1; i <= 5; i++) {
        paginas.push(i)
      }
      paginas.push('...')
      paginas.push(total)
    } else if (actual >= total - 3) {
      paginas.push(1)
      paginas.push('...')
      for (let i = total - 4; i <= total; i++) {
        paginas.push(i)
      }
    } else {
      paginas.push(1)
      paginas.push('...')
      for (let i = actual - 1; i <= actual + 1; i++) {
        paginas.push(i)
      }
      paginas.push('...')
      paginas.push(total)
    }
  }
  
  return paginas
})

// Agrupar reportes por estado para mostrar estadísticas
const estadisticas = computed(() => {
  const stats = {
    completado: 0,
    generando: 0,
    error: 0
  }
  
  reportesFiltrados.value.forEach(reporte => {
    if (stats[reporte.estado] !== undefined) {
      stats[reporte.estado]++
    }
  })
  
  return stats
})

const cambiarTab = (tabId) => {
  tabActiva.value = tabId
  filtroEstado.value = '' // Resetear filtro de estado al cambiar de tab
  paginaActual.value = 1 // Resetear a primera página
}

const cambiarPagina = (pagina) => {
  if (pagina === '...' || pagina === paginaActual.value) return
  if (pagina < 1 || pagina > totalPaginas.value) return
  paginaActual.value = pagina
}

const paginaAnterior = () => {
  if (paginaActual.value > 1) {
    paginaActual.value--
  }
}

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) {
    paginaActual.value++
  }
}

const cargarReportes = async () => {
  try {
    await listarMisReportes()
  } catch (err) {
    console.error('Error cargando reportes:', err)
  }
}

const formatearFecha = (fechaStr) => {
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearTamaño = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb > 1024
    ? `${(kb / 1024).toFixed(2)} MB`
    : `${kb.toFixed(1)} KB`
}

const obtenerNombreTipo = (tipo) => {
  const nombres = {
    indicadores: 'Reporte de Indicadores',
    prospectiva: 'Reporte de Prospectiva',
    oferta_educativa: 'Oferta Educativa',
    consolidado: 'Consolidado'
  }
  return nombres[tipo] || tipo
}

const obtenerIconoTipo = (tipo) => {
  const iconos = {
    indicadores: 'fas fa-chart-bar',
    prospectiva: 'fas fa-crystal-ball',
    oferta_educativa: 'fas fa-graduation-cap',
    consolidado: 'fas fa-file-alt'
  }
  return iconos[tipo] || 'fas fa-file'
}

// Agregar estado de descarga
const descargandoReportes = ref(new Set()) // Para trackear qué reportes se están descargando

// Función de descarga mejorada
const descargarReporteId = async (reporte) => {
  try {
    // Agregar el reporte al set de descargas en progreso
    descargandoReportes.value.add(reporte.id)
    
    console.log('Iniciando descarga del reporte:', reporte.id)
    
    // Llamar al método de descarga y esperar su resultado
    await descargarReporte(reporte.id)
    
    console.log('Descarga completada para reporte:', reporte.id)
    
    // Aquí podrías mostrar un mensaje de éxito si lo deseas
    // Por ejemplo, usando una librería de notificaciones
    
  } catch (error) {
    console.error('Error al descargar el reporte:', error)
    
    // Aquí podrías mostrar un mensaje de error al usuario
    alert(`Error al descargar el reporte #${reporte.id}: ${error.message}`)
    
  } finally {
    // Remover el reporte del set de descargas en progreso
    descargandoReportes.value.delete(reporte.id)
  }
}

// Función helper para verificar si un reporte se está descargando
const estaDescargando = (reporteId) => {
  return descargandoReportes.value.has(reporteId)
}

const verReporte = (reporte) => {
  // Implementar lógica para ver detalles
  console.log('Ver reporte:', reporte.id)
}

const eliminarReporte = (reporte) => {
  // Implementar lógica de eliminación con confirmación
  if (confirm(`¿Estás seguro de eliminar el reporte #${reporte.id}?`)) {
    console.log('Eliminando reporte:', reporte.id)
  }
}

onMounted(async () => {
  await cargarReportes()
})
</script>

<template>
  <div class="lista-reportes">
    <!-- Header Principal -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <i class="fas fa-folder-open title-icon"></i>
          <h2 class="section-title">Mis Reportes</h2>
        </div>
        <button @click="cargarReportes" class="btn-refresh" :disabled="loading">
          <i :class="['fas fa-sync-alt', { 'rotating': loading }]"></i>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="stats-section" v-if="reportes.length > 0">
      <div class="stat-card">
        <div class="stat-icon completado">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.completado }}</span>
          <span class="stat-label">Completados</span>
        </div>
      </div>
      <!-- <div class="stat-card">
        <div class="stat-icon generando">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.generando }}</span>
          <span class="stat-label">Generando</span>
        </div>
      </div> -->
      <div class="stat-card">
        <div class="stat-icon error">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.error }}</span>
          <span class="stat-label">Con Error</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ reportesFiltrados.length }}</span>
          <span class="stat-label">Total en Vista</span>
        </div>
      </div>
    </div>

    <!-- Tabs de Navegación -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="cambiarTab(tab.id)"
          :class="['tab-button', { active: tabActiva === tab.id }]"
        >
          <i :class="tab.icon"></i>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count">{{ contadoresPorTipo[tab.id] }}</span>
        </button>
      </div>

      <!-- Filtro de Estado -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-filter"></i>
            Filtrar por estado:
          </label>
          <div class="filter-buttons">
            <button 
              @click="filtroEstado = ''"
              :class="['filter-btn', { active: !filtroEstado }]"
            >
              Todos
            </button>
            <button 
              @click="filtroEstado = 'completado'"
              :class="['filter-btn', 'success', { active: filtroEstado === 'completado' }]"
            >
              <i class="fas fa-check"></i>
              Completados
            </button>
            <button 
              @click="filtroEstado = 'generando'"
              :class="['filter-btn', 'warning', { active: filtroEstado === 'generando' }]"
            >
              <i class="fas fa-clock"></i>
              Generando
            </button>
            <button 
              @click="filtroEstado = 'error'"
              :class="['filter-btn', 'danger', { active: filtroEstado === 'error' }]"
            >
              <i class="fas fa-times"></i>
              Error
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && reportes.length === 0" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
      </div>
      <h3>Cargando reportes...</h3>
      <p>Por favor espera mientras obtenemos tus reportes</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="reportesFiltrados.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-folder-open"></i>
      </div>
      <h3>No hay reportes disponibles</h3>
      <p v-if="filtroEstado">
        No se encontraron reportes con el estado "{{ filtroEstado }}"
      </p>
      <p v-else-if="tabActiva !== 'todos'">
        No tienes reportes de tipo "{{ tabs.find(t => t.id === tabActiva)?.label }}"
      </p>
      <p v-else>
        Aún no tienes reportes generados
      </p>
    </div>

    <!-- Lista de Reportes -->
    <div v-else class="reportes-grid">
      <div 
        v-for="reporte in reportesPaginados" 
        :key="reporte.id"
        class="reporte-card"
      >
        <!-- Header de la card -->
        <div class="card-header">
          <div class="tipo-info">
            <div class="tipo-icon">
              <i :class="obtenerIconoTipo(reporte.tipo)"></i>
            </div>
            <div class="tipo-text">
              <h3 class="reporte-titulo">{{ obtenerNombreTipo(reporte.tipo) }}</h3>
              <span class="reporte-id">ID #{{ reporte.id }}</span>
            </div>
          </div>
          <div class="estado-container">
            <span :class="['estado-badge', reporte.estado]">
              <i :class="{
                'fas fa-check-circle': reporte.estado === 'completado',
                'fas fa-clock': reporte.estado === 'generando',
                'fas fa-exclamation-circle': reporte.estado === 'error'
              }"></i>
              {{ reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1) }}
            </span>
          </div>
        </div>

        <!-- Información principal -->
        <div class="card-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="info-content">
                <span class="info-label">Generado</span>
                <span class="info-value">{{ formatearFecha(reporte.fecha_generacion) }}</span>
              </div>
            </div>
            
            <div class="info-item" v-if="reporte.tamaño_archivo">
              <div class="info-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="info-content">
                <span class="info-label">Tamaño</span>
                <span class="info-value">{{ formatearTamaño(reporte.tamaño_archivo) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parámetros del reporte -->
        <div v-if="reporte.parametros" class="card-parametros">
          <div class="parametros-content">
            <div class="parametro-chip" v-if="reporte.parametros.fecha_inicio">
              <i class="fas fa-calendar-week"></i>
              <span>
                {{ formatearFecha(reporte.parametros.fecha_inicio) }} - 
                {{ formatearFecha(reporte.parametros.fecha_fin) }}
              </span>
            </div>
            <div class="parametro-chip" v-if="reporte.parametros.indicadores_seleccionados?.length">
              <i class="fas fa-list"></i>
              <span>{{ reporte.parametros.indicadores_seleccionados.length }} indicadores</span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="card-actions">
          <button 
            class="action-btn primary" 
            v-if="reporte.estado === 'completado'"
            @click="descargarReporteId(reporte)"
            :disabled="estaDescargando(reporte.id)"
            :title="estaDescargando(reporte.id) ? 'Descargando...' : 'Descargar reporte'"
          >
            <!-- Mostrar spinner si se está descargando -->
            <i v-if="estaDescargando(reporte.id)" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-download"></i>
            
            <!-- Cambiar texto según el estado -->
            <span>{{ estaDescargando(reporte.id) ? 'Descargando...' : 'Descargar' }}</span>
          </button>
          <button 
            class="action-btn secondary" 
            @click="verReporte(reporte)"
            title="Ver detalles"
          >
            <i class="fas fa-eye"></i>
            Ver
          </button>
          <button 
            class="action-btn danger" 
            @click="eliminarReporte(reporte)"
            title="Eliminar reporte"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="reportesFiltrados.length > 0 && totalPaginas > 1" class="paginacion-container">
      <div class="paginacion">
        <!-- Botón Anterior -->
        <button 
          @click="paginaAnterior"
          :disabled="paginaActual === 1"
          class="btn-paginacion anterior"
        >
          <i class="fas fa-chevron-left"></i>
          Anterior
        </button>

        <!-- Números de página -->
        <div class="numeros-pagina">
          <button 
            v-for="(pagina, index) in numerosPaginas" 
            :key="index"
            @click="cambiarPagina(pagina)"
            :class="['btn-numero', { 
              active: pagina === paginaActual,
              dots: pagina === '...'
            }]"
            :disabled="pagina === '...'"
          >
            {{ pagina }}
          </button>
        </div>

        <!-- Botón Siguiente -->
        <button 
          @click="paginaSiguiente"
          :disabled="paginaActual === totalPaginas"
          class="btn-paginacion siguiente"
        >
          Siguiente
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <!-- Información de paginación -->
      <div class="paginacion-info">
        Mostrando {{ (paginaActual - 1) * reportesPorPagina + 1 }} - 
        {{ Math.min(paginaActual * reportesPorPagina, reportesFiltrados.length) }} 
        de {{ reportesFiltrados.length }} reportes
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS */
.lista-reportes {
  --primary-color: #00af00;
  --primary-hover: #008f00;
  --primary-light: #e6f7e6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.lista-reportes {
  padding: 2rem;
  background: linear-gradient(135deg, var(--gray-50) 0%, #ffffff 100%);
  min-height: 100vh;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid var(--gray-200);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-refresh:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Estadísticas Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.completado {
  background: rgb(16 185 129 / 0.1);
  color: var(--success-color);
}

.stat-icon.generando {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning-color);
}

.stat-icon.error {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger-color);
}

.stat-icon.total {
  background: var(--primary-light);
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Tabs Container */
.tabs-container {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  background: var(--gray-50);
  color: var(--gray-900);
}

.tab-button.active {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-label {
  font-size: 0.875rem;
}

.tab-count {
  background: var(--gray-200);
  color: var(--gray-700);
  padding: 0.125rem 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tab-button.active .tab-count {
  background: var(--primary-color);
  color: white;
}

/* Filter Bar */
.filter-bar {
  padding-top: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 50px;
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.filter-btn.active {
  background: var(--gray-900);
  border-color: var(--gray-900);
  color: white;
}

.filter-btn.success.active {
  background: var(--success-color);
  border-color: var(--success-color);
}

.filter-btn.warning.active {
  background: var(--warning-color);
  border-color: var(--warning-color);
}

.filter-btn.danger.active {
  background: var(--danger-color);
  border-color: var(--danger-color);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner-ring {
  width: 60px;
  height: 60px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state h3 {
  color: var(--gray-900);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.loading-state p {
  color: var(--gray-600);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: var(--gray-900);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-600);
}

/* Reportes Grid */
.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.reporte-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.reporte-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--gray-100);
}

.tipo-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tipo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.tipo-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.reporte-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.reporte-id {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
}

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.completado {
  background: rgb(16 185 129 / 0.1);
  color: var(--success-color);
}

.estado-badge.generando {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning-color);
}

.estado-badge.error {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger-color);
}

/* Card Info */
.card-info {
  padding: 1rem 1.25rem;
  flex: 1;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-icon {
  width: 1.75rem;
  height: 1.75rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  font-size: 0.75rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.813rem;
  color: var(--gray-900);
  font-weight: 500;
}

/* Card Parámetros */
.card-parametros {
  padding: 0.75rem 1.25rem;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-100);
}

.parametros-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.parametro-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: white;
  padding: 0.375rem 0.625rem;
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--gray-100);
  background: var(--gray-50);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--border-radius);
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
  flex: 1;
}

.action-btn.primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: var(--gray-700);
  border-color: var(--gray-200);
}

.action-btn.secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.action-btn.danger {
  background: white;
  color: var(--danger-color);
  border-color: var(--gray-200);
}

.action-btn.danger:hover {
  background: rgb(239 68 68 / 0.05);
  border-color: var(--danger-color);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .reportes-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .lista-reportes {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .title-group {
    justify-content: center;
  }
  
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tabs-nav {
    overflow-x: scroll;
    scrollbar-width: thin;
  }
  
  .tabs-nav::-webkit-scrollbar {
    height: 4px;
  }
  
  .tabs-nav::-webkit-scrollbar-track {
    background: var(--gray-100);
  }
  
  .tabs-nav::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 2px;
  }
  
  .reportes-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .estado-container {
    display: flex;
    justify-content: center;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    justify-content: center;
  }
}

/* Animaciones adicionales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reporte-card {
  animation: fadeIn 0.3s ease;
}

.reporte-card:nth-child(1) { animation-delay: 0.05s; }
.reporte-card:nth-child(2) { animation-delay: 0.1s; }
.reporte-card:nth-child(3) { animation-delay: 0.15s; }
.reporte-card:nth-child(4) { animation-delay: 0.2s; }
.reporte-card:nth-child(5) { animation-delay: 0.25s; }
.reporte-card:nth-child(6) { animation-delay: 0.3s; }

/* Scrollbar personalizada para el contenedor principal */
.reportes-grid {
  overflow-y: visible; /* Cambiado para usar paginación en lugar de scroll */
  padding-right: 0;
}

/* Indicador de tab activa con línea */
.tab-button::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.tab-button.active::after {
  width: 80%;
}

/* Tooltip para acciones */
.action-btn {
  position: relative;
}

.action-btn::before {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 0.75rem;
  background: var(--gray-900);
  color: white;
  font-size: 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
  margin-bottom: 0.5rem;
}

.action-btn:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}

/* Mejoras de accesibilidad */
.tab-button:focus-visible,
.filter-btn:focus-visible,
.action-btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Badge de nuevo reporte */
.reporte-card.nuevo {
  position: relative;
}

.reporte-card.nuevo::before {
  content: 'NUEVO';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 10;
}

/* Estilos de Paginación */
.paginacion-container {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.paginacion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}

.btn-paginacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  color: var(--gray-700);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-paginacion:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--gray-50);
}

.numeros-pagina {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-numero {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  color: var(--gray-700);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-numero:hover:not(:disabled):not(.active) {
  background: var(--gray-50);
  border-color: var(--gray-300);
  transform: translateY(-1px);
}

.btn-numero.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-numero.dots {
  cursor: default;
  border: none;
  background: transparent;
  color: var(--gray-400);
}

.btn-numero.dots:hover {
  transform: none;
  background: transparent;
}

.paginacion-info {
  font-size: 0.875rem;
  color: var(--gray-600);
  text-align: center;
}

/* Responsive para paginación */
@media (max-width: 640px) {
  .paginacion {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .btn-paginacion.anterior,
  .btn-paginacion.siguiente {
    flex: 1;
    justify-content: center;
  }
  
  .numeros-pagina {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .btn-numero {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
  
  .btn-paginacion {
    padding: 0.375rem 0.75rem;
    font-size: 0.813rem;
  }
}
</style>