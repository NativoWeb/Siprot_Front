<template>
  <div class="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gray-900">
    <transition name="fade" mode="out-in">
      <img
        :key="currentImage"
        :src="getImagePath(currentImage)"
        alt="Imagen de fondo del sistema SIPROT-IA"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
      />
    </transition>
    <!-- Capa de superposición oscura con degradado sutil -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20"></div>
    <div class="relative z-10 text-white text-center p-4 max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
        Bienvenido a <span class="text-[#08ac04]">SIPROT-IA</span>
      </h1>
      <p class="text-lg md:text-xl leading-relaxed drop-shadow-md">
        SIPROT-IA es un sistema del SENA diseñado para facilitar la planificación territorial y tecnológica mediante la gestión y análisis de documentos estratégicos. Apoya la toma de decisiones en procesos de formación y desarrollo regional.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Añade más imágenes para una ruleta más variada
const images = ref(['1.jpg', '2.jpg']) // Nombres de tus imágenes
const currentIndex = ref(0)
let intervalId: any = null

const currentImage = computed(() => images.value[currentIndex.value])

const getImagePath = (imageName: string) => {
  // Asegúrate de que la ruta a las imágenes sea correcta (src/assets/)
  // Si tus imágenes están en src/assets/images/, cambia a `../assets/images/${imageName}`
  return new URL(`../assets/${imageName}`, import.meta.url).href
}

const startCarousel = () => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.value.length
  }, 5000) // Cambia cada 5 segundos
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
/* Transición para el efecto de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
