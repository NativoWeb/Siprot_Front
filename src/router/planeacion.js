// Rutas para el rol de planeacion
export default [
  {
    path: "planeacion", // La ruta completa será /planeacion (relativa al MainLayout)
    name: "PlaneacionView",
    component: () => import("../views/planeacion/PlaneacionView.vue"),
    meta: { requiresAuth: true, roles: ["planeacion", "superadmin"] },
  },
  {
    path: "/cargar-documento", // Nueva ruta para cargar documentos
    name: "UploadDocument",
    component: () => import("../components/planeacion/DocumentUploadComponent.vue"),
    meta: { requiresAuth: true, roles: ["planeacion", "superadmin"] },
  },
    {
    path: "/biblioteca-documentos", // Nueva ruta para la biblioteca de documentos
    name: "DocumentLibrary",
    component: () => import("../components/administrativo/DocumentLibraryComponent.vue"),
    meta: { requiresAuth: true, roles: ["administrativo", "superadmin", "planeacion", "instructor"] },
  },
    {
    path: "/oferta-educativa",
    name: "EducationalOffer",
    component: () => import("../components/planeacion/EducationalOffer.vue"),
    meta:{ requiresAuth: true, roles: ["administrativo", "superadmin", "planeacion", "instructor"]},
  },
  {
    path: "/mis-reportes-planeacion",
    name: "ReportsPlaneacion",
    component: () => import("../views/planeacion/ReportsView.vue"),
    meta: { requiresAuth: true, roles: ["planeacion", "superadmin"] },
  }
]
