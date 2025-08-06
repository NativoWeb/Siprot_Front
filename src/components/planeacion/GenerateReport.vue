<template>
  <div class="generar-reporte">
    <h2 class="section-title">Generar Nuevo Reporte</h2>
    
    <form @submit.prevent="generarNuevoReporte" class="form-container">
      <!-- Selección de tipo de reporte -->
      <div class="form-group">
        <label class="form-label">Tipo de Reporte *</label>
        <div class="tipos-grid">
          <div 
            v-for="tipo in tiposReporte" 
            :key="tipo.tipo"
            @click="seleccionarTipo(tipo.tipo)"
            :class="['tipo-card', { selected: formData.tipo === tipo.tipo }]"
          >
            <div class="tipo-header">
              <h3>{{ tipo.nombre }}</h3>
              <span class="tiempo">{{ tipo.tiempo_estimado }}</span>
            </div>
            <p class="tipo-descripcion">{{ tipo.descripcion }}</p>
            <div class="opciones">
              <span 
                v-for="opcion in tipo.opciones_disponibles" 
                :key="opcion"
                class="opcion-tag"
              >
                {{ opcion }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuración específica por tipo -->
      <div v-if="formData.tipo" class="configuracion">
        <h3 class="subsection-title">Configuración del Reporte</h3>
        
        <!-- Selección de indicadores (para reportes de indicadores) -->
        <div v-if="formData.tipo === 'indicadores'" class="form-group">
          <label class="form-label">Indicadores a Incluir</label>
          <div class="indicadores-selector">
            <div 
              v-for="indicador in indicadores" 
              :key="indicador.id"
              class="indicador-item"
            >
              <input 
                :id="'ind_' + indicador.id"
                type="checkbox" 
                :value="indicador.id"
                v-model="formData.parametros.indicadores_seleccionados"
                class="indicador-checkbox"
              />
              <label :for="'ind_' + indicador.id" class="indicador-label">
                <div class="indicador-info">
                  <span class="indicador-nombre">{{ indicador.nombre }}</span>
                  <span class="indicador-categoria">{{ indicador.categoria }}</span>
                </div>
                <div class="indicador-valores">
                  <span class="valor-actual">{{ indicador.valor_actual }}{{ indicador.unidad }}</span>
                  <span :class="['estado', indicador.estado_semaforo]">
                    {{ indicador.estado_semaforo.toUpperCase() }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Rango de fechas -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha Inicio</label>
            <input 
              type="date" 
              v-model="formData.parametros.fecha_inicio"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Fecha Fin</label>
            <input 
              type="date" 
              v-model="formData.parametros.fecha_fin"
              class="form-input"
            />
          </div>
        </div>

        <!-- Comentarios del analista -->
        <div class="form-group">
          <label class="form-label">Comentarios del Analista</label>
          <textarea 
            v-model="formData.parametros.comentarios_analista"
            placeholder="Agregue comentarios adicionales para el análisis..."
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="resetFormData"
          class="btn btn-secondary"
          :disabled="loading"
        >
          Limpiar
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!formData.tipo || loading"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-file-pdf"></i>
          {{ loading ? 'Generando...' : 'Generar Reporte' }}
        </button>
      </div>
    </form>

    <!-- Modal de confirmación -->
    <div v-if="reporteGenerado" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>¡Reporte Generado!</h3>
          <button @click="cerrarModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <p>El reporte se está generando en segundo plano.</p>
          <p><strong>ID del Reporte:</strong> {{ reporteGenerado.id }}</p>
          <p><strong>Estado:</strong> {{ reporteGenerado.estado }}</p>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-primary">
            Ver Mis Reportes
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReports } from '@/composables/useReports'

const emit = defineEmits(['reporte-generado'])

const {
  loading,
  error,
  indicadores,
  tiposReporte,
  formData,
  obtenerTiposReportes,
  obtenerIndicadores,
  generarReporte,
  resetFormData
} = useReports()

const reporteGenerado = ref(null)

const seleccionarTipo = (tipo) => {
  formData.tipo = tipo
}

const generarNuevoReporte = async () => {
  try {
    const solicitud = {
      tipo: formData.tipo,
      parametros: { ...formData.parametros }
    }
    
    const reporte = await generarReporte(solicitud)
    reporteGenerado.value = reporte
    emit('reporte-generado', reporte)
  } catch (err) {
    console.error('Error al generar reporte:', err)
  }
}

const cerrarModal = () => {
  reporteGenerado.value = null
  resetFormData()
}

onMounted(async () => {
  // Verificar autenticación antes de cargar datos
  const { isAuthenticated, getCurrentUser, logout } = useReports()
  
  if (!isAuthenticated()) {
    logout()
    return
  }
  
  // Configurar interceptores si no están configurados
  setupAxiosInterceptors()
  
  await obtenerTiposReportes()
  await obtenerIndicadores()
})
</script>

<style scoped>
.generar-reporte {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.8rem;
  color: #2E86AB;
  margin-bottom: 30px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.subsection-title {
  font-size: 1.3rem;
  color: #495057;
  margin-bottom: 20px;
}

.form-container {
  max-width: 800px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #2E86AB;
}

.tipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.tipo-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.tipo-card:hover {
  border-color: #2E86AB;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 134, 171, 0.15);
}

.tipo-card.selected {
  border-color: #2E86AB;
  background: rgba(46, 134, 171, 0.05);
}

.tipo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tipo-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2E86AB;
}

.tiempo {
  background: #A23B72;
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tipo-descripcion {
  color: #6c757d;
  margin-bottom: 15px;
  line-height: 1.5;
}

.opciones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opcion-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  border: 1px solid #dee2e6;
}

.indicadores-selector {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
}

.indicador-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f3f4;
}

.indicador-item:last-child {
  border-bottom: none;
}

.indicador-checkbox {
  margin-right: 12px;
  transform: scale(1.2);
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
}

.indicador-nombre {
  font-weight: 600;
  color: #495057;
}

.indicador-categoria {
  font-size: 0.9rem;
  color: #6c757d;
}

.indicador-valores {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.valor-actual {
  font-weight: 600;
  margin-bottom: 4px;
}

.estado {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.estado.verde { background: #d4edda; color: #155724; }
.estado.amarillo { background: #fff3cd; color: #856404; }
.estado.rojo { background: #f8d7da; color: #721c24; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: #2E86AB;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1f5f7a;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #28a745;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  color: #28a745;
  margin-bottom: 15px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .tipos-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>