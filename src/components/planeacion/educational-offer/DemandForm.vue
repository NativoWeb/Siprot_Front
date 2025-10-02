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

    <!-- Documento Fuente con búsqueda -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Documento Fuente</label>
      <v-select
        v-model="form.source_document_id"
        :options="documents"
        label="title"
        :reduce="doc => doc.id"
        placeholder="Buscar documento..."
        :get-option-label="doc => `${doc.title} (${doc.year} - ${doc.sector})`"
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
import vSelect from "vue3-select";
import "vue3-select/dist/vue3-select.css";

export default {
  components: { vSelect },
  data() {
    return {
      form: {
        sector: "",
        year: new Date().getFullYear(),
        demand_value: 0,
        source_document_id: null,
        notes: ""
      },
      documents: []
    };
  },
  async created() {
    try {
      const res = await axios.get("http://localhost:8000/documents", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      this.documents = res.data;
    } catch (err) {
      console.error("Error cargando documentos:", err);
    }
  },
  methods: {
    async saveDemand() {
      try {
        await axios.post("http://localhost:8000/demand-indicators", this.form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        this.$emit("saved");
        this.form = { sector: "", year: new Date().getFullYear(), demand_value: 0, source_document_id: null, notes: "" };
      } catch (err) {
        console.error("Error guardando indicador de demanda:", err);
        alert("No se pudo guardar el indicador.");
      }
    }
  }
};
</script>