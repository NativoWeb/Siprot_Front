<script setup lang="ts">
  import BarChat from '../charts/BarChart.vue'
</script>

<template>
  <div class="w-[90%]">

    <div class="mt-12  bg-[#08ac04] text-white rounded-lg p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
        <h1 class="text-2xl font-bold mb-2">¡Bienvenido, Superadministrador!</h1>
        <p class="text-green-100">
          Gestiona el sistema SENA desde este panel de control. Aquí tienes un resumen de la actividad reciente.
        </p>
      </div>
    </div>
  </div>

  <div class="mt-6 flex gap-20">
    <div class="container-info w-[100%]">
      <h2>Usuarios Registrados</h2>
      <span>1,267 </span> 
    </div>
    <div class="container-info w-[100%]">
      <h2>Documentos Cargados</h2>
      <span>689 </span>
    </div>
  </div>

  <div class="mt-6 flex gap-20">
    <div class="container-info w-[100%]">
      <h3>Usuarios Registrados</h3>
      <span class="subtitle">Evolucion mensual de usuarios</span>
      <BarChat/>
    </div>
    <div class="container-info w-[100%]">
      <h3>Documentos</h3>
      <span class="subtitle">Estadísticas de documentos por mes</span>
      <BarChat/>
    </div>
  </div>

  <div class="mt-6 flex gap-20">
    <div class="container-info w-[100%]">
      <h3>Distribución de Roles</h3>
      <span class="subtitle">Usuarios por tipo de rol</span>
      <BarChat/>
    </div>  
  </div>

  <!-- Graficos Hardcoded Job Data -->
  <div class="mt-6 flex gap-20">
    <div class="container-info w-[100%]">
      <h3>Acciones Rapidas</h3>
      <span class="subtitle">Funciones mas utilizadas</span>
      <div class=" mt-10 justify-around flex flex-col gap-10">
        <div class="flex gap-6">
          <div class="py-8 bg-[#3bb7d975] w-[100%] max-w-[285px] container-info">
            <h3 class="font-medium ">Crear Usuario</h3>
            <span class="subtitle">Añadir nuevo usuario</span>
          </div>
          <div class="py-8 bg-[#f974167a] w-[100%] max-w-[285px] container-info">
            <h3 class="font-medium ">Gestionar Roles</h3>
            <span class="subtitle">Editar permisos </span>
          </div>
        </div>
        <div class="flex gap-6">
          <div class="py-8 bg-[#a231d688] w-[100%] max-w-[285px] container-info">
            <h3 class="font-medium ">Exportar Datos</h3>
            <span class="subtitle">Generar reportes</span>
          </div>
          <div class="py-8 bg-[#22c55e7e] w-[100%] max-w-[285px] container-info">
            <h3 class="font-medium ">Importar Datos</h3>
            <span class="subtitle">Cargar Información</span>
          </div>
        </div>
      </div>
    </div>
    <div class="container-info w-[100%]">
      <h3>Catalogos Institucionales</h3>
      <span class="subtitle">Resumen de catálogos</span>
      <div class="mt-6 flex flex-col justify-between gap-8">
        <div class="bg-gray-200 flex items-center pl-6 w-[100%] h-[50px] roundend-custom">Sectores Económicos</div>
        <div class="bg-gray-200 flex items-center pl-6 w-[100%] h-[50px] roundend-custom">Lineas Medulares</div>
        <div class="bg-gray-200 flex items-center pl-6 w-[100%] h-[50px] roundend-custom">Tipos de Documento</div>
        <div class="bg-gray-200 flex items-center pl-6 w-[100%] h-[50px] roundend-custom">Vigencias</div>
      </div>
    </div>
  </div>
</div>
</template>