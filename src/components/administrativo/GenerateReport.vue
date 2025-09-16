<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { useReports } from '/src/composables/useReports'
import EducationalOffer from '../planeacion/EducationalOffer.vue'
import DOFAAnalysis from '../planeacion/DOFAAnalysis.vue'
import EscenariosProspectivos from '../planeacion/EscenariosProspectivos.vue'

// All hooks must be called at the top level first
const emit = defineEmits(['reporte-generado'])
const props = defineProps(['cambiarTab'])

const loading = ref(false)
const reporteGenerado = ref(null)
const mostrarModal = ref(false)
const toasts = ref([])

const educationalOfferRef = ref(null)
const dofaAnalysisRef = ref(null)
const escenariosProspectivosRef = ref(null)

const datosModulos = ref({
  oferta_educativa: {
    programas: [],
    estadisticas: {},
    cargando: false
  },
  dofa: {
    matriz: { D: [], O: [], F: [], A: [] },
    estadisticas: {},
    cargando: false
  },
  escenarios: {
    scenarios: {},
    selectedScenario: 'tendencial',
    cargando: false
  }
})

// Inyectar las funciones de toast del componente padre
const toast = inject('toast', {
  addToast: () => {},
  updateToast: () => {},
  removeToast: () => {}
})

// useReports hook called at top level
const {
  generarReporte,
  resetFormData,
  error,
  isAuthenticated,
  logout
} = useReports()


// Non-hook variables and constants
const tiposReporte = ref([
  {
    tipo: 'indicadores',
    nombre: 'Reporte de Indicadores Clave',
    descripcion: 'Consolida indicadores de oferta educativa, DOFA y escenarios prospectivos con datos actualizados.',
    tiempo_estimado: '2-3 min',
    opciones_disponibles: ['Datos en tiempo real', 'Análisis de tendencias', 'Estado semáforo'],
    fuentes_datos: ['oferta_educativa', 'dofa', 'escenarios']
  },
  {
    tipo: 'prospectiva',
    nombre: 'Informe de Prospectiva Anual',
    descripcion: 'Análisis prospectivo basado en escenarios reales y matriz DOFA actualizada.',
    tiempo_estimado: '3-4 min',
    opciones_disponibles: ['Escenarios reales', 'Análisis DOFA integrado', 'Recomendaciones estratégicas'],
    fuentes_datos: ['escenarios', 'dofa']
  },
  {
    tipo: 'oferta_educativa',
    nombre: 'Análisis de Oferta Educativa',
    descripcion: 'Evaluación completa basada en datos reales de programas educativos y su impacto.',
    tiempo_estimado: '2-3 min',
    opciones_disponibles: ['Programas actuales', 'Cobertura real', 'Métricas de calidad'],
    fuentes_datos: ['oferta_educativa']
  },
  {
    tipo: 'consolidado',
    nombre: 'Reporte Consolidado Integral',
    descripcion: 'Reporte completo que integra datos reales de todos los módulos del sistema.',
    tiempo_estimado: '4-5 min',
    opciones_disponibles: ['Todos los módulos', 'Análisis integral', 'Conclusiones basadas en datos reales'],
    fuentes_datos: ['oferta_educativa', 'dofa', 'escenarios']
  }
])

const indicadoresReales = computed(() => {
  const indicadores = []
  
  // Indicadores de Oferta Educativa
  if (datosModulos.value.oferta_educativa.programas.length > 0) {
    const programas = datosModulos.value.oferta_educativa.programas
    const totalProgramas = programas.length
    const sectoresUnicos = [...new Set(programas.map(p => p.sector))].length
    const nivelesUnicos = [...new Set(programas.map(p => p.level))].length
    
    indicadores.push(
      {
        id: 'total_programas',
        nombre: 'Total de Programas Educativos',
        categoria: 'Oferta Educativa',
        valor_actual: totalProgramas,
        unidad: 'programas',
        estado_semaforo: totalProgramas > 20 ? 'verde' : totalProgramas > 10 ? 'amarillo' : 'rojo',
        fuente: 'oferta_educativa'
      },
      {
        id: 'diversidad_sectores',
        nombre: 'Diversidad de Sectores',
        categoria: 'Oferta Educativa',
        valor_actual: sectoresUnicos,
        unidad: 'sectores',
        estado_semaforo: sectoresUnicos > 5 ? 'verde' : sectoresUnicos > 3 ? 'amarillo' : 'rojo',
        fuente: 'oferta_educativa'
      }
    )
  }
  
  // Indicadores DOFA
  const totalItemsDofa = Object.values(datosModulos.value.dofa.matriz).reduce((sum, items) => sum + items.length, 0)
  if (totalItemsDofa > 0) {
    indicadores.push(
      {
        id: 'items_dofa',
        nombre: 'Elementos en Matriz DOFA',
        categoria: 'Análisis Estratégico',
        valor_actual: totalItemsDofa,
        unidad: 'elementos',
        estado_semaforo: totalItemsDofa > 20 ? 'verde' : totalItemsDofa > 10 ? 'amarillo' : 'rojo',
        fuente: 'dofa'
      },
      {
        id: 'fortalezas_vs_debilidades',
        nombre: 'Ratio Fortalezas/Debilidades',
        categoria: 'Análisis Estratégico',
        valor_actual: datosModulos.value.dofa.matriz.D.length > 0 ? 
          (datosModulos.value.dofa.matriz.F.length / datosModulos.value.dofa.matriz.D.length).toFixed(2) : 0,
        unidad: 'ratio',
        estado_semaforo: datosModulos.value.dofa.matriz.F.length > datosModulos.value.dofa.matriz.D.length ? 'verde' : 'amarillo',
        fuente: 'dofa'
      }
    )
  }
  
  // Indicadores de Escenarios
  const totalEscenarios = Object.keys(datosModulos.value.escenarios.scenarios).length
  if (totalEscenarios > 0) {
    indicadores.push({
      id: 'escenarios_disponibles',
      nombre: 'Escenarios Prospectivos Disponibles',
      categoria: 'Prospectiva',
      valor_actual: totalEscenarios,
      unidad: 'escenarios',
      estado_semaforo: totalEscenarios >= 3 ? 'verde' : totalEscenarios >= 2 ? 'amarillo' : 'rojo',
      fuente: 'escenarios'
    })
  }
  
  return indicadores
})

const escenariosReales = computed(() => {
  return Object.entries(datosModulos.value.escenarios.scenarios).map(([key, scenario]) => ({
    id: key,
    nombre: scenario.scenario_name || `Escenario ${key}`,
    tipo: scenario.scenario_type || key,
    descripcion: scenario.description || `Análisis prospectivo ${key}`,
    datos_disponibles: scenario.data ? scenario.data.length : 0
  }))
})

const formData = ref({
  tipo: '',
  parametros: {
    indicadores_seleccionados: [],
    escenarios_seleccionados: [],
    fecha_inicio: '',
    fecha_fin: '',
    comentarios_analista: '',
    incluir_graficas: true,
    incluir_dofa: true,
    incluir_documentos_recientes: true,
    usar_datos_tiempo_real: true,
    incluir_estadisticas_modulos: true,
    nivel_detalle: 'completo'
  }
})

const cargarDatosModulos = async () => {
  try {
    // Cargar datos de Oferta Educativa
    if (educationalOfferRef.value && educationalOfferRef.value.loadPrograms) {
      datosModulos.value.oferta_educativa.cargando = true
      await educationalOfferRef.value.loadPrograms()
      datosModulos.value.oferta_educativa.programas = educationalOfferRef.value.programs || []
      datosModulos.value.oferta_educativa.cargando = false
    }
    
    // Cargar datos DOFA
    if (dofaAnalysisRef.value && dofaAnalysisRef.value.loadDofaData) {
      datosModulos.value.dofa.cargando = true
      await dofaAnalysisRef.value.loadDofaData()
      datosModulos.value.dofa.matriz = dofaAnalysisRef.value.dofaData || { D: [], O: [], F: [], A: [] }
      datosModulos.value.dofa.cargando = false
    }
    
    // Cargar datos de Escenarios
    if (escenariosProspectivosRef.value && escenariosProspectivosRef.value.loadScenarios) {
      datosModulos.value.escenarios.cargando = true
      await escenariosProspectivosRef.value.loadScenarios()
      datosModulos.value.escenarios.scenarios = escenariosProspectivosRef.value.scenarios || {}
      datosModulos.value.escenarios.cargando = false
    }
    
    console.log('Datos de módulos cargados:', datosModulos.value)
  } catch (error) {
    console.error('Error cargando datos de módulos:', error)
    toast.addToast('error', 'Error', 'No se pudieron cargar los datos de los módulos', 5000)
  }
}

// Functions (not hooks)
const setPresetPeriod = (preset) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  switch (preset) {
    case 'ultimo_año':
      formData.value.parametros.fecha_inicio = `${currentYear - 1}-01-01`
      formData.value.parametros.fecha_fin = `${currentYear - 1}-12-31`
      break
    case 'ultimos_5_años':
      formData.value.parametros.fecha_inicio = `${currentYear - 5}-01-01`
      formData.value.parametros.fecha_fin = `${currentYear - 1}-12-31`
      break
    case 'año_actual':
      formData.value.parametros.fecha_inicio = `${currentYear}-01-01`
      formData.value.parametros.fecha_fin = today.toISOString().split('T')[0]
      break
  }
}

const seleccionarTipo = (tipo) => {
  formData.value.tipo = tipo
  // Resetear parámetros específicos
  formData.value.parametros.indicadores_seleccionados = []
  formData.value.parametros.escenarios_seleccionados = []
}


const generarNuevoReporte = async () => {
  if (!formData.value.tipo) {
    toast.addToast('error', 'Error', 'Debe seleccionar un tipo de reporte', 3000)
    return
  }

  loading.value = true
  const toastId = toast.addToast(
    'generating',
    'Generando Reporte',
    `Compilando ${tiposReporte.value.find(t => t.tipo === formData.value.tipo)?.nombre}...`,
    null,
    0
  )

  try {
    // 🔹 Simular progreso por etapas
    const etapas = [
      'Recopilando datos de oferta educativa...',
      'Analizando matriz DOFA...',
      'Procesando escenarios prospectivos...',
      'Generando gráficas y análisis...',
      'Compilando reporte final...'
    ]

    for (let i = 0; i < etapas.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))
      toast.updateToast(toastId, {
        progress: (i + 1) * 20,
        message: etapas[i]
      })
    }

    // 🔹 Llamada al backend
    const reporteResponse = await generarReporte({
      tipo: formData.value.tipo,
      parametros: formData.value.parametros
    })

    // 🔹 Toast de éxito con estadísticas si existen
    if (reporteResponse.estadisticas_modulos) {
      const estadisticas = reporteResponse.estadisticas_modulos
      const resumenDatos = `Incluye ${estadisticas.oferta_educativa?.total_programas || 0} programas, ${estadisticas.dofa?.total_elementos || 0} elementos DOFA, ${estadisticas.escenarios?.total_escenarios || 0} escenarios`

      toast.updateToast(toastId, {
        type: 'success',
        title: 'Reporte Generado',
        message: `El reporte #${reporteResponse.id} fue creado correctamente. ${resumenDatos}`,
        progress: null
      })
    } else {
      toast.updateToast(toastId, {
        type: 'success',
        title: 'Reporte Generado',
        message: `El reporte #${reporteResponse.id} fue creado correctamente (estado: ${reporteResponse.estado})`,
        progress: null
      })
    }

    // Auto-remover después de 5s
    setTimeout(() => {
      toast.removeToast(toastId)
    }, 5000)

    emit('reporte-generado', reporteResponse)
    resetFormData()
  } catch (error) {
    console.error('Error generando reporte:', error)
    toast.updateToast(toastId, {
      type: 'error',
      title: 'Error en Generación',
      message: error.message || 'No se pudo generar el reporte en el servidor.',
      progress: null
    })

    setTimeout(() => {
      toast.removeToast(toastId)
    }, 5000)
  } finally {
    loading.value = false
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}

onMounted(() => {
  if (!isAuthenticated()) {
    logout()
    return
  }
  
  cargarDatosModulos()
})
</script>

<template>
  <div class="generar-reporte">
    <!-- Componentes de módulos ocultos para acceso a datos -->
    <div style="display: none;">
      <EducationalOffer ref="educationalOfferRef" />
      <DOFAAnalysis ref="dofaAnalysisRef" />
      <EscenariosProspectivos ref="escenariosProspectivosRef" />
    </div>

    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <i class="fas fa-plus-circle title-icon"></i>
          <h2 class="section-title">Generar Nuevo Reporte</h2>
        </div>
        <!-- Indicador de estado de datos -->
        <div class="datos-estado">
          <span class="estado-badge" :class="{ 
            'verde': !Object.values(datosModulos).some(m => m.cargando),
            'amarillo': Object.values(datosModulos).some(m => m.cargando)
          }">
            <i class="fas fa-database"></i>
            {{ Object.values(datosModulos).some(m => m.cargando) ? 'Cargando datos...' : 'Datos actualizados' }}
          </span>
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
              <!-- Mostrar fuentes de datos -->
              <div class="fuentes-datos">
                <span class="fuentes-label">Fuentes de datos:</span>
                <div class="fuentes-chips">
                  <span 
                    v-for="fuente in tipo.fuentes_datos" 
                    :key="fuente"
                    class="fuente-chip"
                    :class="{ 
                      'activa': !datosModulos[fuente]?.cargando && 
                               (fuente === 'oferta_educativa' ? datosModulos[fuente].programas.length > 0 :
                                fuente === 'dofa' ? Object.values(datosModulos[fuente].matriz).some(arr => arr.length > 0) :
                                fuente === 'escenarios' ? Object.keys(datosModulos[fuente].scenarios).length > 0 : false)
                    }"
                  >
                    <i class="fas fa-circle status-dot"></i>
                    {{ fuente.replace('_', ' ').toUpperCase() }}
                  </span>
                </div>
              </div>
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

        <!-- Configuración específica mejorada -->
        <div v-if="formData.tipo" class="section-card configuracion-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-cogs"></i>
              Configuración del Reporte
            </h3>
          </div>
          
          <!-- Selección de indicadores reales -->
          <div v-if="formData.tipo === 'indicadores' || formData.tipo === 'consolidado'" class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-list-check"></i>
                Indicadores a Incluir (Datos Reales)
              </label>
              <span class="selection-count" v-if="formData.parametros.indicadores_seleccionados.length">
                {{ formData.parametros.indicadores_seleccionados.length }} seleccionados
              </span>
            </div>
            <div class="indicadores-selector">
              <div 
                v-for="indicador in indicadoresReales" 
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
                    <!-- Mostrar fuente de datos -->
                    <span class="indicador-fuente">
                      <i class="fas fa-database"></i>
                      {{ indicador.fuente.replace('_', ' ') }}
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

          <!-- Selección de escenarios reales -->
          <div v-if="formData.tipo === 'prospectiva' || formData.tipo === 'consolidado'" class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-crystal-ball"></i>
                Escenarios Prospectivos a Incluir (Datos Reales)
              </label>
              <span class="selection-count" v-if="formData.parametros.escenarios_seleccionados.length">
                {{ formData.parametros.escenarios_seleccionados.length }} seleccionados
              </span>
            </div>
            <div class="escenarios-selector">
              <div 
                v-for="escenario in escenariosReales" 
                :key="escenario.id"
                class="escenario-item"
              >
                <div class="escenario-checkbox-container">
                  <input 
                    :id="'esc_' + escenario.id"
                    type="checkbox" 
                    :value="escenario.id"
                    v-model="formData.parametros.escenarios_seleccionados"
                    class="escenario-checkbox"
                  />
                  <label :for="'esc_' + escenario.id" class="checkbox-custom"></label>
                </div>
                <label :for="'esc_' + escenario.id" class="escenario-label">
                  <div class="escenario-info">
                    <span class="escenario-nombre">{{ escenario.nombre }}</span>
                    <span class="escenario-tipo">
                      <i class="fas fa-tag"></i>
                      {{ escenario.tipo }}
                    </span>
                    <!-- Mostrar cantidad de datos disponibles -->
                    <span class="datos-disponibles">
                      <i class="fas fa-chart-line"></i>
                      {{ escenario.datos_disponibles }} puntos de datos
                    </span>
                  </div>
                  <div class="escenario-descripcion">
                    {{ escenario.descripcion }}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Rango de fechas mejorado para cumplir R6.6 -->
          <div class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-calendar-alt"></i>
                Periodo de Análisis
              </label>
              <div class="preset-buttons">
                <button type="button" @click="setPresetPeriod('ultimo_año')" class="preset-btn">
                  Último Año
                </button>
                <button type="button" @click="setPresetPeriod('ultimos_5_años')" class="preset-btn">
                  Últimos 5 Años
                </button>
                <button type="button" @click="setPresetPeriod('año_actual')" class="preset-btn">
                  Año Actual
                </button>
              </div>
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

          <!-- Comentarios del analista mejorados para cumplir R6.6 -->
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
                placeholder="Agregue comentarios adicionales, contexto específico, o notas relevantes para el análisis que considere importantes para este reporte..."
                class="form-textarea"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="textarea-counter">
                {{ formData.parametros.comentarios_analista?.length || 0 }}/500
              </div>
            </div>
          </div>

          <!-- Opciones adicionales de personalización para cumplir R6.6 -->
          <div class="form-group">
            <div class="group-header">
              <label class="group-label">
                <i class="fas fa-sliders-h"></i>
                Opciones Adicionales
              </label>
            </div>
            <div class="opciones-adicionales">
              <div class="opcion-item">
                <input 
                  type="checkbox" 
                  id="incluir_graficas"
                  v-model="formData.parametros.incluir_graficas"
                  class="opcion-checkbox"
                />
                <label for="incluir_graficas" class="opcion-label">
                  <i class="fas fa-chart-line"></i>
                  Incluir gráficas y visualizaciones
                </label>
              </div>
              <div class="opcion-item">
                <input 
                  type="checkbox" 
                  id="incluir_dofa"
                  v-model="formData.parametros.incluir_dofa"
                  class="opcion-checkbox"
                />
                <label for="incluir_dofa" class="opcion-label">
                  <i class="fas fa-th-large"></i>
                  Incluir análisis DOFA
                </label>
              </div>
              <div class="opcion-item">
                <input 
                  type="checkbox" 
                  id="incluir_documentos_recientes"
                  v-model="formData.parametros.incluir_documentos_recientes"
                  class="opcion-checkbox"
                />
                <label for="incluir_documentos_recientes" class="opcion-label">
                  <i class="fas fa-file-alt"></i>
                  Incluir documentos recientes relevantes
                </label>
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
  --shadow-lg: 0 10px 15px -3px rgb(0, 0, 0, 0.1), 0 4px 6px -4px rgb(0, 0, 0, 0.1);
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

/* Estilos adicionales para nuevas funcionalidades */
.preset-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.escenarios-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.escenario-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.escenario-item:hover {
  border-color: #00af00;
  box-shadow: 0 2px 8px rgba(0, 175, 0, 0.1);
}

.escenario-label {
  flex: 1;
  cursor: pointer;
}

.escenario-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.escenario-nombre {
  font-weight: 600;
  color: #1f2937;
}

.escenario-tipo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.escenario-descripcion {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.opciones-adicionales {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.opcion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.opcion-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #00af00;
}

.opcion-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.opcion-label i {
  color: #00af00;
}

@media (max-width: 768px) {
  .preset-buttons {
    flex-direction: column;
  }
  
  .preset-btn {
    width: 100%;
  }
}

/* Nuevos estilos para indicadores de datos */
.datos-estado {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fuentes-datos {
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.fuentes-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  display: block;
  margin-bottom: 0.5rem;
}

.fuentes-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.fuente-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  color: #6c757d;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.fuente-chip.activa {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-dot {
  font-size: 0.5rem;
}

.fuente-chip.activa .status-dot {
  color: #28a745;
}

.indicador-fuente {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.datos-disponibles {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}
</style>
