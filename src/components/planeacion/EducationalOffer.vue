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

      <!-- Added bulk upload component for file processing -->
      <div v-if="userRole === 'planeacion'">
        <ProgramBulkUpload @uploaded="loadPrograms" />
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow-md rounded-xl p-4 flex flex-wrap items-center gap-4">
        <ProgramFilters :sectors="sectors" :levels="levels" v-model="filters" />
        <button
          class="ml-auto px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
          @click="filters = { sector: '', level: '' }"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-white shadow-md rounded-xl p-4">
        <ProgramTable
          :programs="filteredPrograms"
          :user-role="userRole"
          @updated="loadPrograms"
          @edit="handleEditProgram"
        />
      </div>

      <!-- Gráficas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white shadow-md rounded-xl p-4">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">Distribución por Sector</h2>
          <ProgramCharts :programs="filteredPrograms" chart-type="bar" />
        </div>
        <div class="bg-white shadow-md rounded-xl p-4">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">Tendencia de Programas</h2>
          <ProgramCharts :programs="filteredPrograms" chart-type="line" />
        </div>
      </div>

      <!-- Reportes -->
      <div class="bg-white shadow-md rounded-xl p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Reportes estratégicos</h2>
        <ProgramReports />
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

export default {
  components: { 
    ProgramForm, 
    ProgramTable, 
    ProgramFilters, 
    ProgramCharts, 
    ProgramReports,
    ProgramBulkUpload
  },
  data() {
    return {
      programs: [],
      filters: { sector: "", level: "" },
      userRole: localStorage.getItem("role"),
      editingProgram: null,
    };
  },
  computed: {
    filteredPrograms() {
      if (!Array.isArray(this.programs)) return [];
      return this.programs.filter(p =>
        (!this.filters.sector || p.sector === this.filters.sector) &&
        (!this.filters.level || p.level === this.filters.level)
      );
    },
    sectors() {
      if (!Array.isArray(this.programs)) return [];
      return [...new Set(this.programs.map(p => p.sector))];
    },
    levels() {
      if (!Array.isArray(this.programs)) return [];
      return [...new Set(this.programs.map(p => p.level))];
    }
  },
  methods: {
    async loadPrograms() {
      try {
        const res = await axios.get("http://localhost:8000/programs/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });

        this.programs = Array.isArray(res.data) ? res.data : res.data.items || [];
      } catch (err) {
        console.error("Error cargando programas:", err);
        this.programs = [];
      }
    },
    handleEditProgram(program) {
      this.editingProgram = program;
      this.$nextTick(() => {
        const formElement = document.querySelector('.educational-offer .bg-white');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    handleProgramSaved() {
      this.loadPrograms();
      this.editingProgram = null;
    },
    cancelEdit() {
      this.editingProgram = null;
    }
  },
  mounted() {
    this.loadPrograms();
  }
};
</script>
