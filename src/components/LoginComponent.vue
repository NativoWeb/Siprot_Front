<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import router from '../router'


// Variables reactivas para email y contraseña
const email = ref('')
const password = ref('')


// Funcion post de formulario
const loginUser = async () => {
  try {
    // Se hace la peticion al back
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }) 
    })

    // Si el codigo de respuesta no es 200 *Ok* lanza un error
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Credenciales inválidas');
    }

    // Se guarda el token de acceso y el rol del usuario 
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('role', data.user.role)
    
    console.log('Login exitoso. Rol del usuario:', data.user.role);
    
    // Redireccionando al usuario segun el rol
    if (data.user.role === 'superadmin') {
      console.log('Intentando redirigir a: AdminMainView');
      router.push({ name: 'AdminMainView' })
    } else if (data.user.role === 'instructor') {
      console.log('Intentando redirigir a: Documents');
      router.push({ name: 'Documents' }) // O la ruta inicial para instructor
    } else {
      console.log('Intentando redirigir a: / (ruta por defecto)');
      router.push('/') 
    }

  } catch (err: any) {
    // Mostramos el error
    alert(`Error al iniciar sesión: ${err.message || 'Credenciales inválidas'}`)
    console.error('Error de login:', err)
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
              <input v-model="email" class="input-custom" type="email" required placeholder="tu@ejemplo.com" />
            </div>

            <div class="flex flex-col gap-3">
              <label>Contraseña</label>
              <input v-model="password" class="input-custom" type="password" required placeholder="***********" />
            </div>

            <button class="w-[100%] input-button-custom" type="submit">Iniciar Sesión</button>
            <RouterLink class="text-center" to="/">¿Olvidaste tu contraseña?</RouterLink>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>