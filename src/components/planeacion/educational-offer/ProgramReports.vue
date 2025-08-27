<template>
  <div>
    <p class="text-gray-600">Reportes estratégicos próximamente...</p>
    <button @click="generateReport" class="btn-primary mt-2">Generar Reporte</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  methods: {
    async generateReport() {
      try {
        const res = await axios.get("http://localhost:8000/programs/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        console.log("Datos para reporte:", res.data);
        alert("Reporte generado en consola 🚀");
      } catch (err) {
        console.error("Error generando reporte:", err);
      }
    }
  }
};
</script>
