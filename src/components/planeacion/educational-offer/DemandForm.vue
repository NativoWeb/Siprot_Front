<template>
  <form @submit.prevent="saveDemand" class="space-y-4">
    <!-- Sector -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Sector</label>
      <input 
        v-model="form.sector" 
        class="border p-2 rounded w-full"
        placeholder="Ej: Agropecuario"
        required
      />
    </div>

    <!-- Año -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Año</label>
      <input 
        type="number" 
        v-model="form.year" 
        class="border p-2 rounded w-full"
        required
      />
    </div>

    <!-- Demanda -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Demanda (valor)</label>
      <input 
        type="number" 
        step="0.01"
        v-model="form.demand_value" 
        class="border p-2 rounded w-full"
        required
      />
    </div>

    <!-- Fuente (opcional) -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Fuente (opcional)</label>
      <input 
        v-model="form.source" 
        class="border p-2 rounded w-full"
        placeholder="Ej: DANE, MinEducación"
      />
    </div>

    <!-- Botón -->
    <button 
      type="submit" 
      class="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Guardar indicador
    </button>
  </form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        sector: "",
        year: new Date().getFullYear(),
        demand_value: 0,
        source: ""
      }
    };
  },
  methods: {
    async saveDemand() {
      try {
        await axios.post("http://localhost:8000/demand-indicators", this.form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        this.$emit("saved");
        // Reiniciar formulario
        this.form = { sector: "", year: new Date().getFullYear(), demand_value: 0, source: "" };
      } catch (err) {
        console.error("Error guardando indicador de demanda:", err);
        alert("No se pudo guardar el indicador.");
      }
    }
  }
};
</script>
