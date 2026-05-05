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
const user = useSupabaseUser()

onMounted(() => {
  uiStore.initTheme()
  uiStore.initLayout()
})

// Load boards when authenticated; load demo data when not
watch(user, async (u) => {
  if (u) await boardStore.loadBoards()
  else boardStore.loadDemoBoards()
}, { immediate: true })
</script>

<style lang="scss" scoped>
div {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
