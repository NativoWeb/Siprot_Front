<script setup>
import { onMounted, computed, ref } from 'vue'
import { useReports } from '../../composables/useReports'

const {
  reportes,
  listarMisReportes,
  loading,
  error
} = useReports()

const filtroTipo = ref('')
const filtroEstado = ref('')

const reportesFiltrados = computed(() => {
  return reportes.value.filter(reporte => {
    const coincideTipo = !filtroTipo.value || reporte.tipo === filtroTipo.value
    const coincideEstado = !filtroEstado.value || reporte.estado === filtroEstado.value
    return coincideTipo && coincideEstado
  })
})

const aplicarFiltros = () => {
  // Computed ya se encarga
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

onMounted(async () => {
  await cargarReportes()
})
</script>

<template>
  <div class="lista-reportes">
    <!-- Header mejorado -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <i class="fas fa-folder-open title-icon"></i>
          <h2 class="section-title">Mis Reportes</h2>
          <span class="reportes-count" v-if="reportes.length">
            {{ reportesFiltrados.length }} de {{ reportes.length }}
          </span>
        </div>
        <button @click="cargarReportes" class="btn-refresh" :disabled="loading">
          <i :class="['fas fa-sync-alt', { 'rotating': loading }]"></i>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Filtros mejorados -->
    <div class="filtros-section">
      <div class="filtros-container">
        <div class="filtro-item">
          <label class="filtro-label">
            <i class="fas fa-filter"></i>
            Tipo de Reporte
          </label>
          <div class="select-wrapper">
            <select v-model="filtroTipo" @change="aplicarFiltros" class="filtro-select">
              <option value="">Todos los tipos</option>
              <option value="indicadores">📊 Indicadores</option>
              <option value="prospectiva">🔮 Prospectiva</option>
              <option value="oferta_educativa">🎓 Oferta Educativa</option>
              <option value="consolidado">📋 Consolidado</option>
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
          </div>
        </div>
        
        <div class="filtro-item">
          <label class="filtro-label">
            <i class="fas fa-traffic-light"></i>
            Estado
          </label>
          <div class="select-wrapper">
            <select v-model="filtroEstado" @change="aplicarFiltros" class="filtro-select">
              <option value="">Todos los estados</option>
              <option value="generando">⏳ Generando</option>
              <option value="completado">✅ Completado</option>
              <option value="error">❌ Error</option>
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading mejorado -->
    <div v-if="loading && reportes.length === 0" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
      </div>
      <h3>Cargando reportes...</h3>
      <p>Por favor espera mientras obtenemos tus reportes</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="reportesFiltrados.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-folder-open"></i>
      </div>
      <h3>No hay reportes disponibles</h3>
      <p v-if="filtroTipo || filtroEstado">
        No se encontraron reportes con los filtros aplicados
      </p>
      <p v-else>
        Aún no tienes reportes generados
      </p>
    </div>

    <!-- Lista de reportes mejorada -->
    <div v-else class="reportes-grid">
      <div 
        v-for="reporte in reportesFiltrados" 
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
                'fas fa-clock': reporte.estado === 'generando',
                'fas fa-check-circle': reporte.estado === 'completado',
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
            
            <div class="info-item" v-if="reporte.updated_at">
              <div class="info-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="info-content">
                <span class="info-label">Actualizado</span>
                <span class="info-value">{{ formatearFecha(reporte.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parámetros del reporte -->
        <div v-if="reporte.parametros" class="card-parametros">
          <h4 class="parametros-title">
            <i class="fas fa-cog"></i>
            Parámetros
          </h4>
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
            title="Descargar reporte"
          >
            <i class="fas fa-download"></i>
            Descargar
          </button>
          <button 
            class="action-btn secondary" 
            title="Ver detalles"
          >
            <i class="fas fa-eye"></i>
            Ver
          </button>
          <button 
            class="action-btn danger" 
            title="Eliminar reporte"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS */
.lista-reportes {
  --primary-color: #00af00;
  --primary-hover: #2563eb;
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

.reportes-count {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
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

/* Filtros Section */
.filtros-section {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}

.filtros-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.select-wrapper {
  position: relative;
}

.filtro-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  background: white;
  font-size: 0.875rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
}

.filtro-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.reporte-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
  overflow: hidden;
  transition: all 0.2s ease;
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
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.tipo-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tipo-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.tipo-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reporte-titulo {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.reporte-id {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
}

.estado-container {
  display: flex;
  align-items: center;
}

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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
  padding: 1rem 1.5rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  width: 2rem;
  height: 2rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  font-size: 0.875rem;
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
  font-size: 0.875rem;
  color: var(--gray-900);
  font-weight: 500;
}

/* Card Parámetros */
.card-parametros {
  padding: 1rem 1.5rem;
  background: var(--gray-50);
}

.parametros-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.parametros-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.parametro-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  background: var(--gray-50);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
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
  
  .reportes-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>