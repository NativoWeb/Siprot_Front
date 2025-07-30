<template>
  <div class="container mx-auto py-6 px-4">
    <h1 class="text-2xl font-bold mb-6">Lista de Usuarios</h1>

    <!-- Búsqueda y filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar usuarios..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div class="w-full md:w-48">
          <select
            v-model="roleFilter"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="administrativo">Administrativo</option>
            <option value="planeacion">Planeación</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>
        <div class="w-full md:w-48">
          <select
            v-model="statusFilter"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Cargando usuarios...</p>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último acceso
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
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
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusBadgeClass(user.is_active)"
                >
                  {{ getStatusLabel(user.is_active) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <!-- El backend no proporciona 'lastLogin', puedes dejarlo vacío o añadir una lógica si lo implementas -->
                N/A
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewUser(user.id)"
                    class="text-gray-600 hover:text-gray-900"
                    title="Ver detalles"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click="editUser(user.id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar usuario"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click="confirmDeleteUser(user)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar usuario"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
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
    </div>

    <!-- Modal de detalles de usuario -->
    <UserDetailModal 
      :show="showDetailModal" 
      :user="userToView" 
      @close="closeDetailModal" 
    />

    <!-- Modal de edición de usuario -->
    <UserEditModal 
      :show="showEditModal" 
      :user="userToEdit" 
      :is-updating="isUpdating"
      @close="cancelEdit"
      @update="updateUser" 
    />

    <!-- Nuevo Modal de eliminación de usuario -->
    <UserDeleteModal
      :show="showDeleteModalComponent"
      :user="userToDeleteForModal"
      @close="showDeleteModalComponent = false"
      @deleted="handleUserDeleted"
      @error="handleDeleteError"
    />

    <!-- Notificación de éxito -->
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 shadow-md rounded-md z-[9999]"
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
      class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-[9999]"
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
import { ref, computed, onMounted } from 'vue'
import {
  SearchIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon
} from 'lucide-vue-next'

// Importar los componentes de modal
import UserDetailModal from './UserDetailModal.vue'
import UserEditModal from './UserEditModal.vue'
import UserDeleteModal from './DeleteUserComponent.vue' // Importar el nuevo modal de eliminación

// Tipado para el usuario
interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  additional_notes: string | null;
  role: string;
  is_active: boolean;
  created_at: string; // O Date si lo parseas
}

// Estado
const users = ref<User[]>([])
const searchTerm = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isLoading = ref(true)

// Estado para el modal de edición
const showEditModal = ref(false)
const userToEdit = ref<User | null>(null)
const isUpdating = ref(false)

// Estado para el modal de detalles
const showDetailModal = ref(false)
const userToView = ref<User | null>(null)

// Estado para el nuevo modal de eliminación
const showDeleteModalComponent = ref(false)
const userToDeleteForModal = ref<User | null>(null)

// Estado para notificaciones
const showNotification = ref(false)
const showErrorNotification = ref(false)
const notificationMessage = ref('')
const errorMessage = ref('')

// Función para obtener usuarios del backend
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showError('No autorizado. Inicie sesión.');
      isLoading.value = false;
      return;
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
    users.value = data;
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
})

// Filtrado de usuarios
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase());

    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value;
    const matchesStatus = statusFilter.value === 'all' ||
                          (statusFilter.value === 'active' && user.is_active) ||
                          (statusFilter.value === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
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

// Funciones de utilidad
const getInitials = (firstName: string | null, lastName: string | null) => {
  const firstInitial = firstName ? firstName.charAt(0) : '';
  const lastInitial = lastName ? lastName.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase().substring(0, 2);
};

const getRoleLabel = (role: string) => {
  const labels: { [key: string]: string } = {
    superadmin: 'Superadmin',
    administrativo: 'Administrativo',
    planeacion: 'Planeación',
    instructor: 'Instructor'
  };
  return labels[role] || role;
};

const getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Activo' : 'Inactivo';
};

const getRoleBadgeClass = (role: string) => {
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

const getStatusBadgeClass = (isActive: boolean) => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

const getFullName = (user: User | null) => {
  if (!user) return '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.email;
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

// Acciones de usuario
// Función para ver detalles del usuario
const viewUser = (userId: number) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    userToView.value = user;
    showDetailModal.value = true;
  }
};

// Función para cerrar el modal de detalles
const closeDetailModal = () => {
  showDetailModal.value = false;
  userToView.value = null;
};

// Función para editar usuario
const editUser = (userId: number) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    userToEdit.value = user;
    showEditModal.value = true;
  }
};

const updateUser = async (formData: any) => {
  if (!userToEdit.value) return;

  isUpdating.value = true;
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showError('No autorizado. Inicie sesión.');
      return;
    }

    const res = await fetch(`http://localhost:8000/users/${userToEdit.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: formData.email,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        phone_number: formData.phone_number || null,
        additional_notes: formData.additional_notes || null,
        role: formData.role,
        is_active: formData.is_active
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al actualizar usuario');
    }

    showSuccess('Usuario actualizado exitosamente!');
    fetchUsers(); // Recargar la lista de usuarios
    showEditModal.value = false;
    userToEdit.value = null;
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    showError(`Error al actualizar usuario: ${error.message || 'Ocurrió un error inesperado.'}`);
  } finally {
    isUpdating.value = false;
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  userToEdit.value = null;
  isUpdating.value = false;
};

// Función para confirmar eliminación (ahora usa el nuevo modal)
const confirmDeleteUser = (user: User) => {
  userToDeleteForModal.value = user;
  showDeleteModalComponent.value = true;
};

// Manejador cuando el UserDeleteModal emite 'deleted'
const handleUserDeleted = () => {
  showSuccess('Usuario eliminado exitosamente!');
  fetchUsers(); // Recargar la lista de usuarios después de la eliminación
};

// Manejador cuando el UserDeleteModal emite 'error'
const handleDeleteError = (message: string) => {
  showError(message);
};
</script>
