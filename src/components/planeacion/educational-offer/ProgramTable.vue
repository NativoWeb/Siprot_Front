<template>
  <table class="min-w-full text-sm border">
    <thead>
      <tr class="bg-gray-100 text-left">
        <th class="p-2">Código</th>
        <th class="p-2">Nombre</th>
        <th class="p-2">Sector</th>
        <th class="p-2">Nivel</th>
        <th v-if="userRole === 'planeacion'" class="p-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in programs" :key="p.id" class="border-t">
        <td class="p-2">{{ p.code }}</td>
        <td class="p-2">{{ p.name }}</td>
        <td class="p-2">{{ p.sector }}</td>
        <td class="p-2">{{ p.level }}</td>
        <td v-if="userRole === 'planeacion'" class="p-2 space-x-2">
          <!-- Modified edit button to emit proper event -->
          <button @click="$emit('edit', p)" class="text-blue-500 hover:text-blue-700">✏️</button>
          <button @click="deleteProgram(p.id)" class="text-red-500 hover:text-red-700">🗑️</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import axios from "axios";

export default {
  props: ["programs", "userRole"],
  emits: ["updated", "edit"],
  methods: {
    async deleteProgram(id) {
      if (!confirm("¿Eliminar este programa?")) return;
      try {
        await axios.delete(`http://localhost:8000/programs/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        this.$emit("updated");
      } catch (err) {
        console.error("Error eliminando programa:", err);
      }
    }
  }
};
</script>
