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

// Load boards whenever the user session is available
watch(user, async (u) => {
  if (u) await boardStore.loadBoards()
}, { immediate: true })
</script>

<style lang="scss" scoped>
div {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
