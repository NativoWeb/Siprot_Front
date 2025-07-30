<template>
  <div class="container mx-auto py-8 px-4 max-w-7xl">
    <!-- Encabezado y descripción -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Roles del Sistema</h1>
      <p class="mt-2 text-gray-600">
        Visualización de roles predefinidos y sus permisos asociados en el sistema SIPROT-IA.
      </p>
    </div>

    <!-- Estadísticas de roles -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div 
        v-for="stat in roleStats" 
        :key="stat.name" 
        class="bg-white rounded-lg shadow p-6 border-l-4"
        :class="stat.colorClass"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full" :class="stat.bgClass">
            <component :is="stat.icon" class="h-6 w-6" :class="stat.iconClass" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.count }}</p>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-600">{{ stat.description }}</p>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow mb-8 p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-grow max-w-md">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar roles..."
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <SearchIcon class="h-5 w-5" />
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="category in categories" 
            :key="category.value"
            @click="toggleCategory(category.value)"
            class="px-4 py-2 text-sm rounded-full transition-colors"
            :class="[
              selectedCategories.includes(category.value) 
                ? category.activeClass 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de roles -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">Roles Predefinidos</h2>
        <p class="text-gray-500 text-sm mt-1">
          {{ filteredRoles.length }} roles encontrados
        </p>
      </div>

      <div class="divide-y divide-gray-200">
        <div 
          v-for="role in filteredRoles" 
          :key="role.id" 
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center">
              <div 
                class="p-2 rounded-lg mr-4"
                :class="getRoleBadgeClass(role.category)"
              >
                <component :is="getRoleIcon(role.category)" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  {{ role.name }}
                  <span 
                    v-if="role.isDefault" 
                    class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    Predeterminado
                  </span>
                </h3>
                <p class="text-gray-500 text-sm">{{ role.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span 
                class="px-3 py-1 text-xs rounded-full"
                :class="getRoleLevelClass(role.accessLevel)"
              >
                {{ role.accessLevel }}
              </span>
              <button 
                @click="toggleRoleDetails(role.id)"
                class="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronDownIcon 
                  class="h-5 w-5 text-gray-500 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedRoles.includes(role.id) }"
                />
              </button>
            </div>
          </div>

          <!-- Detalles expandibles -->
          <div 
            v-if="expandedRoles.includes(role.id)"
            class="mt-6 pl-14 md:pl-16 animate-fadeIn"
          >
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 class="font-medium text-gray-900 mb-3">Permisos del Rol</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="(permissions, module) in role.permissions" 
                  :key="module"
                  class="bg-white p-4 rounded border border-gray-200"
                >
                  <h5 class="font-medium text-gray-900 mb-2">{{ module }}</h5>
                  <ul class="space-y-2">
                    <li 
                      v-for="(value, permission) in permissions" 
                      :key="permission"
                      class="flex items-center text-sm"
                    >
                      <CheckCircleIcon 
                        v-if="value" 
                        class="h-5 w-5 text-green-500 mr-2" 
                      />
                      <XCircleIcon 
                        v-else 
                        class="h-5 w-5 text-gray-300 mr-2" 
                      />
                      <span :class="{ 'text-gray-400': !value }">
                        {{ permission }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Información adicional</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li><span class="font-medium">Creado:</span> {{ role.createdAt }}</li>
                    <li><span class="font-medium">Última modificación:</span> {{ role.updatedAt }}</li>
                    <li><span class="font-medium">ID del rol:</span> {{ role.id }}</li>
                  </ul>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center">
                    <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
                    Ver detalles
                  </button>
                  <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center">
                    <UsersIcon class="h-4 w-4 mr-2" />
                    Ver usuarios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  SearchIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  UsersIcon
} from '@heroicons/vue/outline';

// Estado
const searchTerm = ref('');
const expandedRoles = ref([]);
const selectedCategories = ref([]);

// Categorías de roles
const categories = [
  { label: 'Administrativo', value: 'administrative', activeClass: 'bg-red-100 text-red-800' },
  { label: 'Gestión', value: 'management', activeClass: 'bg-blue-100 text-blue-800' },
  { label: 'Operativo', value: 'operational', activeClass: 'bg-green-100 text-green-800' },
  { label: 'Educativo', value: 'educational', activeClass: 'bg-purple-100 text-purple-800' }
];

// Datos de ejemplo
const roles = [
  {
    id: '1',
    name: 'Superadmin',
    description: 'Control total del sistema con acceso a todas las funcionalidades',
    category: 'administrative',
    accessLevel: 'Nivel 1',
    isDefault: false,
    createdAt: '01/01/2025',
    updatedAt: '15/05/2025',
    permissions: {
      'Usuarios': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Eliminar': true,
        'Cambiar roles': true
      },
      'Configuración': {
        'Ver': true,
        'Modificar': true,
        'Reiniciar sistema': true
      },
      'Reportes': {
        'Ver': true,
        'Crear': true,
        'Exportar': true,
        'Compartir': true
      }
    }
  },
  {
    id: '2',
    name: 'Planeación',
    description: 'Gestión de documentos estratégicos y análisis de datos',
    category: 'management',
    accessLevel: 'Nivel 2',
    isDefault: true,
    createdAt: '01/01/2025',
    updatedAt: '10/05/2025',
    permissions: {
      'Documentos': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Eliminar': true,
        'Aprobar': true
      },
      'Análisis': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Compartir': true
      },
      'Reportes': {
        'Ver': true,
        'Crear': true,
        'Exportar': true,
        'Compartir': true
      }
    }
  },
  {
    id: '3',
    name: 'Directivo',
    description: 'Visualización de indicadores y toma de decisiones estratégicas',
    category: 'management',
    accessLevel: 'Nivel 2',
    isDefault: true,
    createdAt: '01/01/2025',
    updatedAt: '05/05/2025',
    permissions: {
      'Indicadores': {
        'Ver': true,
        'Exportar': true,
        'Compartir': true,
        'Comentar': true,
        'Editar': false
      },
      'Reportes': {
        'Ver': true,
        'Exportar': true,
        'Compartir': true,
        'Crear': false
      },
      'Documentos': {
        'Ver': true,
        'Aprobar': true,
        'Comentar': true,
        'Editar': false,
        'Eliminar': false
      }
    }
  },
  {
    id: '4',
    name: 'Instructor',
    description: 'Consulta de documentos y reportes estratégicos',
    category: 'educational',
    accessLevel: 'Nivel 3',
    isDefault: true,
    createdAt: '01/01/2025',
    updatedAt: '20/04/2025',
    permissions: {
      'Biblioteca': {
        'Ver': true,
        'Descargar': true,
        'Marcar favoritos': true,
        'Editar': false,
        'Eliminar': false
      },
      'Reportes': {
        'Ver': true,
        'Descargar': true,
        'Comentar': false,
        'Crear': false,
        'Editar': false
      },
      'DOFA': {
        'Ver': true,
        'Comentar': false,
        'Editar': false,
        'Crear': false
      }
    }
  },
  {
    id: '5',
    name: 'Analista',
    description: 'Procesamiento y análisis de datos institucionales',
    category: 'operational',
    accessLevel: 'Nivel 2',
    isDefault: false,
    createdAt: '15/02/2025',
    updatedAt: '01/06/2025',
    permissions: {
      'Datos': {
        'Ver': true,
        'Analizar': true,
        'Exportar': true,
        'Importar': true,
        'Eliminar': false
      },
      'Reportes': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Compartir': true,
        'Eliminar': false
      },
      'Indicadores': {
        'Ver': true,
        'Calcular': true,
        'Actualizar': true,
        'Crear': false,
        'Eliminar': false
      }
    }
  },
  {
    id: '6',
    name: 'Coordinador',
    description: 'Supervisión de actividades y gestión de equipos',
    category: 'educational',
    accessLevel: 'Nivel 2',
    isDefault: false,
    createdAt: '15/03/2025',
    updatedAt: '25/05/2025',
    permissions: {
      'Equipos': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Eliminar': false,
        'Asignar': true
      },
      'Actividades': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Aprobar': true,
        'Eliminar': false
      },
      'Reportes': {
        'Ver': true,
        'Crear': true,
        'Exportar': true,
        'Compartir': true,
        'Eliminar': false
      }
    }
  },
  {
    id: '7',
    name: 'Auditor',
    description: 'Revisión y verificación de procesos y actividades',
    category: 'administrative',
    accessLevel: 'Nivel 2',
    isDefault: false,
    createdAt: '10/04/2025',
    updatedAt: '05/06/2025',
    permissions: {
      'Auditoría': {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Finalizar': true,
        'Eliminar': false
      },
      'Logs': {
        'Ver': true,
        'Exportar': true,
        'Analizar': true,
        'Eliminar': false,
        'Modificar': false
      },
      'Reportes': {
        'Ver': true,
        'Crear': true,
        'Exportar': true,
        'Compartir': true,
        'Eliminar': false
      }
    }
  },
  {
    id: '8',
    name: 'Invitado',
    description: 'Acceso limitado a información pública del sistema',
    category: 'operational',
    accessLevel: 'Nivel 4',
    isDefault: true,
    createdAt: '01/01/2025',
    updatedAt: '01/01/2025',
    permissions: {
      'Documentos': {
        'Ver': true,
        'Descargar': false,
        'Editar': false,
        'Crear': false,
        'Eliminar': false
      },
      'Reportes': {
        'Ver': true,
        'Descargar': false,
        'Editar': false,
        'Crear': false,
        'Eliminar': false
      },
      'Sistema': {
        'Ver': false,
        'Configurar': false,
        'Administrar': false,
        'Auditar': false,
        'Reiniciar': false
      }
    }
  }
];

// Estadísticas de roles
const roleStats = [
  {
    name: 'Roles Administrativos',
    count: roles.filter(r => r.category === 'administrative').length,
    description: 'Roles con acceso a funciones de administración del sistema',
    icon: ShieldCheckIcon,
    colorClass: 'border-red-500',
    bgClass: 'bg-red-100',
    iconClass: 'text-red-600'
  },
  {
    name: 'Roles de Gestión',
    count: roles.filter(r => r.category === 'management').length,
    description: 'Roles enfocados en la toma de decisiones estratégicas',
    icon: UserIcon,
    colorClass: 'border-blue-500',
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600'
  },
  {
    name: 'Roles Operativos',
    count: roles.filter(r => r.category === 'operational').length,
    description: 'Roles para operaciones diarias del sistema',
    icon: UserGroupIcon,
    colorClass: 'border-green-500',
    bgClass: 'bg-green-100',
    iconClass: 'text-green-600'
  },
  {
    name: 'Roles Educativos',
    count: roles.filter(r => r.category === 'educational').length,
    description: 'Roles específicos para el personal educativo',
    icon: AcademicCapIcon,
    colorClass: 'border-purple-500',
    bgClass: 'bg-purple-100',
    iconClass: 'text-purple-600'
  }
];

// Métodos
const toggleRoleDetails = (roleId) => {
  if (expandedRoles.value.includes(roleId)) {
    expandedRoles.value = expandedRoles.value.filter(id => id !== roleId);
  } else {
    expandedRoles.value.push(roleId);
  }
};

const toggleCategory = (category) => {
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== category);
  } else {
    selectedCategories.value.push(category);
  }
};

// Funciones para clases condicionales
const getRoleBadgeClass = (category) => {
  switch (category) {
    case 'administrative': return 'bg-red-100 text-red-600';
    case 'management': return 'bg-blue-100 text-blue-600';
    case 'operational': return 'bg-green-100 text-green-600';
    case 'educational': return 'bg-purple-100 text-purple-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getRoleIcon = (category) => {
  switch (category) {
    case 'administrative': return ShieldCheckIcon;
    case 'management': return UserIcon;
    case 'operational': return UserGroupIcon;
    case 'educational': return AcademicCapIcon;
    default: return UserIcon;
  }
};

const getRoleLevelClass = (level) => {
  switch (level) {
    case 'Nivel 1': return 'bg-red-100 text-red-800';
    case 'Nivel 2': return 'bg-blue-100 text-blue-800';
    case 'Nivel 3': return 'bg-green-100 text-green-800';
    case 'Nivel 4': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Computed properties
const filteredRoles = computed(() => {
  return roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    const matchesCategory = 
      selectedCategories.value.length === 0 || 
      selectedCategories.value.includes(role.category);
    
    return matchesSearch && matchesCategory;
  });
});
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>