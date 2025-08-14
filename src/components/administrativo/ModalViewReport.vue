<template>
  <div v-if="isVisible" class="modal-overlay" @click="cerrarModal">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <div class="modal-title">
          <i class="fas fa-file-pdf"></i>
          <h3>{{ tituloReporte }}</h3>
        </div>
        <div class="modal-actions">
          <button 
            @click="descargarPDF" 
            class="btn-download"
            :disabled="loading"
            title="Descargar PDF"
          >
            <i class="fas fa-download"></i>
            <p>⭳</p>
          </button>
          <button 
            @click="cerrarModal" 
            class="btn-close"
            title="Cerrar"
          >
            <i class="fas fa-times"></i>
            <p>X</p>
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
            title="Visor de PDF"
          ></iframe>
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
    indicadores: 'Reporte de Indicadores',
    prospectiva: 'Reporte de Prospectiva',
    oferta_educativa: 'Análisis de Oferta Educativa',
    consolidado: 'Reporte Consolidado'
  }
  
  return `${nombres[props.reporte.tipo] || 'Reporte'} #${props.reporte.id}`
})

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

// Limpiar URL cuando se cierra el modal
watch(() => props.isVisible, (newValue) => {
  if (!newValue && props.pdfUrl) {
    // Limpiar la URL del blob cuando se cierre el modal
    window.URL.revokeObjectURL(props.pdfUrl)
  }
})

// Manejar tecla Escape
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    cerrarModal()
  }
}

// Agregar/remover event listener para ESC
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden' // Prevenir scroll del body
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'auto' // Restaurar scroll del body
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 95vw;
  max-height: 95vh;
  width: 1200px;
  height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title i {
  font-size: 1.5rem;
  color: #dc2626;
}

.modal-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-download,
.btn-close {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-download p {
    color: white;
}

.btn-close p {
    color: black;
    font-weight: bold;
}

.btn-download {
  background: #00af00;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background: #008f00;
  transform: translateY(-1px);
}

.btn-download:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-close {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.pdf-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-container,
.error-container,
.no-pdf-container {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #00af00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #dc2626;
}

.error-icon,
.no-pdf-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.error-container h4,
.no-pdf-container h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-container p,
.no-pdf-container p {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #00af00;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-retry:hover {
  background: #008f00;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modal-container {
    width: 95vw;
    height: 90vh;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
    max-height: none;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-title h3 {
    font-size: 1.125rem;
  }
  
  .loading-container,
  .error-container,
  .no-pdf-container {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .modal-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .modal-title h3 {
    font-size: 1rem;
  }
  
  .btn-download,
  .btn-close {
    width: 2rem;
    height: 2rem;
  }
}
</style>