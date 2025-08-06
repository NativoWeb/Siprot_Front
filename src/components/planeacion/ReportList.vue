<template>
  <div class="lista-reportes">
    <div class="header">
      <h2 class="section-title">Mis Reportes</h2>
      <button @click="cargarReportes" class="btn btn-outline" :disabled="loading">
        <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i>
        Actualizar
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label class="filtro-label">Tipo de Reporte:</label>
        <select v-model="filtroTipo" @change="aplicarFiltros" class="filtro-select">
          <option value="">Todos</option>
          <option value="indicadores">Indicadores</option>
          <option value="prospectiva">Prospectiva</option>
          <option value="oferta_educativa">Oferta Educativa</option>
          <option value="consolidado">Consolidado</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Estado:</label>
        <select v-model="filtroEstado" @change="aplicarFiltros" class="filtro-select">
          <option value="">Todos</option>
          <option value="generando">Generando</option>
          <option value="completado">Completado</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && reportes.length === 0" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando reportes...</p>
    </div>

    <!-- Lista de reportes -->
    <div v-else-if="reportesFiltrados.length > 0" class="reportes-grid">
      <div 
        v-for="reporte in reportesFiltrados" 
        :key="reporte.id"
        class="reporte-card"
      >
        <div class="reporte-header">
          <div class="reporte-info">
            <h3 class="reporte-titulo">{{ obtenerNombreTipo(reporte.tipo) }}</h3>
            <span class="reporte-id">ID: {{ reporte.id }}</span>
          </div>
          <span :class="['estado-badge', reporte.estado]">
            {{ reporte.estado.toUpperCase() }}
          </span>
        </div>

        <div class="reporte-detalles">
          <div class="detalle-item">
            <i class="fas fa-calendar"></i>
            <span>{{ formatearFecha(reporte.fecha_generacion) }}</span>
          </div>
          <div class="detalle-item" v-if="reporte.tamaño_archivo">
            <i class="fas fa-file"></i>
            <span>{{ formatearTamaño(reporte.tamaño_archivo) }}</span>
          </div>
          <div class="detalle-item" v-if="reporte.updated_at">
            <i class="fas fa-clock"></i>
            <span>Actualizado: {{ formatearFecha(reporte.updated_at) }}</span>
          </div>
        </div>

        <!-- Parámetros del reporte -->
        <div v-if="reporte.parametros" class="reporte-parametros">
          <h4>Parámetros:</h4>
          <div class="parametro-item" v-if="reporte.parametros.fecha_inicio">
            <strong>Periodo:</strong> 
            {{ formatearFecha(reporte.parametros.fecha_inicio) }} - 
            {{ formatearFecha(reporte.parametros.fecha_fin) }}
          </div>
          <div class="parametro-item" v-if="reporte.parametros.indicadores_seleccionados?.length">
            <strong>Indicadores seleccionados:</strong> 
            {{ reporte.parametros.indicadores_seleccionados.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
