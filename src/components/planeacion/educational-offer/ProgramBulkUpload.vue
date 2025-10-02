<template>
  <div class="bulk-upload bg-white shadow-md rounded-xl p-6">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">
      Carga masiva de {{ typeName }}
    </h2>

    <!-- Información sobre el formato -->
    <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-medium text-blue-800 mb-2">Formatos de archivo permitidos:</h3>
      <p class="text-sm text-blue-700 mb-2">El archivo debe contener las siguientes columnas según el tipo:</p>

      <!-- Formato de Programas -->
      <div class="mb-3">
        <h4 class="text-sm font-semibold text-blue-700 mb-1">Programas:</h4>
        <ul class="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>code</strong> - Código del programa (obligatorio)</li>
          <li><strong>name</strong> - Nombre del programa (obligatorio)</li>
          <li><strong>sector</strong> - Sector educativo (obligatorio)</li>
          <li><strong>level</strong> - Nivel académico (obligatorio)</li>
          <li><strong>core_line</strong> - Línea estratégica (obligatorio)</li>
          <li><strong>capacity</strong> - Capacidad de cupos (número)</li>
          <li><strong>region</strong> - Región (opcional)</li>
          <li><strong>description</strong> - Descripción (opcional)</li>
          <li><strong>current_students</strong> - Estudiantes actuales (número, opcional)</li>
          <li><strong>program_date</strong> - Fecha de creación del programa (YYYY-MM-DD, obligatorio)</li>
        </ul>
      </div>

      <!-- Formato de Indicadores de Demanda -->
      <div>
        <h4 class="text-sm font-semibold text-blue-700 mb-1">Indicadores de Demanda:</h4>
        <ul class="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>sector</strong> - Sector (obligatorio)</li>
          <li><strong>indicator_value</strong> - Valor del indicador (número, opcional)</li>
          <li><strong>source_document_id</strong> - ID del documento fuente (opcional)</li>
          <li><strong>demand_value</strong> - Valor de la demanda (número, opcional)</li>
          <li><strong>year</strong> - Año (YYYY, obligatorio)</li>
        </ul>
      </div>
    </div>

    <!-- Área de carga de archivo -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">
        Seleccionar archivo (CSV o Excel)
      </label>
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleFileDrop"
      >
        <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" @change="handleFileSelect" class="hidden" />
        <div v-if="!selectedFile">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="text-gray-600 mb-2">Arrastra tu archivo aquí o</p>
          <button type="button" @click="$refs.fileInput.click()" class="text-blue-600 hover:text-blue-700 font-medium">
            selecciona un archivo
          </button>
        </div>
        <div v-else class="space-y-2">
          <p class="text-green-600 font-medium">✓ {{ selectedFile.name }}</p>
          <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
          <button type="button" @click="clearFile" class="text-red-600 hover:text-red-700 text-sm">
            Remover archivo
          </button>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="clearFile"
        class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        :disabled="!selectedFile || isProcessing"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="processFile"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!selectedFile || isProcessing"
      >
        {{ isProcessing ? 'Procesando...' : 'Procesar archivo' }}
      </button>
    </div>

    <!-- Resultados del procesamiento -->
    <div v-if="processingResult" class="mt-6 p-4 rounded-lg" :class="processingResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
      <h3 class="font-medium mb-2" :class="processingResult.success ? 'text-green-800' : 'text-red-800'">
        {{ processingResult.success ? '✓ Procesamiento exitoso' : '✗ Error en el procesamiento' }}
      </h3>
      <p class="text-sm" :class="processingResult.success ? 'text-green-700' : 'text-red-700'">
        {{ processingResult.message }}
      </p>
      <div v-if="processingResult.errors && processingResult.errors.length > 0" class="mt-3">
        <h4 class="text-sm font-medium text-red-800 mb-2">Errores encontrados:</h4>
        <ul class="text-sm text-red-700 space-y-1">
          <li v-for="(error, index) in processingResult.errors" :key="index"> • {{ error }} </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "BulkUpload",
  props: {
    type: {
      type: String,
      default: "programs", // "programs" o "demand_indicators"
    },
  },
  emits: ["uploaded"],
  data() {
    return {
      selectedFile: null,
      isDragOver: false,
      isProcessing: false,
      processingResult: null,
    };
  },
  computed: {
    typeName() {
      return this.type === "programs" ? "programas" : "indicadores de demanda";
    },
    columns() {
      if (this.type === "programs") {
        return [
          { name: "code", desc: "Código del programa (obligatorio)" },
          { name: "name", desc: "Nombre del programa (obligatorio)" },
          { name: "sector", desc: "Sector educativo (obligatorio)" },
          { name: "level", desc: "Nivel académico (obligatorio)" },
          { name: "core_line", desc: "Línea estratégica (obligatorio)" },
          { name: "capacity", desc: "Capacidad de cupos (número)" },
          { name: "region", desc: "Región (opcional)" },
          { name: "description", desc: "Descripción (opcional)" },
          { name: "current_students", desc: "Estudiantes actuales (número, opcional)" },
          { name: "program_date", desc: "Fecha de creación del programa (YYYY-MM-DD, obligatorio)" },
        ];
      } else {
        return [
          { name: "sector", desc: "Sector (obligatorio)" },
          { name: "indicator_value", desc: "Valor del indicador (número, opcional)" },
          { name: "source_document_id", desc: "ID del documento fuente (opcional)" },
          { name: "demand_value", desc: "Valor de la demanda (número, opcional)" },
          { name: "year", desc: "Año (YYYY, obligatorio)" },
        ];
      }
    },
  },
  methods: {
    handleFileDrop(event) {
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) this.selectFile(files[0]);
    },
    handleFileSelect(event) {
      const files = event.target.files;
      if (files.length > 0) this.selectFile(files[0]);
    },
    selectFile(file) {
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert("Por favor selecciona un archivo CSV o Excel (.csv, .xlsx, .xls)");
        return;
      }
      this.selectedFile = file;
      this.processingResult = null;
    },
    clearFile() {
      this.selectedFile = null;
      this.processingResult = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    async processFile() {
      if (!this.selectedFile) return;
      this.isProcessing = true;
      this.processingResult = null;

      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        const url =
          this.type === "programs"
            ? "http://localhost:8000/programs/bulk-upload"
            : "http://localhost:8000/demand-indicators/bulk-upload";

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        this.processingResult = {
          success: true,
          message: response.data.message,
          errors: response.data.errors || [],
        };

        this.$emit("uploaded");
        setTimeout(() => this.clearFile(), 3000);
      } catch (error) {
        console.error("Error procesando archivo:", error);
        this.processingResult = {
          success: false,
          message: error.response?.data?.detail || "Error al procesar el archivo",
          errors: error.response?.data?.errors || [],
        };
      } finally {
        this.isProcessing = false;
      }
    },
  },
};
</script>
