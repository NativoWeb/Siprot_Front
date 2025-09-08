import { createRouter, createWebHistory } from "vue-router"
import LoginView from "../views/LoginView.vue"
import superadminRoutes from "./superadmin"
import instructorRoutes from "./instructor"
import planeacionRoutes from "./planeacion"
import administrativoRoutes from "./administrativo"
import HeaderComponent from "../components/HeaderComponent.vue"
import Home from "../components/Home.vue"
import { jwtDecode } from "jwt-decode"
import { isTokenExpired } from "../utils/tokenValidation.js"
import { showTokenExpired } from "../plugins/notifications.js"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "MainLayout",
      component: HeaderComponent,
      children: [
        {
          path: "",
          name: "Home",
          component: Home,
        },
        {
          path: "iniciar-sesion",
          name: "LoginView",
          component: LoginView,
        },
        ...superadminRoutes,
        ...instructorRoutes,
        ...planeacionRoutes,
        ...administrativoRoutes,
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  console.log("--- Navigation Guard ---")
  console.log("Attempting to go to:", to.path, "with name:", to.name)

  const publicPages = ["/", "/iniciar-sesion"]
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem("access_token")
  let userRole = null

  if (loggedIn) {
    if (isTokenExpired(loggedIn)) { 
      console.log("❌ Token expired in router guard.")

      showTokenExpired()

      localStorage.removeItem("access_token")
      localStorage.removeItem("role")

      if (authRequired) {
        console.log("🔄 Redirecting to login due to expired token.")
        return next("/iniciar-sesion")
      }
    } else {
      try {
        const decodedToken = jwtDecode(loggedIn)
        userRole = decodedToken.role
        console.log("✅ Token found and valid. Decoded user role:", userRole)
        localStorage.setItem("role", userRole)
      } catch (error) {
        console.error("❌ Error decodificando token:", error)

        showTokenExpired()

        localStorage.removeItem("access_token")
        localStorage.removeItem("role")
        console.log("🔄 Invalid token. Redirecting to login.")


        if (authRequired) {
          return next("/iniciar-sesion")
        }
      }
    }
  } else {
    console.log("ℹ️ No token found.")
    localStorage.removeItem("role")
  }

  // Lógica de autorización basada en roles
  console.log("🎯 Target path:", to.path)
  console.log("👤 User role in guard:", userRole)

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
