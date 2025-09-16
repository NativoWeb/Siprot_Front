<template>
  <div v-if="isVisible" class="modal-overlay" @click="cerrarModal">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <div class="modal-title">
          <i class="fas fa-file-pdf"></i>
          <h3>{{ tituloReporte }}</h3>
          <!-- Información adicional del reporte para cumplir R6.3 -->
          <div class="reporte-meta" v-if="reporte">
            <span class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ formatearFecha(reporte.fecha_generacion) }}
            </span>
            <span class="meta-item" v-if="reporte.tamaño_archivo">
              <i class="fas fa-file"></i>
              {{ formatearTamaño(reporte.tamaño_archivo) }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button 
            @click="descargarPDF" 
            class="btn-download"
            :disabled="loading"
            title="Descargar PDF"
          >
            <i class="fas fa-download"></i>
          </button>
          <button 
            @click="cerrarModal" 
            class="btn-close"
            title="Cerrar"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Contenido del Modal -->
      <div class="modal-body">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Cargando reporte...</p>
          <div class="loading-details">
            <small>Aplicando plantilla institucional SENA...</small>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h4>Error al cargar el reporte</h4>
          <p>{{ error }}</p>
          <button @click="recargarPDF" class="btn-retry">
            <i class="fas fa-redo"></i>
            Intentar de nuevo
          </button>
        </div>

        <!-- PDF Viewer -->
        <div v-else-if="pdfUrl" class="pdf-container">
          <iframe
            :src="pdfUrl"
            class="pdf-viewer"
            frameborder="0"
            title="Visor de PDF - Reporte Estratégico SENA"
          ></iframe>
          
          <!-- Información de plantilla SENA para cumplir R6.8 -->
          <div class="pdf-info">
            <div class="template-info">
              <i class="fas fa-palette"></i>
              <span>Plantilla institucional SENA aplicada</span>
            </div>
          </div>
        </div>

        <!-- No PDF State -->
        <div v-else class="no-pdf-container">
          <div class="no-pdf-icon">
            <i class="fas fa-file-pdf"></i>
          </div>
          <h4>No se pudo cargar el PDF</h4>
          <p>El archivo no está disponible o ha ocurrido un error.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  reporte: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  pdfUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'descargar', 'recargar'])

const tituloReporte = computed(() => {
  if (!props.reporte) return 'Reporte'
  
  const nombres = {
    indicadores: 'Reporte de Indicadores Clave',
    prospectiva: 'Informe de Prospectiva Anual',
    oferta_educativa: 'Análisis de Oferta Educativa',
    consolidado: 'Reporte Consolidado Integral'
  }
  
  return `${nombres[props.reporte.tipo] || 'Reporte'} #${props.reporte.id}`
})

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

const cerrarModal = () => {
  emit('close')
}

const descargarPDF = () => {
  if (props.reporte) {
    emit('descargar', props.reporte)
  }
}

const recargarPDF = () => {
  if (props.reporte) {
    emit('recargar', props.reporte)
  }
}

// ... existing code for watchers and event handlers ...
</script>

<style scoped>
/* ... existing styles ... */

/* Estilos adicionales para información del reporte */
.reporte-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.loading-details {
  margin-top: 1rem;
  color: #6b7280;
}

.pdf-info {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.template-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #00af00;
  font-weight: 500;
}

.template-info i {
  color: #00af00;
}

@media (max-width: 768px) {
  .reporte-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .pdf-info {
    position: static;
    margin-top: 1rem;
  }
}
</style>
