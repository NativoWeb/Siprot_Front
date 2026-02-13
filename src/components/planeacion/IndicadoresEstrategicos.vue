<template>
  <div class="w-[90%]">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 font-serif">Indicadores Estratégicos</h1>
          <p class="text-gray-600 mt-2">Dashboard ejecutivo y gestión de indicadores</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="cargarDatos"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            title="Refrescar datos"
          >
            Refrescar
          </button>
          <button
            @click="exportData"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Exportar datos"
          >
            Exportar
          </button>
          <button
            v-if="canEdit"
            @click="abrirModalCrear"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nuevo Indicador
          </button>
        </div>
      </div>

      <div v-if="!showHistoricosSection" class="mb-12 pb-8 border-b-2 border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Dashboard Ejecutivo
        </h2>

         Resumen Ejecutivo 
        <div v-if="resumen" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Total Indicadores</p>
                <p class="text-3xl font-bold text-gray-900">{{ resumen.total_indicadores }}</p>
              </div>
              <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">En Meta</p>
                <p class="text-3xl font-bold text-green-600">{{ resumen.verde }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ calcularPorcentaje(resumen.verde, resumen.total_indicadores) }}%
                </p>
              </div>
              <div class="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">En Progreso</p>
                <p class="text-3xl font-bold text-yellow-600">{{ resumen.amarillo }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ calcularPorcentaje(resumen.amarillo, resumen.total_indicadores) }}%
                </p>
              </div>
              <div class="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Críticos</p>
                <p class="text-3xl font-bold text-red-600">{{ resumen.rojo }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ calcularPorcentaje(resumen.rojo, resumen.total_indicadores) }}%
                </p>
              </div>
              <div class="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                🚨
              </div>
            </div>
          </div>
        </div>

         Gráficos de Distribución 
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Distribución por Estado</h3>
            <div class="h-64">
              <canvas id="estadosChart"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Cumplimiento por Categoría</h3>
            <div class="h-64">
              <canvas id="categoriasChart"></canvas>
            </div>
          </div>
        </div>

         Top Indicadores 
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
              Top 5 - Mejor Desempeño
            </h3>
            <div class="space-y-3">
              <div 
                v-for="(ind, index) in topMejores" 
                :key="'mejor-' + ind.id"
                class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <span class="font-bold text-green-700 text-lg">{{ index + 1 }}</span>
                  <div>
                    <p class="font-medium text-gray-900">{{ ind.nombre }}</p>
                    <p class="text-xs text-gray-600">{{ ind.categoria }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-700">{{ Math.round(ind.cumplimiento) }}%</p>
                  <p class="text-xs text-gray-600">{{ ind.valor_actual }} / {{ ind.meta }} {{ ind.unidad }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
              Top 5 - Requiere Atención
            </h3>
            <div class="space-y-3">
              <div 
                v-for="(ind, index) in topPeores" 
                :key="'peor-' + ind.id"
                class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <span class="font-bold text-red-700 text-lg">{{ index + 1 }}</span>
                  <div>
                    <p class="font-medium text-gray-900">{{ ind.nombre }}</p>
                    <p class="text-xs text-gray-600">{{ ind.categoria }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-red-700">{{ Math.round(ind.cumplimiento) }}%</p>
                  <p class="text-xs text-gray-600">{{ ind.valor_actual }} / {{ ind.meta }} {{ ind.unidad }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!showHistoricosSection">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Gestión de Indicadores
        </h2>

         Filtros y Búsqueda 
        <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Categoría</label>
              <select v-model="filtroCategoria" class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                <option value="">Todas</option>
                <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Estado</label>
              <select v-model="filtroEstado" class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                <option value="">Todos</option>
                <option value="verde">En Meta</option>
                <option value="amarillo">En Progreso</option>
                <option value="rojo">Crítico</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Desde</label>
              <input v-model="filtroFechaDesde" type="date" class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Hasta</label>
              <input v-model="filtroFechaHasta" type="date" class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
            </div>
          </div>
        </div>

         Grid de Indicadores 
        <div v-if="indicadoresFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="indicador in indicadoresFiltrados"
            :key="indicador.id"
            class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            @click="verDetalle(indicador)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :class="getSemaforoClass(indicador.estado_semaforo)"></div>
                <h3 class="font-semibold text-gray-900">{{ indicador.nombre }}</h3>
              </div>
              <div class="flex gap-2" @click.stop>
                <button
                  v-if="canEdit"
                  @click="editarIndicador(indicador)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  v-if="canEdit"
                  @click="eliminarIndicador(indicador.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ indicador.descripcion }}</p>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Valor Actual:</span>
                <span class="font-semibold text-gray-900">{{ indicador.valor_actual }} {{ indicador.unidad }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Meta:</span>
                <span class="font-semibold text-gray-900">{{ indicador.meta }} {{ indicador.unidad }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Cumplimiento:</span>
                <span class="font-semibold" :class="getTextClass(indicador.estado_semaforo)">
                  {{ Math.round(indicador.cumplimiento) }}%
                </span>
              </div>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                class="h-2 rounded-full transition-all"
                :class="getSemaforoClass(indicador.estado_semaforo)"
                :style="{ width: Math.min(indicador.cumplimiento, 100) + '%' }"
              ></div>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-600">
              <span>{{ indicador.categoria }}</span>
              <span>{{ indicador.responsable }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p class="text-gray-600">No se encontraron indicadores con los filtros aplicados</p>
        </div>
      </div>

      <div v-if="showHistoricosSection && indicadorHistorico" class="fixed inset-0 bg-white z-[9999] overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" :class="getSemaforoClass(indicadorHistorico.estado_semaforo)"></div>
                {{ indicadorHistorico.nombre }}
              </h2>
              <p class="text-gray-600 mt-2">{{ indicadorHistorico.descripcion }}</p>
            </div>
            <button
              @click="cerrarHistoricos"
              class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver
            </button>
          </div>

           Estadísticas Actuales 
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p class="text-xs text-blue-600 font-medium">Valor Actual</p>
              <p class="text-2xl font-bold text-blue-900">
                {{ indicadorHistorico.valor_actual }} {{ indicadorHistorico.unidad }}
              </p>
            </div>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <p class="text-xs text-green-600 font-medium">Meta</p>
              <p class="text-2xl font-bold text-green-900">
                {{ indicadorHistorico.meta }} {{ indicadorHistorico.unidad }}
              </p>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p class="text-xs text-purple-600 font-medium">Cumplimiento</p>
              <p class="text-2xl font-bold text-purple-900">
                {{ Math.round(indicadorHistorico.cumplimiento) }}%
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p class="text-xs text-gray-600 font-medium">Responsable</p>
              <p class="text-lg font-bold text-gray-900">
                {{ indicadorHistorico.responsable }}
              </p>
            </div>
          </div>

           Gráfico Histórico 
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Evolución Histórica</h3>
              <select v-model="yearsToShow" @change="cargarHistorico(indicadorHistorico.id)" class="p-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                <option :value="1">1 año</option>
                <option :value="3">3 años</option>
                <option :value="5">5 años</option>
                <option :value="10">10 años</option>
                <option :value="20">20 años</option>
              </select>
            </div>
            <IndicatorChart
              v-if="historicoData && historicoData.historicos && historicoData.historicos.length > 0"
              :historicos="historicoData.historicos"
              :metas="historicoData.metas || []"
              :unidad="indicadorHistorico.unidad"
              :loading="loadingHistorico"
              :show-cumplimiento="true"
            />
            <div v-else class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p class="text-gray-600">No hay datos históricos disponibles</p>
            </div>
          </div>

           Tabla de Datos Históricos 
          <div v-if="datosHistoricosTabla.length > 0" class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Datos Históricos Detallados</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium text-gray-900">Período</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-900">Valor</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-900">Meta</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-900">Cumplimiento</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-900">Variación</th>
                    <th class="px-4 py-3 text-center font-medium text-gray-900">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dato, index) in datosHistoricosTabla" :key="index" class="border-t border-gray-200">
                    <td class="px-4 py-3 text-gray-900">{{ dato.periodo }}</td>
                    <td class="px-4 py-3 text-right text-gray-900">{{ dato.valor }} {{ indicadorHistorico.unidad }}</td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ dato.meta }} {{ indicadorHistorico.unidad }}</td>
                    <td class="px-4 py-3 text-right font-semibold" :class="getTextClass(dato.estado)">
                      {{ dato.cumplimiento }}%
                    </td>
                    <td class="px-4 py-3 text-right" :class="dato.variacion >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ dato.variacion > 0 ? '+' : '' }}{{ dato.variacion }}%
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="w-3 h-3 rounded-full mx-auto" :class="getSemaforoClass(dato.estado)"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

           Estadísticas del Período 
          <div v-if="estadisticasHistoricas" class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Período</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">Promedio</p>
                <p class="text-xl font-bold text-gray-900">{{ estadisticasHistoricas.promedio }} {{ indicadorHistorico.unidad }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">Máximo</p>
                <p class="text-xl font-bold text-green-600">{{ estadisticasHistoricas.maximo }} {{ indicadorHistorico.unidad }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">Mínimo</p>
                <p class="text-xl font-bold text-red-600">{{ estadisticasHistoricas.minimo }} {{ indicadorHistorico.unidad }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">Tendencia</p>
                <p class="text-xl font-bold" :class="getTendenciaClass(estadisticasHistoricas.tendencia)">
                  {{ getTendenciaIcon(estadisticasHistoricas.tendencia) }} {{ estadisticasHistoricas.tendencia }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">Volatilidad</p>
                <p class="text-xl font-bold text-gray-900">{{ estadisticasHistoricas.volatilidad }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showDetailModal && indicadorSeleccionado"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9000] p-4"
        @click.self="cerrarModales"
      >
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" :class="getSemaforoClass(indicadorSeleccionado.estado_semaforo)"></div>
                {{ indicadorSeleccionado.nombre }}
              </h2>
              <p class="text-gray-600 mt-2">{{ indicadorSeleccionado.descripcion }}</p>
            </div>
            <button
              @click="cerrarModales"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p class="text-xs text-blue-600 font-medium">Valor Actual</p>
              <p class="text-2xl font-bold text-blue-900">
                {{ indicadorSeleccionado.valor_actual }} {{ indicadorSeleccionado.unidad }}
              </p>
            </div>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <p class="text-xs text-green-600 font-medium">Meta</p>
              <p class="text-2xl font-bold text-green-900">
                {{ indicadorSeleccionado.meta }} {{ indicadorSeleccionado.unidad }}
              </p>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p class="text-xs text-purple-600 font-medium">Cumplimiento</p>
              <p class="text-2xl font-bold text-purple-900">
                {{ Math.round(indicadorSeleccionado.cumplimiento) }}%
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p class="text-xs text-gray-600 font-medium">Responsable</p>
              <p class="text-lg font-bold text-gray-900">
                {{ indicadorSeleccionado.responsable }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="cerrarModales"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 transition-colors"
            >
              Cerrar
            </button>
            <button
              @click="irAHistoricos(indicadorSeleccionado)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Evolución Histórica
            </button>
          </div>
        </div>
      </div>


      <div
        v-if="showCreateModal || showEditModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9000] p-4"
        @click.self="cerrarModales"
      >
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showCreateModal ? 'Nuevo Indicador' : 'Editar Indicador' }}
            </h2>
            <button
              @click="cerrarModales"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="guardarIndicador" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Nombre *</label>
                <input
                  v-model="formulario.nombre"
                  type="text"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Satisfacción del Cliente"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Categoría *</label>
                <select
                  v-model="formulario.categoria"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="Académico">Académico</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Calidad">Calidad</option>
                  <option value="Innovación">Innovación</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Valor Actual *</label>
                <input
                  v-model.number="formulario.valor_actual"
                  type="number"
                  step="0.01"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Meta *</label>
                <input
                  v-model.number="formulario.meta"
                  type="number"
                  step="0.01"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Unidad *</label>
                <input
                  v-model="formulario.unidad"
                  type="text"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: %, puntos, días"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Responsable *</label>
                <input
                  v-model="formulario.responsable"
                  type="text"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Tendencia *</label>
                <select
                  v-model="formulario.tendencia"
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="ascendente">Ascendente</option>
                  <option value="estable">Estable</option>
                  <option value="descendente">Descendente</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Frecuencia</label>
                <select
                  v-model="formulario.frecuencia_medicion"
                  class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
              <textarea
                v-model="formulario.descripcion"
                rows="3"
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del indicador..."
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="cerrarModales"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {{ showCreateModal ? 'Crear' : 'Actualizar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";
import { Chart, registerables } from 'chart.js';
import IndicatorChart from '@/components/charts/IndicatorChart.vue';

Chart.register(...registerables);

export default {
  name: 'IndicadoresEstrategicos',
  components: {
    IndicatorChart
  },
  data() {
    return {
      indicadores: [],
      resumen: null,
      loading: false,
      
      showHistoricosSection: false,
      showDetailModal: false,
      showCreateModal: false,
      showEditModal: false,
      
      filtroCategoria: '',
      filtroEstado: '',
      filtroFechaDesde: '',
      filtroFechaHasta: '',
      
      indicadorSeleccionado: null,
      indicadorHistorico: null,
      yearsToShow: 5,
      
      formulario: {
        id: null,
        nombre: '',
        descripcion: '',
        valor_actual: 0,
        meta: 0,
        unidad: '',
        categoria: '',
        tendencia: 'ascendente',
        responsable: '',
        frecuencia_medicion: 'mensual'
      },
      
      estadosChart: null,
      categoriasChart: null,
      historicoData: null,
      loadingHistorico: false,
      userRole: 'directivos',
      baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''
    };
  },
  computed: {
    canEdit() {
      return this.userRole === 'admin' || this.userRole === 'directivos' || this.userRole === 'planeacion';
    },
    categoriasDisponibles() {
      return [...new Set(this.indicadores.map(ind => ind.categoria).filter(Boolean))];
    },
    indicadoresFiltrados() {
      return this.indicadores.filter(ind => {
        const matchCategoria = !this.filtroCategoria || ind.categoria === this.filtroCategoria;
        const matchEstado = !this.filtroEstado || ind.estado_semaforo === this.filtroEstado;
        
        let matchFecha = true;
        if (this.filtroFechaDesde || this.filtroFechaHasta) {
          const fechaInd = new Date(ind.fecha_actualizacion);
          if (this.filtroFechaDesde) {
            matchFecha = matchFecha && fechaInd >= new Date(this.filtroFechaDesde);
          }
          if (this.filtroFechaHasta) {
            matchFecha = matchFecha && fechaInd <= new Date(this.filtroFechaHasta);
          }
        }

        return matchCategoria && matchEstado && matchFecha;
      });
    },
    topMejores() {
      return [...this.indicadores]
        .sort((a, b) => b.cumplimiento - a.cumplimiento)
        .slice(0, 5);
    },
    topPeores() {
      return [...this.indicadores]
        .sort((a, b) => a.cumplimiento - b.cumplimiento)
        .slice(0, 5);
    },
    datosHistoricosTabla() {
      if (!this.historicoData || !this.historicoData.historicos) return [];
      
      return this.historicoData.historicos.map((h, index) => {
        const meta = this.historicoData.metas && this.historicoData.metas[index] 
          ? this.historicoData.metas[index].valor 
          : this.indicadorHistorico.meta;
        
        const cumplimiento = meta > 0 ? Math.round((h.valor / meta) * 100) : 0;
        const estado = this.getEstado(cumplimiento);
        
        let variacion = 0;
        if (index > 0) {
          const valorAnterior = this.historicoData.historicos[index - 1].valor;
          variacion = valorAnterior > 0 
            ? Math.round(((h.valor - valorAnterior) / valorAnterior) * 100) 
            : 0;
        }
        
        return {
          periodo: h.periodo,
          valor: h.valor,
          meta: meta,
          cumplimiento: cumplimiento,
          estado: estado,
          variacion: variacion
        };
      });
    },
    estadisticasHistoricas() {
      if (!this.historicoData || !this.historicoData.historicos || this.historicoData.historicos.length === 0) {
        return null;
      }
      
      const valores = this.historicoData.historicos.map(h => h.valor);
      const promedio = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);
      const maximo = Math.max(...valores).toFixed(2);
      const minimo = Math.min(...valores).toFixed(2);
      
      let tendencia = 'estable';
      if (valores.length >= 2) {
        const primerValor = valores[0];
        const ultimoValor = valores[valores.length - 1];
        const diferencia = ((ultimoValor - primerValor) / primerValor) * 100;
        
        if (diferencia > 5) tendencia = 'ascendente';
        else if (diferencia < -5) tendencia = 'descendente';
      }
      
      const media = parseFloat(promedio);
      const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
      const desviacion = Math.sqrt(varianza);
      const volatilidad = media > 0 ? ((desviacion / media) * 100).toFixed(2) : 0;
      
      return {
        promedio,
        maximo,
        minimo,
        tendencia,
        volatilidad
      };
    }
  },
  async mounted() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role) this.userRole = decoded.role;
      } catch (e) {
        console.error("Error al decodificar token:", e);
      }
    }
    await this.cargarDatos();
  },
  beforeUnmount() {
    if (this.estadosChart) {
      this.estadosChart.destroy();
    }
    if (this.categoriasChart) {
      this.categoriasChart.destroy();
    }
  },
  methods: {
    async cargarDatos() {
      this.loading = true;
      const token = localStorage.getItem('access_token');
      
      try {
        if (!token) throw new Error("No token");

        const response = await fetch(`${this.baseUrl}/indicators/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        this.indicadores = await response.json();

        const resumenResponse = await fetch(`${this.baseUrl}/indicators/resumen`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.resumen = resumenResponse.ok ? await resumenResponse.json() : null;

        await this.$nextTick();
        this.renderCharts();
      } catch (err) {
        console.error("Error cargando datos:", err.message);
      } finally {
        this.loading = false;
      }
    },

    async cargarHistorico(indicadorId) {
      this.loadingHistorico = true;
      const token = localStorage.getItem('access_token');
      
      try {
        const response = await fetch(`${this.baseUrl}/indicators/${indicadorId}/history?years=${this.yearsToShow}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        this.historicoData = await response.json();
      } catch (err) {
        console.error("Error cargando histórico:", err.message);
      } finally {
        this.loadingHistorico = false;
      }
    },

    renderCharts() {
      this.$nextTick(() => {
        this.renderEstadosChart();
        this.renderCategoriasChart();
      });
    },

    renderEstadosChart() {
      const canvas = document.getElementById('estadosChart');
      if (!canvas || !this.resumen) return;

      if (this.estadosChart) {
        this.estadosChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');

      this.estadosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['En Meta', 'En Progreso', 'Críticos'],
          datasets: [{
            data: [this.resumen.verde, this.resumen.amarillo, this.resumen.rojo],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(234, 179, 8)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: isDarkMode ? '#d1d5db' : '#374151',
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDarkMode ? '#d1d5db' : '#374151',
              bodyColor: isDarkMode ? '#d1d5db' : '#374151',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1
            }
          }
        }
      });
    },

    renderCategoriasChart() {
      const canvas = document.getElementById('categoriasChart');
      if (!canvas || !this.indicadores.length) return;

      if (this.categoriasChart) {
        this.categoriasChart.destroy();
      }

      const cumplimientoPorCategoria = {};
      this.indicadores.forEach(ind => {
        const cat = ind.categoria || 'Sin categoría';
        if (!cumplimientoPorCategoria[cat]) {
          cumplimientoPorCategoria[cat] = { suma: 0, count: 0 };
        }
        cumplimientoPorCategoria[cat].suma += ind.cumplimiento;
        cumplimientoPorCategoria[cat].count += 1;
      });

      const labels = Object.keys(cumplimientoPorCategoria);
      const data = labels.map(cat => 
        cumplimientoPorCategoria[cat].suma / cumplimientoPorCategoria[cat].count
      );

      const ctx = canvas.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');

      this.categoriasChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '% Cumplimiento Promedio',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDarkMode ? '#d1d5db' : '#374151',
              bodyColor: isDarkMode ? '#d1d5db' : '#374151',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  return `Cumplimiento: ${context.parsed.y.toFixed(2)}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 120,
              ticks: {
                color: isDarkMode ? '#d1d5db' : '#374151',
                callback: (value) => value + '%'
              },
              grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              ticks: {
                color: isDarkMode ? '#d1d5db' : '#374151'
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    },

    calcularPorcentaje(valor, total) {
      if (!total) return 0;
      return Math.round((valor / total) * 100);
    },

    getSemaforoClass(estado) {
      return {
        'verde': 'bg-green-500',
        'amarillo': 'bg-yellow-500',
        'rojo': 'bg-red-500'
      }[estado] || 'bg-gray-500';
    },

    getTextClass(estado) {
      return {
        'verde': 'text-green-600',
        'amarillo': 'text-yellow-600',
        'rojo': 'text-red-600'
      }[estado] || 'text-gray-600';
    },

    getTendenciaClass(tendencia) {
      return {
        'ascendente': 'text-green-600',
        'estable': 'text-blue-600',
        'descendente': 'text-red-600'
      }[tendencia] || 'text-gray-600';
    },

    getTendenciaIcon(tendencia) {
      return {
        'ascendente': '↗',
        'estable': '→',
        'descendente': '↘'
      }[tendencia] || '→';
    },

    getEstado(cumplimiento) {
      if (cumplimiento >= 90) return 'verde';
      if (cumplimiento >= 70) return 'amarillo';
      return 'rojo';
    },

    formatDate(fecha) {
      if (!fecha) return 'N/A';
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    verDetalle(indicador) {
      this.indicadorSeleccionado = indicador;
      this.showDetailModal = true;
    },

    async irAHistoricos(indicador) {
      this.indicadorHistorico = indicador;
      this.showDetailModal = false;
      this.showHistoricosSection = true;
      await this.cargarHistorico(indicador.id);
    },

    cerrarHistoricos() {
      this.showHistoricosSection = false;
      this.indicadorHistorico = null;
      this.historicoData = null;
    },

    abrirModalCrear() {
      this.showCreateModal = true;
      this.formulario = {
        id: null,
        nombre: '',
        descripcion: '',
        valor_actual: 0,
        meta: 0,
        unidad: '',
        categoria: '',
        tendencia: 'ascendente',
        responsable: '',
        frecuencia_medicion: 'mensual'
      };
    },

    editarIndicador(indicador) {
      this.showEditModal = true;
      this.formulario = {
        id: indicador.id,
        nombre: indicador.nombre,
        descripcion: indicador.descripcion || '',
        valor_actual: indicador.valor_actual,
        meta: indicador.meta,
        unidad: indicador.unidad,
        categoria: indicador.categoria,
        tendencia: indicador.tendencia || 'ascendente',
        responsable: indicador.responsable,
        frecuencia_medicion: indicador.frecuencia_medicion || 'mensual'
      };
    },

    async eliminarIndicador(id) {
      if (!confirm('¿Estás seguro de eliminar este indicador?')) return;

      const token = localStorage.getItem('access_token');
      
      try {
        const response = await fetch(`${this.baseUrl}/indicators/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        await this.cargarDatos();
      } catch (err) {
        console.error("Error eliminando indicador:", err.message);
        alert('Error al eliminar el indicador');
      }
    },

    async guardarIndicador() {
      const token = localStorage.getItem('access_token');
      
      try {
        const url = this.showEditModal 
          ? `${this.baseUrl}/indicators/${this.formulario.id}`
          : `${this.baseUrl}/indicators/`;
        
        const method = this.showEditModal ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formulario)
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        await this.cargarDatos();
        this.cerrarModales();
      } catch (err) {
        console.error("Error guardando indicador:", err.message);
        alert('Error al guardar el indicador');
      }
    },

    cerrarModales() {
      this.showDetailModal = false;
      this.showCreateModal = false;
      this.showEditModal = false;
      this.indicadorSeleccionado = null;
      this.formulario = {
        id: null,
        nombre: '',
        descripcion: '',
        valor_actual: 0,
        meta: 0,
        unidad: '',
        categoria: '',
        tendencia: 'ascendente',
        responsable: '',
        frecuencia_medicion: 'mensual'
      };
    },

    exportData() {
      const csv = this.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `indicadores_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    exportToCSV() {
      const headers = ['Nombre', 'Categoría', 'Valor Actual', 'Meta', 'Unidad', 'Cumplimiento', 'Estado', 'Responsable'];
      const rows = this.indicadores.map(ind => [
        ind.nombre,
        ind.categoria,
        ind.valor_actual,
        ind.meta,
        ind.unidad,
        Math.round(ind.cumplimiento) + '%',
        ind.estado_semaforo,
        ind.responsable
      ]);
      
      return [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
    }
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>