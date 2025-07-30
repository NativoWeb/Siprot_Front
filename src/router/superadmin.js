import DocumentsTypeComponent from "../components/superadmin/catalogs-management/DocumentsTypeComponent.vue";
import EconomicSectorsComponent from "../components/superadmin/catalogs-management/EconomicSectorsComponent.vue";
import MedularLinesComponent from "../components/superadmin/catalogs-management/MedularLinesComponent.vue";
import ProspectivesComponent from "../components/superadmin/catalogs-management/ProspectivesComponent.vue";
import RolesComponent from "../components/superadmin/role-management/RolesComponent.vue";
import ChangeRolComponent from "../components/superadmin/user-management/ChangeRolComponent.vue";
import DeleteUserComponent from "../components/superadmin/user-management/DeleteUserComponent.vue";
import UserListComponent from "../components/superadmin/user-management/UserListComponent.vue";
import UserRegisterComponent from "../components/superadmin/user-management/UserRegisterComponent.vue";
import AdminMainView from "../views/superadmin/AdminMainView.vue";

const superadminRoutes = [
  {
    path: '/inicio-admin',
    name: 'AdminMainView',
    component: AdminMainView
  },
  {
    path: '/registrar-usuario',
    name: 'UserRegister',
    component: UserRegisterComponent
  },
  {
    path: '/lista-usuario',
    name: 'UserList',
    component: UserListComponent
  },
  {
    path: '/borrar-usuario',
    name: 'DeleteUser',
    component: DeleteUserComponent
  },
  {
    path: '/rol-usuario',
    name: 'ChangeRolUser',
    component: ChangeRolComponent
  },
  {
    path: '/ver-roles',
    name: 'Roles',
    component: RolesComponent
  },
  {
    path: '/sectores-economicos',
    name: 'EconomicSectors',
    component: EconomicSectorsComponent
  },
  {
    path: '/lineas-medulares',
    name: 'MedularLines',
    component: MedularLinesComponent
  },
  {
    path: '/tipos-documentos',
    name: 'DocumentsType',
    component: DocumentsTypeComponent
  },
  {
    path: '/prospectivas',
    name: 'Prospectives',
    component: ProspectivesComponent
  }
]

export default superadminRoutes