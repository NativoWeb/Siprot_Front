// Rutas para el rol de administrativo
export default [
  {
    path: "administrativo", // La ruta completa será /administrativo (relativa al MainLayout)
    name: "AdministrativoView",
    component: () => import("../views/administrativo/AdministrativoView.vue"),
    meta: { requiresAuth: true, roles: ["administrativo", "superadmin"] },
  },
  {
    path: "/biblioteca-documentos", // Nueva ruta para la biblioteca de documentos
    name: "DocumentLibrary",
    component: () => import("../components/administrativo/DocumentLibraryComponent.vue"),
    meta: { requiresAuth: true, roles: ["administrativo", "superadmin", "planeacion", "instructor"] },
  },
]
