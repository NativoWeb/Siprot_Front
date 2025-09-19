<template>
  <header class="bg-white fixed top-0 left-0 w-full h-auto z-10 shadow-lg">
    <div class="flex justify-between items-center py-4 px-6">
      <!-- Botón hamburguesa SIEMPRE visible para superadmin -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="text-2xl focus:outline-none mr-4"
      >
        ☰
      </button>

      <!-- Logo y título clickeable -->
      <div
        class="flex items-center flex-shrink-0 cursor-pointer"
        @click="goToHomeByRole"
      >
        <img
          class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mr-2 sm:mr-3 lg:mr-4"
          src="../assets/logo_sena.webp"
          alt="Logo SENA"
        />
        <h1 class="text-[#08ac04] font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
          SIPROT-IA
        </h1>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="!isLoggedIn">
          <!-- Estado no logeado -->
          <RouterLink
            v-if="isLoginPage"
            to="/"
            class="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm sm:text-base"
          >
            <span class="hidden sm:inline">Regresar al Home</span>
            <span class="sm:hidden">Home</span>
          </RouterLink>
          <RouterLink
            v-else
            to="/iniciar-sesion"
            class="px-3 py-2 sm:px-4 sm:py-2 bg-[#08ac04] text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
          >
            <span class="hidden sm:inline">Iniciar Sesión</span>
            <span class="sm:hidden">Login</span>
          </RouterLink>
        </div>

        <div v-else>
          <!-- Menú en el header (para roles distintos a superadmin) -->

          <!-- PLANEACION -->
          <ul
            v-if="role === 'planeacion'"
            class="h-full flex gap-2 sm:gap-3 lg:gap-4 items-center justify-between relative"
          >
            <li><RouterLink to="/cargar-documento">Cargar Documentos</RouterLink></li>
            <li><RouterLink to="/biblioteca-documentos">Biblioteca de Documentos</RouterLink></li>
            <li><RouterLink to="/oferta-educativa">Análisis de oferta educativa</RouterLink></li>
            <li><RouterLink to="/escenarios-prospectivos">Escenarios Prospectivos</RouterLink></li>
            <li><RouterLink to="/indicadores-estrategicos">Indicadores Estratégicos</RouterLink></li>
            <li><RouterLink to="/dofa">Análisis DOFA Territorial</RouterLink></li>
            <li><RouterLink to="/mis-reportes-planeacion">Mis Reportes</RouterLink></li>
            <li class="cursor-pointer" @click="logout">Salir</li>
          </ul>

          <!-- INSTRUCTOR -->
          <ul
            v-else-if="role === 'instructor'"
            class="h-full flex gap-2 sm:gap-3 lg:gap-4 items-center justify-between relative"
          >
            <li><RouterLink to="/biblioteca-documentos">Biblioteca</RouterLink></li>
            <li><RouterLink to="/escenarios-prospectivos">Escenarios Prospectivos</RouterLink></li>
            <li class="cursor-pointer" @click="logout">Salir</li>
          </ul>

          <!-- ADMINISTRATIVO -->
          <ul
            v-else-if="role === 'administrativo'"
            class="h-full flex gap-2 sm:gap-3 lg:gap-4 items-center justify-between relative"
          >
            <li><RouterLink to="/biblioteca-documentos">Biblioteca de Documentos</RouterLink></li>
            <li><RouterLink to="/oferta-educativa">Análisis de oferta educativa</RouterLink></li>
            <li><RouterLink to="/escenarios-prospectivos">Escenarios Prospectivos</RouterLink></li>
            <li><RouterLink to="/indicadores-estrategicos">Indicadores Estratégicos</RouterLink></li>
            <li><RouterLink to="/dofa">Análisis DOFA Territorial</RouterLink></li>
            <li><RouterLink to="/mis-reportes-administrativo">Mis Reportes</RouterLink></li>
            <li class="cursor-pointer" @click="logout">Salir</li>
          </ul>

          <!-- DEFAULT -->
          <ul v-else class="h-full flex gap-4 items-center justify-between relative">
            <li class="cursor-pointer" @click="logout">Salir</li>
          </ul>
        </div>
      </div>
    </div>
  </header>

  <!-- SIDEBAR PARA SUPERADMIN -->
  <div
    v-if="sidebarOpen && role === 'superadmin'"
    class="fixed top-20 left-0 w-64 h-full bg-white shadow-lg z-50 p-4 overflow-y-auto"
  >
    <button
      @click="sidebarOpen = false"
      class="text-gray-600 hover:text-black text-xl mb-4"
    >
      ✖
    </button>
    <ul class="flex flex-col gap-3">
      <li class="font-semibold text-gray-700">Usuarios y Roles</li>
      <li><RouterLink to="/registrar-usuario">Crear nuevo usuario</RouterLink></li>
      <li><RouterLink to="/lista-usuario">Lista de Usuarios</RouterLink></li>
      <li><RouterLink to="/ver-roles">Ver Roles</RouterLink></li>

      <li class="font-semibold text-gray-700 mt-3">Catálogos</li>
      <li><RouterLink to="/sectores-economicos">Sectores Económicos</RouterLink></li>
      <li><RouterLink to="/lineas-medulares">Líneas Medulares</RouterLink></li>
      <li><RouterLink to="/tipos-documentos">Tipos de Documentos</RouterLink></li>

      <li class="font-semibold text-gray-700 mt-3">Planeación</li>
      <li><RouterLink to="/cargar-documento">Cargar Documentos</RouterLink></li>
      <li><RouterLink to="/biblioteca-documentos">Biblioteca de Documentos</RouterLink></li>
      <li><RouterLink to="/oferta-educativa">Análisis de oferta educativa</RouterLink></li>
      <li><RouterLink to="/escenarios-prospectivos">Escenarios Prospectivos</RouterLink></li>
      <li><RouterLink to="/indicadores-estrategicos">Indicadores Estratégicos</RouterLink></li>
      <li><RouterLink to="/dofa">Análisis DOFA Territorial</RouterLink></li>
      <li><RouterLink to="/mis-reportes-planeacion">Mis Reportes</RouterLink></li>

      <li class="font-semibold text-gray-700 mt-3">Auditoría</li>
      <li><RouterLink to="/auditorias">Ver Auditoría</RouterLink></li>

      <li
        class="cursor-pointer text-red-600 mt-4 font-bold"
        @click="logout"
      >
        Cerrar Sesión
      </li>
    </ul>
  </div>

  <main
    class="mt-16 sm:mt-20 lg:mt-24 m-auto w-[95%] sm:w-[90%] lg:w-[85%] xl:w-[80%] flex flex-col items-center justify-center"
  >
    <RouterView />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const route = useRoute()

const role = ref(null)
const tokenValid = ref(false)
const sidebarOpen = ref(false)

const getRoleFromToken = () => {
  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      const decodedToken = jwtDecode(token)
      const currentTime = Date.now() / 1000
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        role.value = null
        tokenValid.value = false
        router.push('/iniciar-sesion')
        return
      }
      role.value = decodedToken.role
      tokenValid.value = true
      localStorage.setItem('role', decodedToken.role)
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      role.value = null
      tokenValid.value = false
      router.push('/iniciar-sesion')
    }
  } else {
    role.value = null
    tokenValid.value = false
  }
}

const isLoggedIn = computed(() => tokenValid.value && role.value !== null)
const isLoginPage = computed(() => route.path === '/iniciar-sesion')

const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  role.value = null
  tokenValid.value = false
  sidebarOpen.value = false
  router.push('/iniciar-sesion')
}

const goToHomeByRole = () => {
  if (!isLoggedIn.value) {
    router.push('/')
    return
  }
  switch (role.value) {
    case 'superadmin':
      router.push('/registrar-usuario')
      break
    case 'planeacion':
      router.push('/cargar-documento')
      break
    case 'instructor':
      router.push('/biblioteca-documentos')
      break
    case 'administrativo':
      router.push('/biblioteca-documentos')
      break
    default:
      router.push('/')
  }
}

onMounted(() => getRoleFromToken())
watch(() => route.path, () => getRoleFromToken())
</script>
