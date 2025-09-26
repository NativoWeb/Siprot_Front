<template>
  <div class="educational-offer p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Título -->
      <h1 class="text-2xl font-bold text-gray-800">Análisis de Oferta Educativa</h1>

      <!-- Formulario (solo Planeación) -->
      <div v-if="userRole === 'planeacion'" class="bg-white shadow-md rounded-xl p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Registrar nuevo programa</h2>
        <ProgramForm 
          :editProgram="editingProgram" 
          @saved="handleProgramSaved" 
          @cancelled="cancelEdit" 
        />
      </div>

      <!-- Carga masiva -->
      <div v-if="userRole === 'planeacion'">
        <ProgramBulkUpload @uploaded="refreshAllData" />
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow-md rounded-xl p-4 flex flex-wrap items-center gap-4">
        <ProgramFilters :sectors="sectors" :levels="levels" v-model="filters" />
        <button
          class="ml-auto px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-white shadow-md rounded-xl p-4">
        <ProgramTable
          :programs="programs"
          :user-role="userRole"
          @updated="refreshAllData"
          @edit="handleEditProgram"
        />
      </div>

      <!-- Pestañas de análisis -->
      <div class="bg-white shadow-md rounded-xl p-4">
        <div class="border-b border-gray-200 mb-4">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in analysisTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Matriz -->
        <div v-if="activeTab === 'matrix'">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">📊 Matriz Sector vs Línea Medular</h2>
          <table v-if="Object.keys(analysisMatrix).length" class="w-full border-collapse border">
            <thead>
              <tr>
                <th class="border px-3 py-2">Sector</th>
                <th v-for="coreLine in Object.keys(Object.values(analysisMatrix)[0])" :key="coreLine" class="border px-3 py-2">
                  {{ coreLine }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lines, sector) in analysisMatrix" :key="sector">
                <td class="border px-3 py-2 font-semibold">{{ sector }}</td>
                <td v-for="(count, coreLine) in lines" :key="coreLine" class="border px-3 py-2 text-center">{{ count }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-gray-500">No hay datos disponibles.</p>
        </div>

        <!-- Comparación demanda -->
        <div v-if="activeTab === 'demand'">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">📈 Comparación Oferta vs Demanda</h2>
          <table v-if="demandComparison.length" class="w-full border-collapse border">
            <thead class="bg-gray-200">
              <tr>
                <th class="border px-3 py-2">Sector</th>
                <th class="border px-3 py-2">Programas</th>
                <th class="border px-3 py-2">Estudiantes</th>
                <th class="border px-3 py-2">Demanda</th>
                <th class="border px-3 py-2">Brecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in demandComparison" :key="d.sector" class="hover:bg-gray-50">
                <td class="border px-3 py-2 font-semibold">{{ d.sector }}</td>
                <td class="border px-3 py-2 text-center">{{ d.programs }}</td>
                <td class="border px-3 py-2 text-center">{{ d.current_students }}</td>
                <td class="border px-3 py-2 text-center">{{ d.demand_value }}</td>
                <td class="border px-3 py-2 text-center" :class="d.gap > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">{{ d.gap }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-gray-500">No hay datos disponibles.</p>
        </div>

        <!-- Gráficos -->
        <div v-if="activeTab === 'charts'">
          <ProgramCharts :programs="programs" />
        </div>

        <!-- Proyecciones ML -->
        <div v-if="activeTab === 'projections'">
          <ProgramProjections ref="projectionsTab" :programs="programs" />
        </div>
      </div>

      <!-- Reportes estratégicos -->
      <div class="bg-white shadow-md rounded-xl p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">📋 Reportes y Alineación Estratégica</h2>
        <ProgramReports :programs="programs" :analysis-matrix="analysisMatrix" :demand-comparison="demandComparison" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProgramForm from "../planeacion/educational-offer/ProgramForm.vue";
import ProgramTable from "../planeacion/educational-offer/ProgramTable.vue";
import ProgramFilters from "../planeacion/educational-offer/ProgramFilters.vue";
import ProgramCharts from "../planeacion/educational-offer/ProgramCharts.vue";
import ProgramReports from "../planeacion/educational-offer/ProgramReports.vue";
import ProgramBulkUpload from "../planeacion/educational-offer/ProgramBulkUpload.vue";
import ProgramProjections from "../planeacion/educational-offer/ProgramProjections.vue";

export default {
  components: { 
    ProgramForm, 
    ProgramTable, 
    ProgramFilters, 
    ProgramCharts, 
    ProgramReports,
    ProgramBulkUpload,
    ProgramProjections
  },
  data() {
    return {
      programs: [],
      filters: { sector: "", level: "", region: "" },
      userRole: localStorage.getItem("role"),
      editingProgram: null,
      analysisMatrix: {},
      demandComparison: [],
      activeTab: 'matrix',
      analysisTabs: [
        { id: 'matrix', name: 'Matriz Sectorial' },
        { id: 'demand', name: 'Oferta vs Demanda' },
        { id: 'charts', name: 'Gráficos de Análisis' },
        { id: 'projections', name: 'Proyecciones 10 años' }
      ]
    };
  },
  computed: {
    sectors() {
      return [...new Set(this.programs.map(p => p.sector))];
    },
    levels() {
      return [...new Set(this.programs.map(p => p.level))];
    }
  },
  methods: {
    clearFilters() {
      this.filters = { sector: "", level: "", region: "" };
      this.refreshAllData();
    },
    async loadPrograms() {
      try {
        const res = await axios.get("http://localhost:8000/programs/analysis/filtered", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          params: {
            sector: this.filters.sector || undefined,
            level: this.filters.level || undefined,
            region: this.filters.region || undefined
          }
        });
        this.programs = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error cargando programas:", err);
        this.programs = [];
      }
    },
    async loadAnalysisMatrix() {
      try {
        const res = await axios.get("http://localhost:8000/programs/analysis/matrix", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        this.analysisMatrix = res.data;
      } catch (err) {
        console.error("Error cargando matriz:", err);
      }
    },
    async loadDemandComparison() {
      try {
        const res = await axios.get("http://localhost:8000/programs/analysis/demand-comparison", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          params: { year: new Date().getFullYear() }
        });
        this.demandComparison = res.data;
      } catch (err) {
        console.error("Error cargando comparación oferta/demanda:", err);
      }
    },
    handleEditProgram(program) {
      this.editingProgram = program;
      this.$nextTick(() => {
        const formElement = document.querySelector('.educational-offer .bg-white');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
      });
    },
    handleProgramSaved() {
      this.refreshAllData();
      this.editingProgram = null;
    },
    cancelEdit() {
      this.editingProgram = null;
    },
    async refreshAllData() {
      await this.loadPrograms();
      await this.loadAnalysisMatrix();
      await this.loadDemandComparison();
      // Refrescar proyecciones
      this.$refs.projectionsTab?.loadProjections();
    }
  },
  mounted() {
    this.refreshAllData();
  }
};
</script>
