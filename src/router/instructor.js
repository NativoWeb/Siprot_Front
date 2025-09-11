const instructorRoutes = [

  {
    path: "/escenarios-prospectivos",
    name: "ProspectiveAnalysis",
    component: () => import("../components/planeacion/EscenariosProspectivos.vue"),
    meta:{ requiresAuth: true, roles: ["administrativo", "superadmin", "planeacion", "instructor"] },
  },

      {
    path: "/biblioteca-documentos", // Nueva ruta para la biblioteca de documentos
    name: "DocumentLibrary",
    component: () => import("../components/administrativo/DocumentLibraryComponent.vue"),
    meta: { requiresAuth: true, roles: ["administrativo", "planeacion", "instructor"] },
  },

]

export default instructorRoutes