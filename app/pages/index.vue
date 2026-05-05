<template>
  <div class="layout">
    <!-- Header always spans full width -->
    <BoardAppHeader />

    <!-- Body: sidebar + board area side by side -->
    <div class="layout__body">
      <Transition name="sidebar">
        <BoardSidebar v-if="uiStore.sidebarOpen" />
      </Transition>

      <main class="layout__board">
        <template v-if="boardStore.activeBoard">
          <!-- Columns -->
          <BoardColumn
            v-for="(column, i) in boardStore.activeBoard.columns"
            :key="column.name"
            :column="column"
            :column-index="i"
          />

          <!-- Add New Column ghost column -->
          <button class="layout__add-column" @click="uiStore.openModal({ type: 'editBoard' })">
            + New Column
          </button>
        </template>

        <!-- Empty board state -->
        <div v-else class="layout__empty">
          <p>This board is empty. Create a new column to get started.</p>
          <BaseButton variant="primary-l" @click="uiStore.openModal({ type: 'editBoard' })">
            + Add New Column
          </BaseButton>
        </div>
      </main>
    </div>

    <!-- Show Sidebar pill -->
    <Transition name="show-sidebar">
      <button
        v-if="!uiStore.sidebarOpen"
        class="layout__show-sidebar"
        aria-label="Show sidebar"
        @click="uiStore.toggleSidebar()"
      >
        <img :src="showSidebarIcon" alt="" aria-hidden="true" width="16" height="11" />
      </button>
    </Transition>
  </div>

  <!-- Modals -->
  <ModalWrapper>
    <TaskDetail v-if="uiStore.activeModal?.type === 'viewTask'" />
    <ModalTaskFormModal
      v-else-if="uiStore.activeModal?.type === 'addTask' || uiStore.activeModal?.type === 'editTask'"
    />
    <ModalBoardFormModal
      v-else-if="uiStore.activeModal?.type === 'addBoard' || uiStore.activeModal?.type === 'editBoard'"
    />
    <ModalDeleteConfirmModal
      v-else-if="uiStore.activeModal?.type === 'deleteTask' || uiStore.activeModal?.type === 'deleteBoard'"
    />
  </ModalWrapper>

  <!-- Mobile board picker -->
  <BoardMobileBoardPicker v-if="uiStore.mobileBoardPickerOpen" />
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'
import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts'
import showSidebarIcon from '~/assets/icons/icon-show-sidebar.svg'

definePageMeta({})

const uiStore = useUiStore()
const boardStore = useBoardStore()
useKeyboardShortcuts()
</script>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/typography' as *;

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  &__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  &__board {
    flex: 1;
    display: flex;
    align-items: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    @include scrollbar-hidden;
    padding: 24px;
    gap: 24px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    width: 100%;
    height: 100%;
    color: var(--color-text-secondary);

    p {
      @include type('heading-l');
    }
  }

  &__add-column {
    @include type('heading-xl');
    @include focus-ring;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 280px;
    min-height: calc(100% - 39px);
    flex-shrink: 0;
    margin-top: 39px;
    border-radius: var(--radius-card);
    background: linear-gradient(180deg, #E9EFFA 0%, rgba(233, 239, 250, 0.5) 100%);
    color: var(--color-text-secondary);
    transition: color 0.15s ease;

    [data-theme="dark"] & {
      background: linear-gradient(180deg, rgba(43, 44, 55, 0.25) 0%, rgba(43, 44, 55, 0.125) 100%);
    }

    &:hover {
      color: var(--color-primary);
    }
  }

  &__show-sidebar {
    @include focus-ring;
    position: fixed;
    bottom: 32px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 48px;
    border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
    background-color: var(--color-primary);
    transition: background-color 0.2s ease;
    z-index: 30;

    &:hover {
      background-color: var(--color-primary-hover);
    }

    @include mobile-only {
      display: none;
    }
  }
}

// Sidebar slide transition
.sidebar-enter-active,
.sidebar-leave-active {
  transition: width 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.sidebar-enter-from,
.sidebar-leave-to {
  width: 0 !important;
  opacity: 0;
}

// Show sidebar button fade
.show-sidebar-enter-active,
.show-sidebar-leave-active {
  transition: opacity 0.2s ease;
}
.show-sidebar-enter-from,
.show-sidebar-leave-to {
  opacity: 0;
}
</style>
