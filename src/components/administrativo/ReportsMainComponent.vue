<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

import GenerateReport from '../../components/administrativo/GenerateReport.vue'
import ReportList from '../../components/administrativo/ReportList.vue'
/* import ListaIndicadores from '@/components/reportes/ListaIndicadores.vue' */

const router = useRouter()
const activeTab = ref('generar')
const mostrarModalGenerar = ref(false)

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
  activeTab.value = 'mis-reportes'
}

const onReporteEliminado = (reporteId) => {
  console.log('Reporte eliminado:', reporteId)
}
</script>

<template>
  <div class="reportes-container">
    <div class="header">
      <h1 class="title">Sistema de Reportes</h1>
      <button @click="mostrarModalGenerar = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Generar Nuevo Reporte
      </button>
    </div>

    <div class="tabs">
      <button @click="activeTab = 'generar'" :class="['tab-btn', { active: activeTab === 'generar' }]">Generar Reporte</button>
      <button @click="activeTab = 'mis-reportes'" :class="['tab-btn', { active: activeTab === 'mis-reportes' }]">Mis Reportes</button>
      <button @click="activeTab = 'indicadores'" :class="['tab-btn', { active: activeTab === 'indicadores' }]">Indicadores</button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'generar'" class="tab-panel">
        <GenerateReport @reporte-generado="onReporteGenerado" />
      </div>
      <div v-if="activeTab === 'mis-reportes'" class="tab-panel">
        <ReportList @reporte-eliminado="onReporteEliminado" />
      </div>
      <!-- <div v-if="activeTab === 'indicadores'" class="tab-panel">
        <ListaIndicadores />
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.reportes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2E86AB;
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 30px;
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
}

.tab-btn:hover {
  color: #2E86AB;
  background-color: #f8f9fa;
}

.tab-btn.active {
  color: #2E86AB;
  border-bottom-color: #2E86AB;
  background-color: #f8f9fa;
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

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: #2E86AB;
  color: white;
}

.btn-primary:hover {
  background-color: #1f5f7a;
  transform: translateY(-2px);
}
</style>
