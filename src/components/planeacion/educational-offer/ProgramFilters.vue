<template>
  <div class="program-filters">
    <h3>Filtros</h3>
    <select v-model="localFilters.sector" @change="update">
      <option value="">Todos los sectores</option>
      <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
    </select>

    <select v-model="localFilters.level" @change="update">
      <option value="">Todos los niveles</option>
      <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ["sectors", "levels", "modelValue"],
  data() {
    return {
      localFilters: { ...this.modelValue },
    };
  },
  methods: {
    update() {
      this.$emit("update:modelValue", this.localFilters);
    },
  },
};
</script>
