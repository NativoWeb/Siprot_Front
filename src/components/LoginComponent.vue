<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import router from '../router'
import { showSuccess, showError } from '../plugins/notifications'

// Variables reactivas para email y contraseña
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Función post de formulario
const loginUser = async () => {
  // Evitar múltiples envíos
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // Se hace la petición al back
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }) 
    })

    // Si el código de respuesta no es 200 *Ok* lanza un error
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || 'Credenciales inválidas')
    }

    // Se guarda el token de acceso, refresh token, rol y datos del usuario
    const data = await res.json()
    
    // 🔑 IMPORTANTE: Guardar AMBOS tokens
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token) // ⬅️ NUEVO
    localStorage.setItem('role', data.user.role)
    localStorage.setItem('user_info', JSON.stringify(data.user)) // Guardar info completa del usuario
    
    console.log('Login exitoso. Rol del usuario:', data.user.role)
    
    // Mostrar notificación de éxito
    showSuccess('Inicio de sesión exitoso')
    
    // Redireccionando al usuario según el rol
    if (data.user.role === 'superadmin') {
      console.log('Intentando redirigir a: AdminMainView')
      router.push({ name: 'AdminMainView' })
    } else {
      console.log('Intentando redirigir a: / (ruta por defecto)')
      router.push('/') 
    }

  } catch (err: any) {
    // Mostramos el error con notificación
    showError(err.message || 'Credenciales inválidas')
    console.error('Error de login:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-[100%] h-[100vh] flex justify-center items-center">
    <div class="flex flex-col w-[60%] max-w-[800px] min-w-[600px] h-[70%] max-h-[580px] bg-[#ebebeb83] shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <div class="mt-5">
        <img class="mt-2 ml-8 absolute w-17 h-17" src="../assets/logo_sena.webp" alt="Logo SENA" />
        <div class="flex items-center justify-center">
          <div class="flex flex-col items-center justify-center">
            <h1 class="text-center mt-10 font-bold text-3xl">Iniciar Sesión</h1>
            <h2 class="text-center opacity-60 text-sm mt-4">
              Ingresa tu email y contraseña para acceder
            </h2>
          </div>
        </div>

        <div class="m-auto mt-12 w-[75%] h-[100%]">
          <form @submit.prevent="loginUser" class="flex flex-col gap-10">
            <div class="flex flex-col gap-3">
              <label>Email</label>
              <input 
                v-model="email" 
                class="input-custom" 
                type="email" 
                required 
                placeholder="tu@ejemplo.com"
                :disabled="isLoading"
              />
            </div>

            <div class="flex flex-col gap-3 relative">
              <label>Contraseña</label>
              <input
                v-model="password"
                class="input-custom"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="***********"
                :disabled="isLoading"
              />
              <span
                @click="togglePassword"
                class="absolute right-4 top-10 cursor-pointer text-sm text-blue-600"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </span>
            </div>

            <button 
              class="w-[100%] input-button-custom" 
              type="submit"
              :disabled="isLoading"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
            >
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
            
            <RouterLink class="text-center" to="/">¿Olvidaste tu contraseña?</RouterLink>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>