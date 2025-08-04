<template>
  <div class="mt-12 pb-10 w-[100%] h-auto bg-[#ebebeb83] max-w-[1000px] shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
    <div class="flex flex-col justify-center mt-10 m-auto w-[90%]">
      <div class="mb-10">
        <h1 class="text-2xl font-bold mb-2">Registro de Usuario</h1>
        <p class="opacity-60 text-sm">Complete el formulario para registrar un nuevo usuario en el sistema</p>
      </div>
      <div class="mb-4">
        <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Información Personal</h2>
      </div> 
      <form @submit.prevent="registerUser">
        <div class="flex flex-col gap-14 mb-16">
          <div class="flex justify-between gap-12">
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Nombre *</label>
              <input class="input-custom" type="text" v-model="firstName" required autocomplete="given-name" placeholder="Tu Nombre">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm" >Apellido *</label>
              <input class="input-custom" type="text" v-model="lastName" required autocomplete="family-name" placeholder="Tu Apellido">
            </div>
          </div>
          <div class="flex justify-between gap-12">  
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Email *</label>
              <input class="input-custom" type="email" v-model="email" required autocomplete="email" placeholder="Tu Correo">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Telefono</label>
              <input class="input-custom" type="tel" v-model="phoneNumber" autocomplete="tel" placeholder="Tu Telefono">
            </div>
          </div>
          <!-- Nuevos campos de contraseña -->
          <div class="flex justify-between gap-12">
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Contraseña *</label>
              <input class="input-custom" type="password" v-model="password" required autocomplete="new-password" placeholder="Contraseña">
            </div>
            <div class="flex flex-col gap-4 w-[100%]">
              <label class="text-sm">Confirmar Contraseña *</label>
              <input class="input-custom" type="password" v-model="confirmPassword" required autocomplete="new-password" placeholder="Confirmar Contraseña">
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="mb-4">
            <h2 class="font-medium text-lg mb-6 border-b-1 pb-1">Configuracíon del Sistema</h2>
          </div>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <label class="text-sm">Rol de Usuario *</label>
              <select class="input-custom" v-model="selectedRole" required>
                <option value="" disabled>Seleccione rol</option>
                <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
              </select>
            </div>
            <div>
              <input class="mr-2" type="checkbox" v-model="isActive">
              <label class="text-sm">Usuario activo</label>
            </div>
            <div class="flex flex-col gap-4">
              <label class="text-sm">Notas adicionales</label>
              <textarea v-model="additionalNotes" placeholder="Información adicional sobre el usuario... " class="resize-none input-custom"></textarea>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-6 mt-8">
          <button class="input-button-custom" type="submit">Guardar Usuario</button>
          <button class="shadow-custom bg-white cursor-pointer text-sm px-[12px] py-[7px] rounded-[6px]" type="button" @click="clearForm">Limpiar Formulario</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Variables reactivas para los campos del formulario
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phoneNumber = ref('')
const selectedRole = ref('')
const isActive = ref(true) // Por defecto activo
const additionalNotes = ref('')
const password = ref('') // Añadir campo de contraseña
const confirmPassword = ref('') // Añadir campo para confirmar contraseña

const roles = ref<string[]>([]) // Para almacenar los roles obtenidos del backend

// Función para obtener los roles del backend
const fetchRoles = async () => {
  try {
    const res = await fetch('http://localhost:8000/users/roles')
    if (!res.ok) {
      throw new Error('No se pudieron obtener los roles')
    }
    const data = await res.json()
    roles.value = data.roles
  } catch (error) {
    console.error('Error al obtener roles:', error)
    alert('Error al cargar los roles. Intente de nuevo más tarde.')
  }
}

// Función para registrar el usuario
const registerUser = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden.')
    return
  }

  // Crear un objeto con los datos del usuario
  const userData = {
    email: email.value,
    password: password.value,
    first_name: firstName.value || null, // Enviar null si está vacío
    last_name: lastName.value || null,
    phone_number: phoneNumber.value || null,
    additional_notes: additionalNotes.value || null,
    role: selectedRole.value,
    is_active: isActive.value,
  }

  try {
    // Obtener el token de autenticación (asumiendo que ya hay un usuario logueado como superadmin)
    // En una aplicación real, esto vendría de un contexto de autenticación
    const token = localStorage.getItem('access_token'); // Asume que el token se guarda aquí
    if (!token) {
      alert('No autorizado. Inicie sesión como superadmin.');
      return;
    }

    const res = await fetch('http://localhost:8000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Enviar el token de autorización
      },
      body: JSON.stringify(userData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || 'Error al registrar usuario')
    }

    const data = await res.json()
    alert(`Usuario ${data.email} registrado exitosamente!`)
    clearForm() // Limpiar el formulario después del registro exitoso
  } catch (error: any) {
    console.error('Error al registrar usuario:', error)
    alert(`Error al registrar usuario: ${error.message || 'Ocurrió un error inesperado.'}`)
  }
}

// Función para limpiar el formulario
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
}

// Cargar los roles cuando el componente se monte
onMounted(() => {
  fetchRoles()
})
</script>
