<template>
  <form @submit.prevent="saveProgram" class="space-y-6 bg-white p-6 rounded-lg shadow">
    <!-- Título dinámico y botón cancelar -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">
        {{ editMode ? 'Editar Programa' : 'Registrar Programa' }}
      </h2>
      <button 
        v-if="editMode" 
        type="button" 
        @click="cancelEdit"
        class="text-gray-500 hover:text-gray-700 text-sm"
      >
        Cancelar
      </button>
    </div>

    <!-- Grid de 2 columnas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-600">Código</label>
        <input v-model="form.code" placeholder="Código" class="input w-full" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Nombre</label>
        <input v-model="form.name" placeholder="Nombre del programa" class="input w-full" required />
      </div>

      <!-- Fecha creación -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Fecha de creación</label>
        <input 
          v-model="form.program_date" 
          type="date" 
          class="input w-full" 
          required 
        />
      </div>

      <!-- Sector (select dinámico) -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Sector</label>
        <select v-model="form.sector_id" class="input w-full" required>
          <option disabled value="">Seleccione un sector</option>
          <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
            {{ sector.name }}
          </option>
        </select>
      </div>

      <!-- Nivel -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Nivel</label>
        <input v-model="form.level" placeholder="Tecnólogo, Técnico, etc." class="input w-full" required />
      </div>

      <!-- Línea Medular (select dinámico) -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Línea estratégica</label>
        <select v-model="form.core_line_id" class="input w-full" required>
          <option disabled value="">Seleccione una línea estratégica</option>
          <option v-for="line in coreLines" :key="line.id" :value="line.id">
            {{ line.name }}
          </option>
        </select>
      </div>

      <!-- Capacidad -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Capacidad (Cupos)</label>
        <input v-model.number="form.capacity" type="number" placeholder="Cantidad de cupos" class="input w-full" min="0" required />
      </div>

      <!-- Región -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Región</label>
        <input v-model="form.region" placeholder="Región" class="input w-full" />
      </div>

      <!-- Cantidad de estudiantes -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Cantidad de estudiantes</label>
        <input v-model.number="form.current_students" type="number" placeholder="Número de estudiantes" class="input w-full" min="0" />
      </div>
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-600">Descripción</label>
      <textarea v-model="form.description" placeholder="Descripción del programa" class="input w-full h-24"></textarea>
    </div>

    <!-- Botón guardar -->
    <div class="flex justify-end">
      <button type="submit" class="btn-primary px-6 py-2">
        {{ editMode ? 'Actualizar' : 'Guardar' }}
      </button>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  props: {
    editProgram: {
      type: Object,
      default: null
    }
  },
  emits: ["saved", "cancelled"],
  data() {
    return {
      form: { 
        code: "", 
        name: "", 
        program_date: new Date().toISOString().split('T')[0],
        sector_id: "",   // 🔹 sector por ID
        level: "",
        core_line_id: "", // 🔹 línea medular por ID
        capacity: 0,
        region: "",
        description: "",
        current_students: 0,
      },
      sectors: [],
      coreLines: []
    };
  },
  computed: {
    editMode() {
      return this.editProgram !== null;
    }
  },
  watch: {
    editProgram: {
      handler(newProgram) {
        if (newProgram) {
          const programData = { ...newProgram };
          if (programData.program_date) {
            programData.program_date = new Date(programData.program_date).toISOString().split('T')[0];
          }
          this.form = programData;
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.loadCatalogs();
    if (!this.editMode) {
      this.form.program_date = new Date().toISOString().split('T')[0];
    }
  },
  methods: {
    async loadCatalogs() {
      try {
        const res = await axios.get("http://localhost:8000/catalogs/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        this.sectors = res.data.sectors;
        this.coreLines = res.data.core_lines;
      } catch (err) {
        console.error("Error cargando catálogos:", err.response?.data || err.message);
      }
    },
    async saveProgram() {
      try {
        const formData = { ...this.form };
        if (formData.program_date) {
          formData.program_date = new Date(formData.program_date).toISOString(); 
        }

        if (this.editMode) {
          await axios.put(`http://localhost:8000/programs/${this.editProgram.id}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          });
        } else {
          await axios.post("http://localhost:8000/programs/", formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          });
        }
        this.$emit("saved");
        this.resetForm();
      } catch (err) {
        console.error("Error guardando programa:", err.response?.data || err.message);
      }
    },
    cancelEdit() {
      this.$emit("cancelled");
      this.resetForm();
    },
    resetForm() {
      this.form = { 
        code: "", 
        name: "", 
        program_date: new Date().toISOString().split('T')[0],
        sector_id: "", 
        level: "", 
        core_line_id: "", 
        capacity: 0, 
        region: "", 
        description: "", 
        current_students: 0 
      };
    }
  }
};
</script>
