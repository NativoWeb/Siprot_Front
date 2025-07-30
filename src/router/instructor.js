import InstruAnalisisOfertasComponent from "../components/instructor/InstruAnalisisOfertasComponent.vue";
import InstruDocumentComponent from "../components/instructor/InstruDocumentComponent.vue";
import InstruPerfilComponent from "../components/instructor/InstruPerfilComponent.vue";

const instructorRoutes = [
  {
    path: '/documentos',
    name: 'Documents',
    component: InstruDocumentComponent
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: InstruPerfilComponent
  },
  {
    path: '/analisis',
    name: 'Analisis',
    component: InstruAnalisisOfertasComponent
  },

      {
    path: "/biblioteca-documentos", // Nueva ruta para la biblioteca de documentos
    name: "DocumentLibrary",
    component: () => import("../components/administrativo/DocumentLibraryComponent.vue"),
    meta: { requiresAuth: true, roles: ["administrativo", "superadmin", "planeacion", "instructor"] },
  },

]

export default instructorRoutes