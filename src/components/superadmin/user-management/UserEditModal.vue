<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
    <!-- Fondo del modal (backdrop) -->
    <div class="absolute inset-0 bg-gray-500 opacity-75" aria-hidden="true"></div>
    
    <!-- Contenido del modal -->
    <div class="relative z-10 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <PencilIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Editar Usuario</h3>
            <div class="mt-2">
              <form @submit.prevent="$emit('update', editForm)" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      v-model="editForm.email"
                      type="email"
                      required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.email }"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Rol *</label>
                    <select
                      v-model="editForm.role"
                      required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="superadmin">Superadmin</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="planeacion">Planeación</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      v-model="editForm.first_name"
                      type="text"
                      maxlength="100"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      v-model="editForm.last_name"
                      type="text"
                      maxlength="100"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      v-model="editForm.phone_number"
                      type="tel"
                      maxlength="20"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.phone_number }"
                    />
                    <p v-if="errors.phone_number" class="mt-1 text-sm text-red-600">{{ errors.phone_number }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Estado</label>
                    <div class="mt-1">
                      <label class="inline-flex items-center">
                        <input
                          v-model="editForm.is_active"
                          type="checkbox"
                          class="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span class="ml-2 text-sm text-gray-700">Usuario activo</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Notas adicionales</label>
                  <textarea
                    v-model="editForm.additional_notes"
                    rows="3"
                    maxlength="500"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Información adicional sobre el usuario..."
                  ></textarea>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ (editForm.additional_notes || '').length }}/500 caracteres
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="handleUpdate"
          :disabled="isUpdating || !isFormValid"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': isUpdating || !isFormValid }"
        >
          {{ isUpdating ? 'Actualizando...' : 'Actualizar' }}
        </button>
        <button
          @click="$emit('close')"
          :disabled="isUpdating"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PencilIcon } from 'lucide-vue-next'

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

interface EditForm {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  additional_notes: string;
  role: string;
  is_active: boolean;
}

interface Props {
  show: boolean;
  user: User | null;
  isUpdating?: boolean;
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  update: [form: EditForm]
}>()

// Estado del formulario
const editForm = ref<EditForm>({
  email: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  additional_notes: '',
  role: 'instructor',
  is_active: true
})

// Errores de validación
const errors = ref<Record<string, string>>({})

// Validación del formulario
const isFormValid = computed(() => {
  return editForm.value.email && 
         editForm.value.role && 
         Object.keys(errors.value).length === 0
})

// Validar email
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar teléfono
const validatePhone = (phone: string) => {
  if (!phone) return true // Opcional
  const phoneRegex = /^[\d\s\-\+$$$$]+$/
  return phoneRegex.test(phone)
}

// Validar formulario
const validateForm = () => {
  errors.value = {}
  
  if (!editForm.value.email) {
    errors.value.email = 'El email es requerido'
  } else if (!validateEmail(editForm.value.email)) {
    errors.value.email = 'El formato del email no es válido'
  }
  
  if (editForm.value.phone_number && !validatePhone(editForm.value.phone_number)) {
    errors.value.phone_number = 'El formato del teléfono no es válido'
  }
}

// Manejar actualización
const handleUpdate = () => {
  validateForm()
  if (isFormValid.value) {
    emit('update', editForm.value)
  }
}

// Cargar datos del usuario cuando cambie
watch(() => props.user, (newUser) => {
  if (newUser) {
    editForm.value = {
      email: newUser.email,
      first_name: newUser.first_name || '',
      last_name: newUser.last_name || '',
      phone_number: newUser.phone_number || '',
      additional_notes: newUser.additional_notes || '',
      role: newUser.role,
      is_active: newUser.is_active
    }
    errors.value = {}
  }
}, { immediate: true })

// Validar en tiempo real
watch(() => editForm.value.email, () => {
  if (errors.value.email) {
    validateForm()
  }
})

watch(() => editForm.value.phone_number, () => {
  if (errors.value.phone_number) {
    validateForm()
  }
})
</script>
