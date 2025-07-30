<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <button
      @click="showModal = true"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Abrir Modal
    </button>

    <ModalComponent :visible="showModal" title="Mi Modal Personalizado">
      <p>Este es el contenido del modal.</p>
      <button
        @click="showModal = false"
        class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Cerrar
      </button>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModalComponent from '../../modals/ModalComponent.vue';

const showModal = ref(false)
</script>
