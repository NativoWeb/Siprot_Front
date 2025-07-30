<template>
  <div class="container mx-auto py-8 px-4 ">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p class="text-gray-600 mt-2">Gestiona tu información personal y configuraciones de cuenta</p>
      </div>


      <!-- Información Personal -->
      <div v-if="activeTab === 'personal'" class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-medium text-gray-900">Información Personal</h2>
            <p class="text-sm text-gray-500">Actualiza tu información personal y detalles de contacto</p>
          </div>
          <button
            v-if="!isEditing"
            @click="isEditing = true"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EditIcon class="w-4 h-4 mr-2" />
            Editar
          </button>
          <div v-else class="flex space-x-2">
            <button
              @click="handleSave"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <SaveIcon class="w-4 h-4 mr-2" />
              Guardar
            </button>
            <button
              @click="handleCancel"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XIcon class="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        </div>

        <div class="px-6 py-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombres
              </label>
              <input
                id="name"
                v-model="formData.name"
                :disabled="!isEditing"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </label>
              <input
                id="email"
                v-model="formData.email"
                :disabled="!isEditing"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                v-model="formData.email"
                :disabled="!isEditing"
                type="email"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono 
              </label>
              <input
                id="location"
                v-model="formData.location"
                :disabled="!isEditing"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
                Rol del Usuario
              </label>
              <input
                id="company"
                v-model="formData.company"
                :disabled="!isEditing"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
  
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Edit as EditIcon, Save as SaveIcon, X as XIcon } from 'lucide-vue-next'

const activeTab = ref('personal')
const isEditing = ref(false)

const formData = ref({
  name: "Ana García",
  email: "ana.garcia@email.com",
  phone: "+34 612 345 678",
  location: "Madrid, España",
  website: "www.anagarcia.dev",
  bio: "Desarrolladora Full Stack apasionada por crear experiencias digitales increíbles. Me especializo en React, Node.js y diseño UX/UI.",
  company: "Tech Solutions Inc.",
  position: "Senior Frontend Developer",
})

const handleSave = () => {
  isEditing.value = false
  console.log("Datos guardados:", formData.value)
}

const handleCancel = () => {
  isEditing.value = false
  // Aquí podrías revertir los cambios si es necesario
}
</script>