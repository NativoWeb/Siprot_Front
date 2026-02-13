<template>
  <header class="bg-white fixed top-0 left-0 w-full h-auto z-10 shadow-lg">
    <div class="flex justify-between items-center py-4 px-6">
      <!-- Botón hamburguesa SOLO visible para superadmin -->
      <button
        v-if="role === 'superadmin'"
        @click="sidebarOpen = !sidebarOpen"
        class="text-2xl focus:outline-none mr-4"
      >
        ☰
      </button>

      <!-- Logo y título -->
      <div class="flex items-center flex-shrink-0">
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
          <!-- Menú en el header -->

          <!-- PLANEACION -->
          <ul
            v-if="role === 'planeacion'"
            class="h-full flex flex-wrap gap-2 sm:gap-2 lg:gap-4 items-center justify-end"
          >
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/">Inicio</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/cargar-documento">Cargar Documentos</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/biblioteca-documentos">Biblioteca</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/oferta-educativa">Oferta Educativa</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/escenarios-prospectivos">Escenarios</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/indicadores-estrategicos">Indicadores</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/dofa">DOFA</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/mis-reportes-planeacion">Reportes</RouterLink></li>
            <li 
              class="cursor-pointer bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap" 
              @click="logout"
            >
              Cerrar Sesión
            </li>
          </ul>

          <!-- INSTRUCTOR -->
          <ul
            v-else-if="role === 'instructor'"
            class="h-full flex flex-wrap gap-2 sm:gap-2 lg:gap-4 items-center justify-end"
          >
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/">Inicio</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/biblioteca-documentos">Biblioteca</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/escenarios-prospectivos">Escenarios Prospectivos</RouterLink></li>
            <li 
              class="cursor-pointer bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap" 
              @click="logout"
            >
              Cerrar Sesión
            </li>
          </ul>

          <!-- ADMINISTRATIVO -->
          <ul
            v-else-if="role === 'administrativo'"
            class="h-full flex flex-wrap gap-2 sm:gap-2 lg:gap-4 items-center justify-end"
          >
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/">Inicio</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/biblioteca-documentos">Biblioteca</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/oferta-educativa">Oferta Educativa</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/escenarios-prospectivos">Escenarios</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/indicadores-estrategicos">Indicadores</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/dofa">DOFA</RouterLink></li>
            <li class="hover:text-[#08ac04] transition-colors"><RouterLink to="/mis-reportes-administrativo">Reportes</RouterLink></li>
            <li 
              class="cursor-pointer bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap" 
              @click="logout"
            >
              Cerrar Sesión
            </li>
          </ul>

          <!-- SUPERADMIN - Solo botón de cerrar sesión en header -->
          <div v-else-if="role === 'superadmin'">
            <button
              class="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold whitespace-nowrap" 
              @click="logout"
            >
              Cerrar Sesión
            </button>
          </div>

          <!-- DEFAULT -->
          <div v-else>
            <button
              class="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold whitespace-nowrap" 
              @click="logout"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- SIDEBAR PARA SUPERADMIN -->
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-300 ease-in"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="sidebarOpen && role === 'superadmin'"
      class="fixed top-20 left-0 w-64 h-full bg-[#08ac04] shadow-lg z-50 p-4 overflow-y-auto"
    >
      <ul class="flex flex-col gap-2 text-white">
        <!-- Botón de Inicio al principio del sidebar -->
        <li class="font-bold text-lg mb-2 border-b border-white/30 pb-2">
          <RouterLink to="/inicio-admin">Inicio</RouterLink>
        </li>

        <li class="font-bold text-lg mb-2 border-b border-white/30 pb-2">Usuarios y Roles</li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/registrar-usuario">Crear nuevo usuario</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/lista-usuario">Lista de Usuarios</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/ver-roles">Ver Roles</RouterLink>
        </li>

        <li class="font-bold text-lg mb-2 mt-4 border-b border-white/30 pb-2">Catálogos</li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/sectores-economicos">Sectores Económicos</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/lineas-medulares">Líneas Medulares</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/tipos-documentos">Tipos de Documentos</RouterLink>
        </li>

        <li class="font-bold text-lg mb-2 mt-4 border-b border-white/30 pb-2">Planeación</li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/cargar-documento">Cargar Documentos</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/biblioteca-documentos">Biblioteca de Documentos</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/oferta-educativa">Análisis de oferta educativa</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/indicadores-estrategicos">Indicadores Estratégicos</RouterLink>
        </li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/dofa">Análisis DOFA Territorial</RouterLink>
        </li>
        <li class="font-bold text-lg mb-2 mt-4 border-b border-white/30 pb-2">Auditoría</li>
        <li class="hover:bg-white/10 rounded px-2 py-1 transition-colors">
          <RouterLink to="/auditorias">Ver Auditoría</RouterLink>
        </li>
      </ul>
    </div>
  </transition>

  <main
    class="mt-16 sm:mt-20 lg:mt-24 flex flex-col items-center justify-center transition-all duration-300"
    :class="sidebarOpen && role === 'superadmin' ? 'ml-64 w-[calc(100%-16rem)]' : 'm-auto w-[95%] sm:w-[90%] lg:w-[85%] xl:w-[80%]'"
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

onMounted(() => getRoleFromToken())
watch(() => route.path, () => getRoleFromToken())
</script>