<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Modal para crear/editar tipo de documento -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingDocumentType ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Plan de Desarrollo Institucional"
              />
              <p v-if="duplicateError" class="mt-1 text-sm text-red-600">Ya existe un tipo de documento con este nombre</p>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Descripción del tipo de documento..."
              ></textarea>
            </div>
            
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                id="category"
                v-model="formData.category"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar categoría</option>
                <option value="administrativo">Administrativo</option>
                <option value="academico">Académico</option>
                <option value="legal">Legal</option>
                <option value="financiero">Financiero</option>
                <option value="calidad">Sistema de Calidad</option>
              </select>
            </div>
            
            <div>
              <label for="extensions" class="block text-sm font-medium text-gray-700">Extensiones Permitidas</label>
              <div class="mt-2 space-y-2">
                <label class="inline-flex items-center">
                  <input type="checkbox" v-model="formData.extensions" value="pdf" class="form-checkbox h-4 w-4 text-green-600">
                  <span class="ml-2 text-sm text-gray-700">PDF</span>
                </label>
                <label class="inline-flex items-center ml-4">
                  <input type="checkbox" v-model="formData.extensions" value="docx" class="form-checkbox h-4 w-4 text-green-600">
                  <span class="ml-2 text-sm text-gray-700">DOCX</span>
                </label>
                <label class="inline-flex items-center ml-4">
                  <input type="checkbox" v-model="formData.extensions" value="xlsx" class="form-checkbox h-4 w-4 text-green-600">
                  <span class="ml-2 text-sm text-gray-700">XLSX</span>
                </label>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || duplicateError"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Guardando...' : (editingDocumentType ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Encabezado y acciones principales -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tipos de Documentos</h1>
        <p class="text-gray-500 mt-1">Gestión del catálogo de documentos institucionales</p>
      </div>
      <div class="mt-4 md:mt-0 flex flex-wrap gap-2">
        <button @click="showModal = true"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd" />
          </svg>
          Nuevo Tipo
        </button>
        <button @click="exportData" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
          Exportar
        </button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <input id="search" v-model="searchTerm" type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Buscar por código, nombre o descripción..." />
          </div>
        </div>
        <div class="md:w-48">
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select id="category" v-model="categoryFilter"
            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
            <option value="">Todas las categorías</option>
            <option value="administrativo">Administrativos</option>
            <option value="academico">Académicos</option>
            <option value="legal">Legales</option>
            <option value="financiero">Financieros</option>
            <option value="calidad">Sistema de Calidad</option>
          </select>
        </div>
        <div class="md:w-48">
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select id="status" v-model="statusFilter"
            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
        <div class="self-end">
          <button @click="clearFilters"
            class="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-full p-3">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Total Tipos</h2>
            <p class="text-lg font-semibold text-gray-900">{{ documentTypes.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-100 rounded-full p-3">
            <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Creados este mes</h2>
            <p class="text-lg font-semibold text-gray-900">{{ newThisMonth }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-100 rounded-full p-3">
            <svg class="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Más utilizados</h2>
            <p class="text-lg font-semibold text-gray-900">{{ mostUsedCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-red-100 rounded-full p-3">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Tiempo promedio</h2>
            <p class="text-lg font-semibold text-gray-900">{{ averageProcessTime }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de tipos de documentos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Loading state added -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span class="ml-2 text-gray-600">Cargando tipos de documentos...</span>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Formato
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Versión
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="doc in filteredDocumentTypes" :key="doc.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ doc.code }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="getCategoryClass(doc.category)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ doc.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                  <span :class="getFormatIconClass(doc.format)" class="mr-2"></span>
                  {{ doc.format }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.version }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(doc.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ doc.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="editDocumentType(doc)" class="text-indigo-600 hover:text-indigo-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button @click="duplicateDocumentType(doc)" class="text-green-600 hover:text-green-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                  </button>
                  <button @click="deleteDocumentType(doc)" class="text-red-600 hover:text-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDocumentTypes.length === 0 && !isLoading">
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                No se encontraron tipos de documentos que coincidan con los filtros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">{{ Math.min(10,
                  filteredDocumentTypes.length) }}</span> de <span class="font-medium">{{ filteredDocumentTypes.length
                  }}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-600 hover:bg-green-100">
                  3
                </button>
                <span
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  8
                </button>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  9
                </button>
                <button
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  10
                </button>
                <button
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L11.414 10l1.293-1.293a1 1 0 01-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error notification added -->
    <div v-if="showErrorNotification" class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 shadow-md rounded-md z-50">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="showErrorNotification = false" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ModalComponent from '../../modals/ModalComponent.vue';

const isLoading = ref(false);
const showErrorNotification = ref(false);
const errorMessage = ref('');

// Estado para filtros
const searchTerm = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');
const showModal = ref(false);

// Estado para modal functionality
const editingDocumentType = ref(null);
const isSubmitting = ref(false);
const duplicateError = ref(false);

const formData = ref({
  name: '',
  description: '',
  category: '',
  extensions: ['pdf']
});

const documentTypes = ref([]);

// Duplicate name validation
const checkDuplicate = computed(() => {
  if (!formData.value.name) return false;
  
  const exists = documentTypes.value.some(doc => 
    doc.name.toLowerCase() === formData.value.name.toLowerCase() && 
    (!editingDocumentType.value || doc.id !== editingDocumentType.value.id)
  );
  
  duplicateError.value = exists;
  return exists;
});

// Watch for name changes to check duplicates
watch(() => formData.value.name, () => {
  checkDuplicate.value;
});

// Form submission logic
const submitForm = async () => {
  if (checkDuplicate.value) return;
  
  isSubmitting.value = true;
  
  try {
    const documentTypeData = {
      name: formData.value.name,
      description: formData.value.description,
      category: formData.value.category,
      allowed_extensions: formData.value.extensions
    };
    
    let success = false;
    
    if (editingDocumentType.value) {
      success = await updateDocumentType(editingDocumentType.value.id, documentTypeData);
    } else {
      success = await createDocumentType(documentTypeData);
    }
    
    if (success) {
      closeModal();
      // Show success message could be added here
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Modal management functions
const closeModal = () => {
  showModal.value = false;
  editingDocumentType.value = null;
  formData.value = {
    name: '',
    description: '',
    category: '',
    extensions: ['pdf']
  };
  duplicateError.value = false;
};

const fetchDocumentTypes = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/catalogs/document-types/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      documentTypes.value = data.map(type => ({
        id: type.id,
        code: type.code || `DT-${type.id.toString().padStart(3, '0')}`,
        name: type.name,
        category: type.category || 'General',
        format: type.format || 'PDF',
        version: type.version || '1.0',
        status: type.is_active ? 'Activo' : 'Inactivo',
        description: type.description || '',
        createdAt: type.created_at,
        updatedAt: type.updated_at,
        usageCount: type.usage_count || 0,
        allowed_extensions: type.allowed_extensions || ['pdf']
      }));
    } else {
      throw new Error('Error al cargar tipos de documentos');
    }
  } catch (error) {
    console.error('Error loading document types:', error);
    showError('Error al cargar los tipos de documentos desde el servidor');
    // Fallback to mock data
    loadMockData();
  } finally {
    isLoading.value = false;
  }
};

const createDocumentType = async (documentTypeData) => {
  try {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1; // Fallback a 1 si no hay user_id
    
    const requestData = {
      name: documentTypeData.name,
      description: documentTypeData.description,
      allowed_extensions: documentTypeData.allowed_extensions,
      is_active: true,
      created_by: userId
    };
    
    const response = await fetch('http://localhost:8000/catalogs/document-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
      await fetchDocumentTypes(); // Refresh the list
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear tipo de documento');
    }
  } catch (error) {
    console.error('Error creating document type:', error);
    showError(error.message || 'Error al crear el tipo de documento');
    return false;
  }
};

const updateDocumentType = async (id, documentTypeData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/catalogs/document-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(documentTypeData)
    });
    
    if (response.ok) {
      await fetchDocumentTypes(); // Refresh the list
      return true;
    } else {
      throw new Error('Error al actualizar tipo de documento');
    }
  } catch (error) {
    console.error('Error updating document type:', error);
    showError('Error al actualizar el tipo de documento');
    return false;
  }
};

const deleteDocumentTypeAPI = async (id) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/catalogs/document-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      await fetchDocumentTypes(); // Refresh the list
      return true;
    } else {
      throw new Error('Error al eliminar tipo de documento');
    }
  } catch (error) {
    console.error('Error deleting document type:', error);
    showError('Error al eliminar el tipo de documento');
    return false;
  }
};

const exportData = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/catalogs/document-types/export', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tipos_documentos.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      throw new Error('Error al exportar datos');
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    showError('Error al exportar los datos');
  }
};

const showError = (message) => {
  errorMessage.value = message;
  showErrorNotification.value = true;
  setTimeout(() => {
    showErrorNotification.value = false;
  }, 5000);
};

const loadMockData = () => {
  documentTypes.value = [];
};

// Estadísticas calculadas
const newThisMonth = computed(() => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return documentTypes.value.filter(doc => new Date(doc.createdAt) >= firstDayOfMonth).length;
});

const mostUsedCount = computed(() => {
  return documentTypes.value.reduce((max, doc) => Math.max(max, doc.usageCount), 0);
});

const averageProcessTime = computed(() => {
  return '3.5 días';
});

// Filtrado de documentos
const filteredDocumentTypes = computed(() => {
  return documentTypes.value.filter(doc => {
    const matchesSearch =
      searchTerm.value === '' ||
      doc.code.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.value.toLowerCase());

    const matchesCategory =
      categoryFilter.value === '' ||
      doc.category.toLowerCase() === categoryFilter.value.toLowerCase();

    const matchesStatus =
      statusFilter.value === '' ||
      doc.status.toLowerCase() === statusFilter.value.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

// Métodos para clases CSS
const getCategoryClass = (category) => {
  const classes = {
    'Administrativo': 'bg-blue-100 text-blue-800',
    'Académico': 'bg-green-100 text-green-800',
    'Legal': 'bg-purple-100 text-purple-800',
    'Financiero': 'bg-yellow-100 text-yellow-800',
    'Calidad': 'bg-indigo-100 text-indigo-800'
  };
  return classes[category] || 'bg-gray-100 text-gray-800';
};

const getStatusClass = (status) => {
  const classes = {
    'Activo': 'bg-green-100 text-green-800',
    'Inactivo': 'bg-gray-100 text-gray-800',
    'Borrador': 'bg-yellow-100 text-yellow-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getFormatIconClass = (format) => {
  const classes = {
    'PDF': 'fas fa-file-pdf text-red-500',
    'DOCX': 'fas fa-file-word text-blue-500',
    'XLSX': 'fas fa-file-excel text-green-500'
  };
  return classes[format] || 'fas fa-file text-gray-500';
};

// Métodos para acciones
const clearFilters = () => {
  searchTerm.value = '';
  categoryFilter.value = '';
  statusFilter.value = '';
};

const editDocumentType = (doc) => {
  editingDocumentType.value = doc;
  formData.value = {
    name: doc.name,
    description: doc.description || '',
    category: doc.category || '',
    extensions: doc.allowed_extensions || ['pdf']
  };
  showModal.value = true;
};

const duplicateDocumentType = async (doc) => {
  const duplicatedData = {
    name: `${doc.name} (Copia)`,
    description: doc.description,
    category: doc.category,
    format: doc.format
  };
  
  const success = await createDocumentType(duplicatedData);
  if (success) {
    console.log('Tipo de documento duplicado exitosamente');
  }
};

const deleteDocumentType = async (doc) => {
  if (confirm(`¿Está seguro de que desea eliminar el tipo de documento "${doc.name}"?`)) {
    const success = await deleteDocumentTypeAPI(doc.id);
    if (success) {
      console.log('Tipo de documento eliminado exitosamente');
    }
  }
};

onMounted(() => {
  fetchDocumentTypes();
});
</script>

<style scoped>
/* Estilos adicionales específicos del componente */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos para los iconos de formato (requiere FontAwesome o similar) */
.fas {
  display: inline-block;
  width: 16px;
  height: 16px;
}
</style>
