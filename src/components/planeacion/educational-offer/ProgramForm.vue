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
          this.form = { ...newProgram };
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    async saveProgram() {
      try {
        if (this.editMode) {
          await axios.put(`http://localhost:8000/programs/${this.editProgram.id}`, this.form, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          });
        } else {
          await axios.post("http://localhost:8000/programs/", this.form, {
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
