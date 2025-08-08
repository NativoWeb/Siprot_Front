<template>
  <header class="bg-white fixed top-0 left-0 w-full h-auto z-10 shadow-lg">
    <div class="flex justify-between items-center py-4 px-6">
      <!-- Logo and Title -->
      <div class="flex items-center flex-shrink-0">
        <img class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mr-2 sm:mr-3 lg:mr-4" src="../assets/logo_sena.webp" alt="Logo SENA">
        <h1 class="text-[#08ac04] font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl">SIPROT-IA</h1>
      </div>
      
      <div class="flex-shrink-0">
        <div v-if="!isLoggedIn">
           Estado no logeado 
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
          <!-- Estado logeado: Menú de navegación completo según el rol -->
          
          <!-- SUPERADMIN MENU -->
          <ul v-if="role === 'superadmin'" class="h-full flex gap-2 sm:gap-3 lg:gap-4 items-center justify-between relative">
            <!-- Gestión de Usuarios -->
            <li class="text-xs sm:text-sm lg:text-base flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap" @click="toggleDropdown('usuarios')">
                <span class="hidden lg:inline">Gestión de Usuarios</span>
                <span class="lg:hidden">Usuarios</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.usuarios }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-auto absolute top-full mt-1 left-0 shadow-lg rounded-md transition-all duration-300 overflow-hidden z-50 border"
                :class="{ 'max-h-0': !openDropdowns.usuarios, 'max-h-40': openDropdowns.usuarios }">
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 w-[160px] sm:w-[180px] text-xs sm:text-sm">
                  <RouterLink to="/registrar-usuario" @click="toggleDropdown('usuarios')">
                    Crear nuevo usuario
                  </RouterLink>
                </li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/lista-usuario" @click="toggleDropdown('usuarios')">
                    Lista de Usuarios
                  </RouterLink>
                </li>
              </ul>
            </li>
            
            <!-- Gestión de Roles y Permisos -->
            <li class="text-xs sm:text-sm lg:text-base flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap" @click="toggleDropdown('roles')">
                <span class="hidden xl:inline">Gestión de Roles y Permisos</span>
                <span class="xl:hidden">Roles</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.roles }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[160px] sm:w-[200px] absolute top-full mt-1 left-0 shadow-lg rounded-md transition-all duration-300 overflow-hidden z-50 border"
                :class="{ 'max-h-0': !openDropdowns.roles, 'max-h-40': openDropdowns.roles }">
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/ver-roles" @click="toggleDropdown('roles')">Ver Roles</RouterLink>
                </li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">Opción 2</li>
              </ul>
            </li>
            
            <!-- Catalogos Institucionales -->
            <li class="text-xs sm:text-sm lg:text-base flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap" @click="toggleDropdown('catalogos')">
                <span class="hidden xl:inline">Catalogos Institucionales</span>
                <span class="xl:hidden">Catalogos</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.catalogos }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[160px] sm:w-[200px] absolute top-full mt-1 left-0 shadow-lg rounded-md transition-all duration-300 overflow-hidden z-50 border"
                :class="{ 'max-h-0': !openDropdowns.catalogos, 'max-h-40': openDropdowns.catalogos }">
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/sectores-economicos" @click="toggleDropdown('catalogos')">Sectores Economicos</RouterLink>
                </li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/lineas-medulares" @click="toggleDropdown('catalogos')">Lineas Medulares</RouterLink>
                </li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/tipos-documentos" @click="toggleDropdown('catalogos')">Tipos de Documentos</RouterLink>
                </li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">
                  <RouterLink to="/prospectivas" @click="toggleDropdown('catalogos')">Prospectiva</RouterLink>
                </li>
              </ul>
            </li>
            
            <!-- Auditoría -->
            <li class="text-xs sm:text-sm lg:text-base flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap" @click="toggleDropdown('auditoria')">
                <span class="hidden lg:inline">Auditoría y Trazabilidad</span>
                <span class="lg:hidden">Auditoría</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.auditoria }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[160px] sm:w-[200px] absolute top-full mt-1 left-0 shadow-lg rounded-md transition-all duration-300 overflow-hidden z-50 border"
                :class="{ 'max-h-0': !openDropdowns.auditoria, 'max-h-40': openDropdowns.auditoria }">
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">Opción 1</li>
                <li class="px-3 py-2 sm:px-4 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">Opción 2</li>
              </ul>
            </li>
            
            <li class="text-xs sm:text-sm lg:text-base cursor-pointer whitespace-nowrap" @click="logout">
              <span class="hidden sm:inline">Cerrar Sesión</span>
              <span class="sm:hidden">Salir</span>
            </li>
          </ul>
          
          <!-- INSTRUCTOR MENU -->
          <ul v-else-if="role === 'instructor'" class="h-full flex gap-2 sm:gap-3 lg:gap-4 items-center justify-between relative">
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/biblioteca-documentos" class="whitespace-nowrap">
                <span class="hidden lg:inline">Biblioteca de Documentos</span>
                <span class="lg:hidden">Biblioteca</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/analisis" class="whitespace-nowrap">
                <span class="hidden lg:inline">Oferta Educativa</span>
                <span class="lg:hidden">Oferta</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/perfil" class="whitespace-nowrap">
                <span class="hidden sm:inline">Mi Perfil</span>
                <span class="sm:hidden">Perfil</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base cursor-pointer whitespace-nowrap" @click="logout">
              <span class="hidden sm:inline">Cerrar Sesión</span>
              <span class="sm:hidden">Salir</span>
            </li>
          </ul>
          
          <!-- ADMINISTRATIVO MENU -->
          <ul v-else-if="role === 'administrativo'" class="h-full flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 items-center justify-between relative">
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/biblioteca-documentos" class="whitespace-nowrap">
                <span class="hidden xl:inline">Biblioteca de Documentos</span>
                <span class="xl:hidden">Biblioteca</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/oferta-educativa" class="whitespace-nowrap">
                <span class="hidden xl:inline">Analisis de oferta educativa</span>
                <span class="xl:hidden">Oferta</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/indicadores-estrategicos" class="whitespace-nowrap">
                <span class="hidden xl:inline">Indicadores estratégicos</span>
                <span class="xl:hidden">Indicadores</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/reportes-ejecutivos" class="whitespace-nowrap">
                <span class="hidden lg:inline">Reportes ejecutivos</span>
                <span class="lg:hidden">Reportes</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/configuracion" class="whitespace-nowrap">
                <span class="hidden lg:inline">Configuración</span>
                <span class="lg:hidden">Config</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/gestion-equipos" class="whitespace-nowrap">
                <span class="hidden xl:inline">Gestion de equipos</span>
                <span class="xl:hidden">Equipos</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/mis-reportes-administrativo" class="whitespace-nowrap">
                <span class="hidden lg:inline">Mis reportes</span>
                <span class="lg:hidden">Mis Rep.</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base cursor-pointer whitespace-nowrap" @click="logout">
              <span class="hidden sm:inline">Cerrar Sesión</span>
              <span class="sm:hidden">Salir</span>
            </li>
          </ul>
          
          <!-- PLANEACION MENU -->
          <ul v-else-if="role === 'planeacion'" class="h-full flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 items-center justify-between relative">
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/cargar-documento" class="whitespace-nowrap">
                <span class="hidden lg:inline">Cargar Documentos</span>
                <span class="lg:hidden">Cargar</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/biblioteca-documentos" class="whitespace-nowrap">
                <span class="hidden xl:inline">Biblioteca de documentos</span>
                <span class="xl:hidden">Biblioteca</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/oferta-educativa" class="whitespace-nowrap">
                <span class="hidden xl:inline">Analisis de oferta educativa</span>
                <span class="xl:hidden">Oferta</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/escenarios-prospectivos" class="whitespace-nowrap">
                <span class="hidden lg:inline">Escenarios prospectivos</span>
                <span class="lg:hidden">Escenarios</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/dofa" class="whitespace-nowrap">
                <span class="hidden lg:inline">Analisis dofa territorial</span>
                <span class="lg:hidden">DOFA</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base">
              <RouterLink to="/mis-reportes-planeacion" class="whitespace-nowrap">
                <span class="hidden lg:inline">Mis reportes</span>
                <span class="lg:hidden">Reportes</span>
              </RouterLink>
            </li>
            <li class="text-xs sm:text-sm lg:text-base cursor-pointer whitespace-nowrap" @click="logout">
              <span class="hidden sm:inline">Cerrar Sesión</span>
              <span class="sm:hidden">Salir</span>
            </li>
          </ul>
          
          <!-- DEFAULT MENU -->
          <ul v-else class="h-full flex gap-4 items-center justify-between relative">
            <li class="text-xs sm:text-sm lg:text-base cursor-pointer whitespace-nowrap" @click="logout">
              <span class="hidden sm:inline">Cerrar Sesión</span>
              <span class="sm:hidden">Salir</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
  
  <main class="mt-16 sm:mt-20 lg:mt-24 m-auto w-[95%] sm:w-[90%] lg:w-[85%] xl:w-[80%] flex flex-col items-center justify-center">
    <RouterView/>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const route = useRoute()

// Estado individual por menú
const openDropdowns = ref({
  usuarios: false,
  roles: false,
  catalogos: false,
  auditoria: false
})

const toggleDropdown = (key: keyof typeof openDropdowns.value) => {
  for (const k in openDropdowns.value) {
    if (k === key) {
      openDropdowns.value[k] = !openDropdowns.value[k];
    } else {
      openDropdowns.value[k] = false;
    }
  }
}

// Estado de autenticación y rol - VERSIÓN MEJORADA
const role = ref<string | null>(null)
const tokenValid = ref(false)

// Función mejorada para obtener el rol del token
const getRoleFromToken = () => {
  const token = localStorage.getItem('access_token')
  
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token)
      
      // 🔥 VERIFICAR EXPIRACIÓN DEL TOKEN
      const currentTime = Date.now() / 1000
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log("🚨 Token expirado en HeaderComponent")
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        role.value = null
        tokenValid.value = false
        return
      }
      
      role.value = decodedToken.role
      tokenValid.value = true
      localStorage.setItem('role', decodedToken.role) // Sincronizar con localStorage
      
      console.log("✅ HeaderComponent - Token válido, rol:", role.value)
    } catch (error) {
      console.error("❌ Error decodificando token en HeaderComponent:", error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      role.value = null
      tokenValid.value = false
    }
  } else {
    role.value = null
    tokenValid.value = false
    localStorage.removeItem('role')
  }
}

// Computed properties
const isLoggedIn = computed(() => tokenValid.value && role.value !== null)
const isLoginPage = computed(() => route.path === '/iniciar-sesion')

// Función para cerrar sesión (directa, sin composable)
const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  role.value = null
  tokenValid.value = false
  router.push('/iniciar-sesion')
}

// 🔥 NUEVA FUNCIONALIDAD: Escuchar cambios en localStorage (para múltiples pestañas)
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'access_token' || event.key === 'role') {
    getRoleFromToken()
  }
}

window.addEventListener('storage', handleStorageChange)

// Limpiar el event listener al desmontar
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// Cargar el rol al montar el componente
onMounted(() => {
  getRoleFromToken()
})

// 🔥 NUEVA FUNCIONALIDAD: Escuchar cambios en la ruta para actualizar el estado
watch(() => route.path, () => {
  getRoleFromToken()
})
</script>

<style scoped>
/* Asegurar que los dropdowns tengan z-index alto */
ul {
  z-index: 1000;
}

/* Mejorar la apariencia de los dropdowns */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Asegurar que el texto no se corte */
.whitespace-nowrap {
  white-space: nowrap;
}

/* Mejorar la transición de los dropdowns */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Responsive adjustments for very small screens */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Ensure proper spacing on larger screens */
@media (min-width: 1280px) {
  .gap-4 {
    gap: 1.5rem;
  }
}
</style>
