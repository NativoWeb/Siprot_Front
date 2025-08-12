<template>
  <div class="generar-reporte">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-group">
            <i class="fas fa-plus-circle title-icon"></i>
            <h2 class="section-title">Generar Nuevo Reporte</h2>
          </div>
        </div>
      </div>

    <div class="page-container">
      <form @submit.prevent="generarNuevoReporte" class="form-container">
        <!-- Selección de tipo de reporte -->
        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-file-alt"></i>
              Tipo de Reporte
            </h3>
            <span class="required-badge">Requerido</span>
          </div>
          
          <div class="tipos-grid">
            <div 
              v-for="tipo in tiposReporte" 
              :key="tipo.tipo"
              @click="seleccionarTipo(tipo.tipo)"
              :class="['tipo-card', { selected: formData.tipo === tipo.tipo }]"
            >
              <div class="card-header-simple">
                <h4 class="tipo-nombre">{{ tipo.nombre }}</h4>
                <span class="tiempo-badge">{{ tipo.tiempo_estimado }}</span>
              </div>
              <p class="tipo-descripcion">{{ tipo.descripcion }}</p>
              <div class="opciones-container">
                <span 
                  v-for="opcion in tipo.opciones_disponibles" 
                  :key="opcion"
                  class="opcion-chip"
                >
                  {{ opcion }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración específica por tipo -->
        <div v-if="formData.tipo" class="section-card configuracion-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-cogs"></i>
              Configuración del Reporte
            </h3>
          </div>
          
          <!-- Selección de indicadores (para reportes de indicadores) -->
          <div v-if="formData.tipo === 'indicadores'" class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-list-check"></i>
                Indicadores a Incluir
              </label>
              <span class="selection-count" v-if="formData.parametros.indicadores_seleccionados.length">
                {{ formData.parametros.indicadores_seleccionados.length }} seleccionados
              </span>
            </div>
            <div class="indicadores-selector">
              <div 
                v-for="indicador in indicadores" 
                :key="indicador.id"
                class="indicador-item"
              >
                <div class="indicador-checkbox-container">
                  <input 
                    :id="'ind_' + indicador.id"
                    type="checkbox" 
                    :value="indicador.id"
                    v-model="formData.parametros.indicadores_seleccionados"
                    class="indicador-checkbox"
                  />
                  <label :for="'ind_' + indicador.id" class="checkbox-custom"></label>
                </div>
                <label :for="'ind_' + indicador.id" class="indicador-label">
                  <div class="indicador-info">
                    <span class="indicador-nombre">{{ indicador.nombre }}</span>
                    <span class="indicador-categoria">
                      <i class="fas fa-tag"></i>
                      {{ indicador.categoria }}
                    </span>
                  </div>
                  <div class="indicador-valores">
                    <span class="valor-actual">{{ indicador.valor_actual }}{{ indicador.unidad }}</span>
                    <span :class="['estado-badge', indicador.estado_semaforo]">
                      <i :class="{
                        'fas fa-check-circle': indicador.estado_semaforo === 'verde',
                        'fas fa-exclamation-triangle': indicador.estado_semaforo === 'amarillo',
                        'fas fa-times-circle': indicador.estado_semaforo === 'rojo'
                      }"></i>
                      {{ indicador.estado_semaforo.toUpperCase() }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Rango de fechas -->
          <div class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-calendar-alt"></i>
                Periodo de Análisis
              </label>
            </div>
            <div class="form-row">
              <div class="input-group">
                <label class="input-label">Fecha de Inicio</label>
                <div class="input-container">
                  <i class="fas fa-calendar input-icon"></i>
                  <input 
                    type="date" 
                    v-model="formData.parametros.fecha_inicio"
                    class="form-input"
                  />
                </div>
              </div>
              <div class="input-group">
                <label class="input-label">Fecha de Fin</label>
                <div class="input-container">
                  <i class="fas fa-calendar input-icon"></i>
                  <input 
                    type="date" 
                    v-model="formData.parametros.fecha_fin"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Comentarios del analista -->
          <div class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-comment-alt"></i>
                Comentarios del Analista
              </label>
              <span class="optional-badge">Opcional</span>
            </div>
            <div class="textarea-container">
              <textarea 
                v-model="formData.parametros.comentarios_analista"
                placeholder="Agregue comentarios adicionales para el análisis que considere relevantes..."
                class="form-textarea"
                rows="4"
              ></textarea>
              <div class="textarea-counter">
                {{ formData.parametros.comentarios_analista?.length || 0 }}/500
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="resetFormData"
            class="action-btn secondary"
            :disabled="loading"
          >
            <i class="fas fa-eraser"></i>
            <span>Limpiar Formulario</span>
          </button>
          <button 
            type="submit" 
            class="action-btn primary"
            :disabled="!formData.tipo || loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-rocket"></i>
            <span>{{ loading ? 'Generando Reporte...' : 'Generar Reporte' }}</span>
          </button>
        </div>
      </form>

      <!-- Sistema de Toast Notifications -->
      <div class="toast-container">
        <transition-group name="toast" tag="div">
          <div 
            v-for="toast in toasts" 
            :key="toast.id"
            :class="['toast', toast.type]"
          >
            <div class="toast-icon">
              <i v-if="toast.type === 'generating'" class="fas fa-spinner fa-spin"></i>
              <i v-else-if="toast.type === 'success'" class="fas fa-check-circle"></i>
              <i v-else-if="toast.type === 'error'" class="fas fa-times-circle"></i>
              <i v-else-if="toast.type === 'downloading'" class="fas fa-download fa-bounce"></i>
            </div>
            <div class="toast-content">
              <div class="toast-title">{{ toast.title }}</div>
              <div class="toast-message">{{ toast.message }}</div>
              <div v-if="toast.progress" class="toast-progress">
                <div class="progress-bar" :style="{ width: toast.progress + '%' }"></div>
              </div>
            </div>
            <button 
              v-if="toast.type !== 'generating'" 
              @click="removeToast(toast.id)" 
              class="toast-close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </transition-group>
      </div>

      <!-- Modal de confirmación mejorado (Opcional - puedes quitarlo si prefieres solo los toasts) -->
      <div v-if="reporteGenerado && mostrarModal" class="modal-overlay" @click="cerrarModal">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="modal-title">¡Reporte Generado Exitosamente!</h3>
              <button @click="cerrarModal" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="reporte-info">
                <div class="info-item">
                  <span class="info-label">ID del Reporte:</span>
                  <span class="info-value">#{{ reporteGenerado.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span class="status-badge">
                    <i class="fas fa-check"></i>
                    Completado
                  </span>
                </div>
              </div>
              <div class="modal-message">
                <p>Tu reporte ha sido generado y descargado exitosamente.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="cerrarModal" class="modal-btn primary">
                <i class="fas fa-folder-open"></i>
                Ver Mis Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useReports } from '../../composables/useReports'

const emit = defineEmits(['reporte-generado'])
const props = defineProps(['cambiarTab'])

// Inyectar las funciones de toast del componente padre
const { addToast, updateToast, removeToast } = inject('toast', {
  addToast: () => {},
  updateToast: () => {},
  removeToast: () => {}
})

const {
  loading,
  error,
  indicadores,
  tiposReporte,
  formData,
  obtenerTiposReportes,
  obtenerIndicadores,
  generarReporte,
  resetFormData,
  esperarYDescargarReporte,
  isAuthenticated,
  logout
} = useReports()

const reporteGenerado = ref(null)
const mostrarModal = ref(false)

const seleccionarTipo = (tipo) => {
  formData.tipo = tipo
}

const generarNuevoReporte = async () => {
  let generatingToastId = null
  
  try {
    // Mostrar toast de generación
    generatingToastId = addToast(
      'generating',
      'Generando Reporte',
      'Procesando tu solicitud...',
      null,
      0
    )
    
    const solicitud = {
      tipo: formData.tipo,
      parametros: { ...formData.parametros }
    }
    
    // Simular progreso inicial
    setTimeout(() => updateToast(generatingToastId, { progress: 30 }), 500)
    
    const reporte = await generarReporte(solicitud)
    reporteGenerado.value = reporte
    
    // Actualizar progreso
    updateToast(generatingToastId, { 
      progress: 60,
      message: 'Preparando el documento PDF...'
    })
    
    emit('reporte-generado', reporte)

    // Esperar y descargar el reporte
    updateToast(generatingToastId, { 
      progress: 80,
      message: 'Finalizando generación...'
    })
    
    await esperarYDescargarReporte(reporte.id)
    
    // Cambiar el toast a éxito
    updateToast(generatingToastId, {
      type: 'success',
      title: '¡Reporte Completado!',
      message: `Reporte #${reporte.id} generado y descargado exitosamente`,
      progress: 100
    })
    
    // Mostrar toast de descarga
    setTimeout(() => {
      addToast(
        'downloading',
        'Descarga Completa',
        'El reporte ha sido descargado en tu dispositivo',
        5000
      )
    }, 1000)
    
    // Remover el toast de éxito después de 5 segundos
    setTimeout(() => {
      removeToast(generatingToastId)
      // Limpiar el formulario después de éxito
      resetFormData()
    }, 5000)
    
  } catch (err) {
    console.error('Error al generar reporte:', err)
    
    // Si hay un toast de generación, actualizarlo a error
    if (generatingToastId) {
      updateToast(generatingToastId, {
        type: 'error',
        title: 'Error al Generar',
        message: err.message || 'Ha ocurrido un error al generar el reporte',
        progress: null
      })
      
      setTimeout(() => removeToast(generatingToastId), 5000)
    } else {
      // Si no hay toast de generación, crear uno de error
      addToast(
        'error',
        'Error',
        err.message || 'Ha ocurrido un error inesperado',
        5000
      )
    }
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
  reporteGenerado.value = null
  resetFormData()
}

onMounted(async () => {
  if (!isAuthenticated()) {
    logout()
    return
  }

  await obtenerTiposReportes()
  await obtenerIndicadores()
})
</script>

<style scoped>
/* Variables CSS - Mantener las existentes */
.generar-reporte {
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

/* Sistema de Toast Notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 420px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid;
  position: relative;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Toast types styling */
.toast.generating {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, white 100%);
}

.toast.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, white 100%);
}

.toast.error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, white 100%);
}

.toast.downloading {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, white 100%);
}

.toast-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.toast.generating .toast-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.toast.success .toast-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.toast.error .toast-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.toast.downloading .toast-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: var(--gray-600);
  line-height: 1.4;
}

.toast-progress {
  margin-top: 8px;
  height: 3px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.toast.success .progress-bar {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.toast-close:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

/* Animación de salida */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

/* Animación bounce para el icono de descarga */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.fa-bounce {
  animation: bounce 1s ease-in-out infinite;
}

/* Responsive para toasts */
@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: 100%;
  }
}

/* Mantener todos los estilos existentes del componente */
.generar-reporte {
  padding: 2rem;
  background: linear-gradient(135deg, var(--gray-50) 0%, #ffffff 100%);
  min-height: 100vh;
}

/* ... resto de los estilos existentes ... */

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

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* ... resto de todos los estilos existentes del componente ... */
/* (Mantén todos los demás estilos tal como están) */

.form-container {
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-card {
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.required-badge {
  background: var(--danger-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.optional-badge {
  background: var(--gray-400);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.tipo-card {
  padding: 1.5rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
}

.tipo-card:hover {
  border-color: #00af00;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.05) 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15);
}

.tipo-card.selected {
  border-color: #00af00;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.08) 100%);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
}

.card-header-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tipo-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  transition: color 0.3s ease;
}

.tipo-card:hover .tipo-nombre {
  color: #059669;
}

.tipo-card.selected .tipo-nombre {
  color: #059669;
}

.tiempo-badge {
  background: linear-gradient(135deg, #00af00 0%, #00af00 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
}

.tipo-card:hover .tiempo-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.tipo-card.selected .tiempo-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.tipo-descripcion {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.tipo-card:hover .tipo-descripcion {
  color: var(--gray-700);
}

.opciones-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.opcion-chip {
  background: var(--gray-100);
  color: var(--gray-700);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.tipo-card:hover .opcion-chip {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

.tipo-card.selected .opcion-chip {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.3);
}

/* Form Groups */
.form-group {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
}

.form-group:last-child {
  border-bottom: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.selection-count {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Indicadores Selector */
.indicadores-selector {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  background: white;
}

.indicador-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  transition: background-color 0.2s ease;
}

.indicador-item:last-child {
  border-bottom: none;
}

.indicador-item:hover {
  background: var(--gray-50);
}

.indicador-checkbox-container {
  position: relative;
}

.indicador-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--gray-300);
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.indicador-checkbox:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.indicador-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.indicador-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.indicador-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.indicador-nombre {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.875rem;
}

.indicador-categoria {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-600);
}

.indicador-valores {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.valor-actual {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.875rem;
}

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.verde { 
  background: rgb(16 185 129 / 0.1); 
  color: var(--success-color); 
}

.estado-badge.amarillo { 
  background: rgb(245 158 11 / 0.1); 
  color: var(--warning-color); 
}

.estado-badge.rojo { 
  background: rgb(239 68 68 / 0.1); 
  color: var(--danger-color); 
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: var(--gray-900);
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

/* Textarea */
.textarea-container {
  position: relative;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: var(--gray-900);
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.textarea-counter {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.action-btn.secondary {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  position: relative;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
  color: white;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 2rem;
}

.reporte-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: var(--border-radius);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: var(--gray-700);
}

.info-value {
  font-weight: 700;
  color: var(--gray-900);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--warning-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.modal-message {
  text-align: center;
  color: var(--gray-600);
  line-height: 1.6;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
  text-align: center;
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgb(239 68 68 / 0.1);
  border: 1px solid rgb(239 68 68 / 0.2);
  border-left: 4px solid var(--danger-color);
  border-radius: var(--border-radius);
  margin-top: 1.5rem;
  position: relative;
}

.alert-icon {
  color: var(--danger-color);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--danger-color);
  margin: 0 0 0.25rem 0;
}

.alert-message {
  font-size: 0.875rem;
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

.alert-close {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.alert-close:hover {
  background: rgb(239 68 68 / 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .generar-reporte {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .tipos-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }
  
  .tipo-card {
    flex-direction: column;
    text-align: left;
  }
  
  .card-header-simple {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    text-align: left;
  }
  
  .tiempo-badge {
    align-self: flex-start;
  }
  
  .indicador-label {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .indicador-valores {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
  }
  
  .success-icon {
    font-size: 2rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}
</style>