<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <!-- Fondo oscuro -->
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true"></div>
    
    <!-- Contenido del modal -->
    <div class="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">Eliminar usuario</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar a <strong>{{ getFullName(user) }}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button 
          @click="handleDeleteConfirmed"
          :disabled="isDeleting"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': isDeleting }"
        >
          {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
        <button 
          @click="$emit('close')"
          :disabled="isDeleting"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangleIcon } from 'lucide-vue-next'

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

const props = defineProps<Props>()
const emit = defineEmits<{
  close: [];
  deleted: [];
  error: [message: string];
}>();

const isDeleting = ref(false);

const getFullName = (user: User | null) => {
  if (!user) return '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.email;
};

const handleDeleteConfirmed = async () => {
  if (!props.user) return;

  isDeleting.value = true;
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No autorizado. Inicie sesión.');
    }

    const res = await fetch(`http://localhost:8000/users/${props.user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Error al eliminar usuario');
    }

    emit('deleted'); // Notificar que la eliminación fue exitosa
    emit('close'); // Cerrar el modal
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    emit('error', `Error al eliminar usuario: ${error.message || 'Ocurrió un error inesperado.'}`);
  } finally {
    isDeleting.value = false;
  }
};
</script>
