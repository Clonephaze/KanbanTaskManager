<template>
  <span class="column-dot" :style="{ backgroundColor: color }" />
</template>

<script setup lang="ts">
defineProps<{
  color: string
}>()
</script>

<style lang="scss" scoped>
.column-dot {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
