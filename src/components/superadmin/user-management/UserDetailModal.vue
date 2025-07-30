<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <!-- Fondo del modal (backdrop) -->
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true"></div>
    
    <!-- Contenido del modal -->
    <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <EyeIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Detalles del Usuario</h3>
            <div v-if="user" class="mt-2 space-y-3">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-16 w-16">
                  <div class="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xl">
                    {{ getInitials(user.first_name, user.last_name) }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-lg font-medium text-gray-900">{{ getFullName(user) }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              
              <div class="border-t border-gray-200 pt-4">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Rol</dt>
                    <dd class="mt-1">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getRoleBadgeClass(user.role)"
                      >
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Estado</dt>
                    <dd class="mt-1">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getStatusBadgeClass(user.is_active)"
                      >
                        {{ getStatusLabel(user.is_active) }}
                      </span>
                    </dd>
                  </div>
                  <div v-if="user.phone_number">
                    <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ user.phone_number }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Fecha de creación</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.created_at) }}</dd>
                  </div>
                  <div v-if="user.additional_notes" class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Notas adicionales</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ user.additional_notes }}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div v-else class="mt-2">
              <p class="text-sm text-gray-500">No se encontraron datos del usuario.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="$emit('close')"
          class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon } from 'lucide-vue-next'

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
}

interface Props {
  show: boolean;
  user: User | null;
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
