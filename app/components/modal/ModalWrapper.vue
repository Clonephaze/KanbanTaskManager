<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="uiStore.activeModal"
        class="modal-backdrop"
        @mousedown.self="uiStore.closeModal()"
      >
        <div
          ref="panelRef"
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
const panelRef = ref<HTMLElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') uiStore.closeModal()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(
  () => uiStore.activeModal,
  (val) => {
    if (val) nextTick(() => panelRef.value?.focus())
  },
)
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
  overflow-y: auto;
}

.modal-panel {
  width: 100%;
  max-width: 480px;
  background-color: var(--color-surface);
  border-radius: var(--radius-modal);
  padding: 32px;
  outline: none;
  flex-shrink: 0;

  @media (max-width: 767px) {
    padding: 24px 16px;
  }
}

// Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
