<template>
  <div class="mt-12 pb-10 w-[100%] h-auto bg-[#ebebeb83] max-w-[1000px] shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
    <div class="flex flex-col justify-center mt-10 m-auto w-[90%]">
      <div class="mb-10">
        <h1 class="text-2xl font-bold mb-2">Registro de Usuario</h1>
        <p class="opacity-60 text-sm">Complete el formulario para registrar un nuevo usuario en el sistema</p>
      </div>
      
      <!-- Mostrar errores de validación -->
      <div v-if="validationErrors.length > 0" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 class="text-red-800 font-medium mb-2">Errores de validación:</h3>
        <ul class="text-red-700 text-sm list-disc list-inside">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <!-- Mensaje de advertencia -->
      <div v-if="showWarningMessage" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <p class="text-yellow-700 font-medium">Usuario creado con advertencias</p>
            <p class="text-yellow-600 text-sm">{{ warningMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Error de CORS -->
      <div v-if="corsError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-red-700 font-medium">Error de CORS detectado</p>
            <p class="text-red-600 text-sm mt-1">El navegador está bloqueando la conexión por política de CORS.</p>
            <button 
              :disabled="testingConnection"
              class="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded border border-red-300 transition-colors"
            >
              <span v-if="testingConnection">Probando...</span>
              <span v-else>Probar Conexión</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Error de conexión -->
      <div v-if="connectionError && !corsError" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <p class="text-yellow-700 font-medium">Error de conexión con el servidor</p>
            <p class="text-yellow-600 text-sm">{{ connectionErrorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Estado conexión -->
      <div v-if="connectionStatus" class="mb-6 p-3 rounded-lg" :class="connectionStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <p :class="connectionStatus.type === 'success' ? 'text-green-700' : 'text-red-700'" class="text-sm">
          {{ connectionStatus.message }}
        </p>
      </div>

      <!-- Formulario -->
      <div class="mb-4">
        <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Información Personal</h2>
      </div> 
      
      <form @submit.prevent="registerUser">
        <div class="flex flex-col gap-14 mb-16">
          <div class="flex justify-between gap-12">
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Nombre *</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" v-model="firstName" required placeholder="Tu Nombre">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Apellido *</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" v-model="lastName" required placeholder="Tu Apellido">
            </div>
          </div>
          
          <div class="flex justify-between gap-12">  
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Email *</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" type="email" v-model="email" required placeholder="Tu Correo">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Teléfono</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" v-model="phoneNumber" placeholder="Tu Teléfono">
            </div>
          </div>
          
          <!-- Contraseñas -->
          <div class="flex justify-between gap-12">
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Contraseña *</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" type="password" v-model="password" required placeholder="Contraseña" minlength="6">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Confirmar Contraseña *</label>
              <input class="px-3 py-2 border border-gray-300 rounded-md" type="password" v-model="confirmPassword" required placeholder="Confirmar Contraseña" minlength="6">
            </div>
          </div>
        </div>
        
        <!-- Configuración -->
        <div class="flex flex-col">
          <div class="mb-4">
            <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Configuración del Sistema</h2>
          </div>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <label class="text-sm">Rol de Usuario *</label>
              <select class="px-3 py-2 border border-gray-300 rounded-md" v-model="selectedRole" required>
                <option value="" disabled>Seleccione rol</option>
                <option v-for="role in availableRoles" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </div>
            <div>
              <input class="mr-2" type="checkbox" v-model="isActive" id="isActive">
              <label for="isActive" class="text-sm">Usuario activo</label>
            </div>
            <div class="flex flex-col gap-4">
              <label class="text-sm">Notas adicionales</label>
              <textarea v-model="additionalNotes" placeholder="Información adicional..." class="resize-none px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="flex items-center justify-center gap-6 mt-8">
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Guardando...</span>
            <span v-else>Guardar Usuario</span>
          </button>
          <button class="shadow-md hover:shadow-lg bg-white text-sm px-[12px] py-[7px] rounded-[6px]" type="button" @click="clearForm" :disabled="isSubmitting">
            Limpiar Formulario
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast de éxito -->
  <transition name="toast">
    <div v-if="showToast" class="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 z-50">
      <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phoneNumber = ref('')
const selectedRole = ref('')
const isActive = ref(true)
const additionalNotes = ref('')
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const validationErrors = ref<string[]>([])
const successMessage = ref('')
const showWarningMessage = ref(false)
const warningMessage = ref('')
const connectionError = ref(false)
const corsError = ref(false)
const connectionErrorMessage = ref('')
const testingConnection = ref(false)
const connectionStatus = ref<{type: 'success' | 'error', message: string} | null>(null)

const showToast = ref(false)
const toastMessage = ref('')

const availableRoles = ref([
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'planeacion', label: 'Planeación' },
  { value: 'instructor', label: 'Instructor' }
])

const triggerToast = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const validateForm = (): boolean => {
  validationErrors.value = []
  if (!firstName.value.trim()) validationErrors.value.push('El nombre es requerido')
  if (!lastName.value.trim()) validationErrors.value.push('El apellido es requerido')
  if (!email.value.trim()) {
    validationErrors.value.push('El email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validationErrors.value.push('El email no es válido')
  }
  if (!password.value) validationErrors.value.push('La contraseña es requerida')
  else if (password.value.length < 6) validationErrors.value.push('La contraseña debe tener al menos 6 caracteres')
  if (password.value !== confirmPassword.value) validationErrors.value.push('Las contraseñas no coinciden')
  if (!selectedRole.value) validationErrors.value.push('Debe seleccionar un rol')
  return validationErrors.value.length === 0
}

const registerUser = async () => {
  if (!validateForm()) return
  isSubmitting.value = true
  connectionError.value = false
  corsError.value = false
  connectionErrorMessage.value = ''
  showWarningMessage.value = false
  connectionStatus.value = null

  const userData = {
    email: email.value.trim(),
    password: password.value,
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    phone_number: phoneNumber.value.trim() || null,
    additional_notes: additionalNotes.value.trim() || null,
    role: selectedRole.value,
    is_active: isActive.value,
  }

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('No autorizado. Inicie sesión como superadmin.')
      return
    }
    const res = await fetch('http://localhost:8000/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    })

    if (res.ok) {
      const data = await res.json()
      successMessage.value = `Usuario ${data.email} registrado exitosamente!`
      triggerToast(`✅ Usuario ${data.email} creado correctamente`)
      clearForm()
    } else {
      const errorData = await res.json()
      throw new Error(errorData.detail || 'Error al registrar usuario')
    }
  } catch (error: any) {
    alert(`Error al registrar usuario: ${error.message || 'Ocurrió un error inesperado.'}`)
  } finally {
    isSubmitting.value = false
  }
}

const clearForm = () => {
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  phoneNumber.value = ''
  selectedRole.value = ''
  isActive.value = true
  additionalNotes.value = ''
  password.value = ''
  confirmPassword.value = ''
  validationErrors.value = []
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
