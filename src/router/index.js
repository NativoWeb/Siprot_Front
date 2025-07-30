import { createRouter, createWebHistory } from "vue-router"
import LoginView from "../views/LoginView.vue"
import superadminRoutes from "./superadmin"
import instructorRoutes from "./instructor"
import planeacionRoutes from "./planeacion" // Importa las rutas de planeacion
import administrativoRoutes from "./administrativo" // Importa las rutas de administrativo
import HeaderComponent from "../components/HeaderComponent.vue"
import Home from "../components/Home.vue" // Importa el componente Home
import { jwtDecode } from "jwt-decode" // Importar jwt-decode

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/", // HeaderComponent ahora es el layout principal para todas las rutas
      name: "MainLayout",
      component: HeaderComponent,
      children: [
        {
          path: "", // Esta es la ruta raíz (/) que mostrará Home.vue
          name: "Home",
          component: Home,
        },
        {
          path: "iniciar-sesion", // La ruta completa será /iniciar-sesion
          name: "LoginView",
          component: LoginView,
        },
        // Las rutas de superadmin, instructor, planeacion y administrativo ahora serán hijos directos de '/'
        ...superadminRoutes,
        ...instructorRoutes,
        ...planeacionRoutes, // Incluye las rutas de planeacion
        ...administrativoRoutes, // Incluye las rutas de administrativo
      ],
    },
  ],
})

// Global Navigation Guard - VERSIÓN MEJORADA
router.beforeEach((to, from, next) => {
  console.log("--- Navigation Guard ---")
  console.log("Attempting to go to:", to.path, "with name:", to.name)

  // Rutas públicas que no requieren autenticación
  const publicPages = ["/", "/iniciar-sesion"]
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem("access_token")
  let userRole = null

  if (loggedIn) {
    try {
      const decodedToken = jwtDecode(loggedIn)

      // 🔥 NUEVA VERIFICACIÓN: Comprobar si el token ha expirado
      const currentTime = Date.now() / 1000
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log("❌ Token expired. Removing from localStorage.")
        localStorage.removeItem("access_token")
        localStorage.removeItem("role")

        if (authRequired) {
          console.log("🔄 Redirecting to login due to expired token.")
          return next("/iniciar-sesion")
        }
      } else {
        userRole = decodedToken.role
        console.log("✅ Token found and valid. Decoded user role:", userRole)

        // 🔥 NUEVA FUNCIONALIDAD: Guardar el rol en localStorage para acceso rápido
        localStorage.setItem("role", userRole)
      }
    } catch (error) {
      console.error("❌ Error decodificando token:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("role")
      console.log("🔄 Invalid token. Redirecting to login.")

      if (authRequired) {
        return next("/iniciar-sesion")
      }
    }
  } else {
    console.log("ℹ️ No token found.")
    // 🔥 NUEVA FUNCIONALIDAD: Limpiar cualquier rol guardado si no hay token
    localStorage.removeItem("role")
  }

  if (authRequired && !loggedIn) {
    console.log("🔄 Auth required but not logged in. Redirecting to login.")
    return next("/iniciar-sesion")
  }

  // Lógica de autorización basada en roles
  console.log("🎯 Target path:", to.path)
  console.log("👤 User role in guard:", userRole)

  // Obtener los roles requeridos de la meta de la ruta
  const requiredRoles = to.meta.roles

  if (requiredRoles) {
    console.log(`🔒 Path '${to.path}' requires roles: ${requiredRoles.join(", ")}. User role: ${userRole}`)
    if (!userRole || !requiredRoles.includes(userRole)) {
      alert(`❌ Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(", ")}.`)
      console.log("🔄 Access denied. Redirecting from protected path.")
      return next(from.path || "/")
    }
  }

  console.log("✅ Navigation allowed. Calling next().")
  next()
})

export default router
