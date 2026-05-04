<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'

const uiStore = useUiStore()
const boardStore = useBoardStore()

// Initialise client-side only (localStorage, data-theme attribute)
onMounted(() => {
  uiStore.initTheme()
  boardStore.init()
})
</script>

<style lang="scss" scoped>
div {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
