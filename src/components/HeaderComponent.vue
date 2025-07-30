<template>
  <header class="bg-white fixed top-0 left-0 w-full h-auto z-10 shadow-lg">
    <div class="flex justify-between items-center py-4 px-6">
      <div class="flex items-center">
        <img class="w-12 h-12 mr-4" src="../assets/logo_sena.webp" alt="Logo SENA">
        <h1 class="text-[#08ac04] font-bold text-4xl">SIPROT-IA</h1>
      </div>


      <!-- Contenido del header condicional según el estado de login y la página -->
      <div class="mr-6">
        <div v-if="!isLoggedIn">
          <!-- Estado no logeado -->
          <RouterLink
            v-if="isLoginPage"
            to="/"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Regresar al Home
          </RouterLink>
          <RouterLink
            v-else
            to="/iniciar-sesion"
            class="px-4 py-2 bg-[#08ac04] text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Iniciar Sesión
          </RouterLink>
        </div>
        <div v-else>
          <!-- Estado logeado: Menú de navegación completo según el rol -->
          <ul v-if="role === 'superadmin'" class="h-full flex gap-4 items-center justify-between relative">
            <!-- Gestión de Usuarios -->
            <li class="text-sm flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-2 cursor-pointer" @click="toggleDropdown('usuarios')">
                Gestión de Usuarios
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.usuarios }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-auto absolute top-full mt-1 left-0 shadow transition-all duration-300 overflow-hidden z-50"
                :class="{ 'max-h-0': !openDropdowns.usuarios, 'max-h-40': openDropdowns.usuarios }">
                <li class="px-4 py-2 hover:bg-gray-100 w-[180px]">
                  <RouterLink to="/registrar-usuario" @click="toggleDropdown('usuarios')">
                    Crear nuevo usuario
                  </RouterLink>
                </li>
                <li class="px-4 py-2 hover:bg-gray-100">
                  <RouterLink to="/lista-usuario" @click="toggleDropdown('usuarios')">
                    Lista de Usuarios
                  </RouterLink>
                </li>
                <li class="px-4 py-2 hover:bg-gray-100">
                  <RouterLink to="/rol-usuario" @click="toggleDropdown('usuarios')">
                    Cambiar Rol
                  </RouterLink>
                </li>
              </ul>
            </li>
            <!-- Gestión de Roles y Permisos -->
            <li class="text-sm flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-2 cursor-pointer" @click="toggleDropdown('roles')">
                Gestión de Roles y Permisos
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.roles }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[200px] absolute top-full mt-1 left-0 shadow transition-all duration-300 overflow-hidden z-50"
                :class="{ 'max-h-0': !openDropdowns.roles, 'max-h-40': openDropdowns.roles }">
                <li class="px-4 py-2 hover:bg-gray-100"><RouterLink to="/ver-roles" @click="toggleDropdown('roles')">Ver Roles</RouterLink></li>
                <li class="px-4 py-2 hover:bg-gray-100">Opción 2</li>
              </ul>
            </li>
            <!-- Catalogos Institucionales -->
            <li class="text-sm flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-2 cursor-pointer" @click="toggleDropdown('catalogos')">
                Catalogos Institucionales
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.catalogos }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[200px] absolute top-full mt-1 left-0 shadow transition-all duration-300 overflow-hidden z-50"
                :class="{ 'max-h-0': !openDropdowns.catalogos, 'max-h-40': openDropdowns.catalogos }">
                <li class="px-4 py-2 hover:bg-gray-100"><RouterLink to="/sectores-economicos" @click="toggleDropdown('catalogos')">Sectores Economicos</RouterLink></li>
                <li class="px-4 py-2 hover:bg-gray-100"><RouterLink to="/lineas-medulares" @click="toggleDropdown('catalogos')">Lineas Medulares</RouterLink></li>
                <li class="px-4 py-2 hover:bg-gray-100"><RouterLink to="/tipos-documentos" @click="toggleDropdown('catalogos')">Tipos de Documentos</RouterLink></li>
                <li class="px-4 py-2 hover:bg-gray-100"><RouterLink to="/prospectivas" @click="toggleDropdown('catalogos')">Prospectiva</RouterLink></li>
              </ul>
            </li>
            <!-- Auditoría -->
            <li class="text-sm flex flex-col items-start gap-1 relative">
              <div class="flex items-center gap-2 cursor-pointer" @click="toggleDropdown('auditoria')">
                Auditoría y Trazabilidad
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.auditoria }"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul
                class="bg-white w-[200px] absolute top-full mt-1 left-0 shadow transition-all duration-300 overflow-hidden z-50"
                :class="{ 'max-h-0': !openDropdowns.auditoria, 'max-h-40': openDropdowns.auditoria }">
                <li class="px-4 py-2 hover:bg-gray-100">Opción 1</li>
                <li class="px-4 py-2 hover:bg-gray-100">Opción 2</li>
              </ul>
            </li>
            <li class="text-sm cursor-pointer" @click="logout">Cerrar Sesión</li>
          </ul>

          <ul v-else-if="role === 'instructor'" class="h-full flex gap-4 items-center justify-between relative">
            <li class="text-sm">
              <RouterLink to="/biblioteca-documentos">
                Biblioteca de Documentos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/analisis">
                Oferta Educativa
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/perfil">
                Mi Perfil
              </RouterLink>
            </li>
            <li class="text-sm cursor-pointer" @click="logout">Cerrar Sesión</li>
          </ul>

          <!-- NUEVAS CONDICIONES PARA ROLES ADMINISTRATIVO Y PLANEACION -->
          <ul v-else-if="role === 'administrativo'" class="h-full flex gap-4 items-center justify-between relative">
            <li class="text-sm">
              <RouterLink to="/biblioteca-documentos">
                Biblioteca de Documentos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/oferta-educativa">
                Analisis de oferta educativa
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/indicadores-estrategicos">
                Indicadores estratégicos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/reportes-ejecutivos">
                Reportes ejecutivos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/configuracion">
                Configuración
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/gestion-equipos">
                Gestion de equipos
              </RouterLink>
            </li>
            <li class="text-sm cursor-pointer" @click="logout">
              Cerrar Sesión
            </li>
          </ul>

          <ul v-else-if="role === 'planeacion'" class="h-full flex gap-4 items-center justify-between relative">
            <li class="text-sm">
              <RouterLink to="/cargar-documento">
                Cargar Documentos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/biblioteca-documentos">
                Biblioteca de documentos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/oferta-educativa">
                Analisis de oferta educativa
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/escenarios-prospectivos">
                Escenarios prospectivos
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/dofa">
                Analisis dofa territorial
              </RouterLink>
            </li>
            <li class="text-sm">
              <RouterLink to="/generar-reportes">
                Generar reportes
              </RouterLink>
            </li>
            <li class="text-sm cursor-pointer" @click="logout">Cerrar Sesión</li>
          </ul>
          <!-- FIN DE NUEVAS CONDICIONES -->

          <ul v-else class="h-full flex gap-4 items-center justify-between relative">
            <li class="text-sm cursor-pointer" @click="logout">Cerrar Sesión</li>
          </ul>
        </div>
      </div>
    </div>
  </header>
  <main class="my-24 m-auto w-[80%] flex flex-col items-center justify-center">
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
</style>
