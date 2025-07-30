<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Encabezado -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">Gestión de Roles de Usuario</h2>
      <p class="mt-1 text-sm text-gray-500">
        Asigna roles a los usuarios para controlar sus permisos y acceso al sistema.
      </p>
    </div>

    <!-- Barra de búsqueda -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-grow">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar usuarios..."
            class="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          @click="searchTerm = ''"
          v-if="searchTerm"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <XIcon class="h-4 w-4 mr-1" />
          Limpiar
        </button>
      </div>
    </div>

    <!-- Lista de usuarios con roles -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol Actual
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nuevo Rol
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="isLoading" class="animate-pulse">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              Cargando usuarios...
            </td>
          </tr>
          <tr v-else-if="paginatedUsers.length === 0" class="hover:bg-gray-50">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              No se encontraron usuarios
            </td>
          </tr>
          <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ getInitials(user.first_name, user.last_name) }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ getFullName(user) }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getRoleBadgeClass(user.role)"
              >
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                v-model="user.newRole"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                :class="{ 'border-green-500 bg-green-50': user.role !== user.newRole }"
              >
                <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="confirmChangeRole(user)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="user.role === user.newRole || isUpdating"
                :class="{ 'opacity-50 cursor-not-allowed': user.role === user.newRole || isUpdating }"
              >
                <SaveIcon class="h-4 w-4 mr-1" />
                {{ isUpdating ? 'Guardando...' : 'Guardar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{{ startIndex + 1 }}</span> a <span class="font-medium">{{ endIndex }}</span> de <span class="font-medium">{{ filteredUsers.length }}</span> resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              <span class="sr-only">Anterior</span>
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
            >
              <span class="sr-only">Siguiente</span>
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para cambiar rol -->
    <div v-if="showRoleModal" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
      <!-- Fondo del modal (backdrop) -->
      <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true"></div>

      <!-- Contenido del modal -->
      <div class="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <UserCogIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Cambiar Rol de Usuario
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Estás a punto de cambiar el rol de <strong>{{ getFullName(selectedUser) }}</strong> de 
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getRoleBadgeClass(selectedUser?.role)"
                  >
                    {{ getRoleLabel(selectedUser?.role) }}
                  </span> 
                  a 
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getRoleBadgeClass(selectedUser?.newRole)"
                  >
                    {{ getRoleLabel(selectedUser?.newRole) }}
                  </span>
                </p>
                <div class="mt-4">
                  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <AlertCircleIcon class="h-5 w-5 text-yellow-400" />
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                          Cambiar el rol modificará los permisos y el acceso del usuario en el sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="changeRoleConfirmed"
            :disabled="isUpdating"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': isUpdating }"
          >
            {{ isUpdating ? 'Actualizando...' : 'Confirmar Cambio' }}
          </button>
          <button 
            @click="cancelRoleChange"
            :disabled="isUpdating"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Notificación de éxito -->
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <CheckCircleIcon class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">
            {{ notificationMessage }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="showNotification = false"
              class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span class="sr-only">Cerrar</span>
              <XIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificación de error -->
    <div 
      v-if="showErrorNotification"
      class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <AlertTriangleIcon class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ errorMessage }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="showErrorNotification = false"
              class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span class="sr-only">Cerrar</span>
              <XIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  SearchIcon, 
  XIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserCogIcon,
  CheckCircleIcon,
  SaveIcon,
  AlertCircleIcon,
  AlertTriangleIcon
} from 'lucide-vue-next'

// Interfaces
interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  additional_notes: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  newRole?: string;
}

// Estado
const users = ref<User[]>([])
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isLoading = ref(true)
const isUpdating = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref<User | null>(null)
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')

// Roles disponibles (basados en tu backend)
const availableRoles = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'planeacion', label: 'Planeación' },
  { value: 'instructor', label: 'Instructor' }
]

// Función para obtener usuarios del backend
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No autorizado. Inicie sesión.');
    }

    const res = await fetch('http://localhost:8000/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al obtener usuarios');
    }

    const data: User[] = await res.json();
    users.value = data.map(user => ({ ...user, newRole: user.role }));
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    showError(`Error al cargar usuarios: ${error.message || 'Ocurrió un error inesperado.'}`);
  } finally {
    isLoading.value = false;
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchUsers();
  console.log("ChangeRolComponent mounted. Initial showRoleModal:", showRoleModal.value);
})

// Filtrado de usuarios
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const fullName = getFullName(user).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase());

    return matchesSearch;
  });
});

// Paginación
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredUsers.value.length);
});

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Resetear página cuando cambia la búsqueda
watch(searchTerm, () => {
  currentPage.value = 1;
});

// Funciones de utilidad
const getInitials = (firstName: string | null, lastName: string | null) => {
  const firstInitial = firstName ? firstName.charAt(0) : '';
  const lastInitial = lastName ? lastName.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase().substring(0, 2) || 'U';
};

const getFullName = (user: User | null) => {
  if (!user) return '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.email;
};

const getRoleLabel = (role: string | undefined) => {
  if (!role) return '';
  const roleObj = availableRoles.find(r => r.value === role);
  return roleObj ? roleObj.label : role;
};

const getRoleBadgeClass = (role: string | undefined) => {
  switch (role) {
    case 'superadmin':
      return 'bg-purple-100 text-purple-800';
    case 'administrativo':
      return 'bg-blue-100 text-blue-800';
    case 'planeacion':
      return 'bg-yellow-100 text-yellow-800';
    case 'instructor':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Funciones de notificación
const showSuccess = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const showError = (message: string) => {
  errorMessage.value = message;
  showErrorNotification.value = true;
  setTimeout(() => {
    showErrorNotification.value = false;
  }, 5000);
};

// Acciones de cambio de rol
const confirmChangeRole = (user: User) => {
  selectedUser.value = user;
  showRoleModal.value = true;
};

const cancelRoleChange = () => {
  showRoleModal.value = false;
  selectedUser.value = null;
};

const updateUserRole = async (userId: number, newRole: string) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No autorizado. Inicie sesión.');
  }

  const res = await fetch(`http://localhost:8000/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role: newRole })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Error al actualizar el rol del usuario');
  }

  return await res.json();
};

const changeRoleConfirmed = async () => {
  if (!selectedUser.value || !selectedUser.value.newRole) return;
  
  isUpdating.value = true;
  
  try {
    await updateUserRole(selectedUser.value.id, selectedUser.value.newRole);
    
    // Actualizar el usuario en la lista local
    const user = users.value.find(u => u.id === selectedUser.value!.id);
    if (user) {
      const oldRole = getRoleLabel(user.role);
      user.role = selectedUser.value.newRole;
      
      showSuccess(`El rol de ${getFullName(user)} ha sido cambiado a ${getRoleLabel(user.role)}`);
    }
    
  } catch (error: any) {
    console.error('Error al cambiar el rol:', error);
    showError(`Error al cambiar el rol: ${error.message || 'Ocurrió un error inesperado.'}`);
    
    // Revertir el cambio en la UI
    if (selectedUser.value) {
      selectedUser.value.newRole = selectedUser.value.role;
    }
  } finally {
    isUpdating.value = false;
    showRoleModal.value = false;
    selectedUser.value = null;
  }
};
</script>
