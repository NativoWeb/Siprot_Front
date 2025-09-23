<template>
  <form @submit.prevent="saveProgram" class="space-y-6 bg-white p-6 rounded-lg shadow">
    <!-- Added dynamic title and cancel button for edit mode -->
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

      <!-- Added program_date field for program creation date -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Fecha de creación</label>
        <input 
          v-model="form.program_date" 
          type="date" 
          class="input w-full" 
          required 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Sector</label>
        <input v-model="form.sector" placeholder="Sector" class="input w-full" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Nivel</label>
        <input v-model="form.level" placeholder="Tecnólogo, Especialización, etc." class="input w-full" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Línea estratégica</label>
        <input v-model="form.core_line" placeholder="Línea estratégica" class="input w-full" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Capacidad (Cupos)</label>
        <input v-model.number="form.capacity" type="number" placeholder="Cantidad de cupos" class="input w-full" min="0" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Región</label>
        <input v-model="form.region" placeholder="Región" class="input w-full" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600">Cantidad de estudiantes</label>
        <input v-model.number="form.current_students" type="number" placeholder="Número de estudiantes" class="input w-full" min="0" />
      </div>
    </div>

    <!-- Descripción ocupa todo el ancho -->
    <div>
      <label class="block text-sm font-medium text-gray-600">Descripción</label>
      <textarea v-model="form.description" placeholder="Descripción del programa" class="input w-full h-24"></textarea>
    </div>

    <div class="flex justify-end">
      <!-- Dynamic button text based on edit mode -->
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
        program_date: "", // Added program_date field
        sector: "", 
        level: "",
        core_line: "", 
        capacity: 0,
        region: "",
        description: "",
        current_students: 0,
      }
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
            // Convert datetime to date format (YYYY-MM-DD) for input[type="date"]
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
    if (!this.editMode) {
      this.form.program_date = new Date().toISOString().split('T')[0];
    }
  },
  methods: {
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
        program_date: new Date().toISOString().split('T')[0], // Set default to today
        sector: "", 
        level: "", 
        core_line: "", 
        capacity: 0, 
        region: "", 
        description: "", 
        current_students: 0 
      };
    }
  }
};
</script>
