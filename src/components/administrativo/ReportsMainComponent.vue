<script setup>
import { onMounted, ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

import GenerateReport from '../../components/administrativo/GenerateReport.vue'
import ReportList from '../../components/administrativo/ReportList.vue'

const router = useRouter()
const activeTab = ref('generar')
const mostrarModalGenerar = ref(false)

// Sistema de Toast Global
const toasts = ref([])
let toastIdCounter = 0

// Función para agregar un toast
const addToast = (type, title, message, duration = null, progress = null) => {
  const id = ++toastIdCounter
  const toast = {
    id,
    type,
    title,
    message,
    progress
  }
  
  toasts.value.push(toast)
  
  // Auto-remover toasts después de un tiempo (excepto los de generación)
  if (duration && type !== 'generating') {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  return id
}

// Función para actualizar un toast existente
const updateToast = (id, updates) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value[index] = { ...toasts.value[index], ...updates }
  }
}

// Función para remover un toast
const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

// Proveer las funciones de toast a los componentes hijos
provide('toast', {
  addToast,
  updateToast,
  removeToast
})

onMounted(() => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    alert('🔒 Debes iniciar sesión.')
    router.push('/iniciar-sesion')
    return
  }

  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp && decoded.exp < currentTime) {
      alert('🔒 Sesión expirada. Inicia sesión nuevamente.')
      localStorage.removeItem('access_token')
      router.push('/iniciar-sesion')
    } else if (decoded.role !== 'administrativo' && decoded.role !== 'superadmin') {
      alert('❌ No tienes permisos para acceder a esta vista.')
      router.push('/')
    }
  } catch (error) {
    console.error('❌ Token inválido', error)
    localStorage.removeItem('access_token')
    router.push('/iniciar-sesion')
  }
})

const onReporteGenerado = (reporte) => {
  // Cambiar a la pestaña de "Mis Reportes" después de generar
  setTimeout(() => {
    activeTab.value = 'mis-reportes'
  }, 2000) // Esperar 2 segundos para que el usuario vea el toast de éxito
}

const onReporteEliminado = (reporteId) => {
  console.log('Reporte eliminado:', reporteId)
  // Agregar toast de eliminación
  addToast(
    'success',
    'Reporte Eliminado',
    `El reporte #${reporteId} ha sido eliminado exitosamente`,
    3000
  )
}
</script>

<template>
  <div class="reportes-container">
    <div class="header">
      <h1 class="title">Reportes</h1>
    </div>

    <div class="tabs">
      <button @click="activeTab = 'generar'" :class="['tab-btn', { active: activeTab === 'generar' }]">
        Generar Reporte
      </button>
      <button @click="activeTab = 'mis-reportes'" :class="['tab-btn', { active: activeTab === 'mis-reportes' }]">
        Mis Reportes
        <!-- Badge para indicar reportes nuevos -->
        <span v-if="toasts.some(t => t.type === 'success')" class="new-badge">Nuevo</span>
      </button>
      <button @click="activeTab = 'indicadores'" :class="['tab-btn', { active: activeTab === 'indicadores' }]">
        Indicadores
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'generar'" class="tab-panel">
        <GenerateReport 
          @reporte-generado="onReporteGenerado"
          :cambiar-tab="(tab) => activeTab = tab" 
        />
      </div>
      <div v-if="activeTab === 'mis-reportes'" class="tab-panel">
        <ReportList @reporte-eliminado="onReporteEliminado" />
      </div>
    </div>

    <!-- Sistema de Toast Notifications Global -->
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
            <div v-if="toast.progress !== null && toast.progress !== undefined" class="toast-progress">
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
  </div>
</template>

<style scoped>
.reportes-container {
  max-width: 2000px;
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  position: relative; /* Para posicionar los toasts */
}

/* Sistema de Toast Notifications */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
  border-left: 5px solid;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
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

/* Toast types styling - Más sólidos y menos transparentes */
.toast.generating {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.toast.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.toast.error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.toast.downloading {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
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
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.05);
}

.toast.success .toast-icon {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
}

.toast.error .toast-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.05);
}

.toast.downloading .toast-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.toast-progress {
  margin-top: 8px;
  height: 3px;
  background: #e5e7eb;
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
  background: linear-gradient(90deg, #00af00 0%, #00af00 100%);
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #4b5563;
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

/* Estilos existentes */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #00af00;
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 30px;
  position: relative;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: #00af00;
  background-color: #f8f9fa;
}

.tab-btn.active {
  color: #00af00;
  border-bottom-color: #00af00;
  background-color: #f8f9fa;
}

/* Badge para nuevos reportes */
.new-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.tab-content {
  min-height: 500px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .reportes-container {
    width: 100%;
    padding: 15px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-btn {
    white-space: nowrap;
    min-width: max-content;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .reportes-container {
    padding: 10px;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>