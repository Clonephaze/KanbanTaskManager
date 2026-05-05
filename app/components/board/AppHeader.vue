<template>
  <header class="app-header">
    <!-- Top progress bar -->
    <div class="app-header__progress" :class="{ 'app-header__progress--active': boardStore.loading || boardStore.saving }" aria-hidden="true" />

    <!-- Logo pane: fixed width on tablet+, always visible. Mobile: logo-mobile only -->
    <div class="app-header__logo-pane">
      <picture>
        <!-- Mobile: compact mark-only logo -->
        <source media="(max-width: 767px)" :srcset="logoMobile" />
        <!-- Tablet+: full wordmark, switches on theme -->
        <img
          :src="uiStore.theme === 'dark' ? logoLight : logoDark"
          alt="Kanban"
          height="26"
          class="app-header__logo"
        />
      </picture>
    </div>

    <!-- Board name - desktop shows plain text, mobile adds chevron for board picker -->
    <div
      class="app-header__board-name"
      :class="{ 'app-header__board-name--clickable': isMobile }"
      @click="onBoardNameClick"
    >
      <h1 class="app-header__title">{{ boardStore.activeBoard?.name ?? 'No board selected' }}</h1>
      <!-- Chevron only visible on mobile -->
      <img
        :src="uiStore.mobileBoardPickerOpen ? chevronUp : chevronDown"
        alt=""
        aria-hidden="true"
        class="app-header__chevron"
        width="10"
        height="7"
      />
    </div>

    <!-- Search bar: inline at wide, icon trigger at compact -->
    <BoardSearchBar class="app-header__search" />

    <!-- Actions -->
    <div class="app-header__actions">
      <!-- Add New Task (desktop) -->
      <BaseButton
        variant="primary-l"
        class="app-header__add-desktop"
        :disabled="!boardStore.activeBoard?.columns.length"
        @click="uiStore.openModal({ type: 'addTask' })"
      >
        + Add New Task
      </BaseButton>

      <!-- Add New Task (mobile - icon only) -->
      <button
        class="app-header__add-mobile"
        :disabled="!boardStore.activeBoard?.columns.length"
        aria-label="Add new task"
        @click="uiStore.openModal({ type: 'addTask' })"
      >
        <img :src="addTaskMobile" alt="" aria-hidden="true" width="12" height="12" />
      </button>

      <!-- Keyboard shortcuts hint -->
      <div class="app-header__shortcuts" ref="shortcutsRoot">
        <button
          class="app-header__shortcuts-btn"
          aria-label="Keyboard shortcuts"
          :aria-expanded="shortcutsOpen"
          @click="shortcutsOpen = !shortcutsOpen"
        >
          <span aria-hidden="true">?</span>
        </button>
        <Transition name="dropdown">
          <div v-if="shortcutsOpen" class="app-header__shortcuts-panel" role="tooltip">
            <p class="app-header__shortcuts-heading">Keyboard Shortcuts</p>
            <ul class="app-header__shortcuts-list">
              <li><kbd>N</kbd> New task</li>
              <li><kbd>B</kbd> New board</li>
              <li><kbd>E</kbd> Edit board</li>
              <li><kbd>/</kbd> Focus search</li>
            </ul>
          </div>
        </Transition>
      </div>

      <!-- Ellipsis menu -->
      <div class="app-header__menu" ref="menuRoot">
        <button
          class="app-header__ellipsis"
          aria-label="Board options"
          @click="menuOpen = !menuOpen"
        >
          <img :src="ellipsisIcon" alt="" aria-hidden="true" width="5" height="20" />
        </button>
        <Transition name="dropdown">
          <ul v-if="menuOpen" class="app-header__dropdown">
            <li>
              <button class="app-header__dropdown-item" @click="onEditBoard">Edit Board</button>
            </li>
            <li>
              <button class="app-header__dropdown-item app-header__dropdown-item--danger" @click="onDeleteBoard">
                Delete Board
              </button>
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <!-- Board progress bar -->
    <div v-if="boardStore.activeBoard && totalTasks > 0" class="app-header__progress" :title="`${completedTasks} of ${totalTasks} tasks complete`">
      <div
        class="app-header__progress-bar"
        :style="{ width: progressPercent + '%', background: boardStore.activeBoard.accent_color ?? 'var(--color-primary)' }"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'
import logoMobile from '~/assets/icons/logo-mobile.svg'
import logoLight from '~/assets/icons/logo-light.svg'
import logoDark from '~/assets/icons/logo-dark.svg'
import chevronDown from '~/assets/icons/icon-chevron-down.svg'
import chevronUp from '~/assets/icons/icon-chevron-up.svg'
import addTaskMobile from '~/assets/icons/icon-add-task-mobile.svg'
import ellipsisIcon from '~/assets/icons/icon-vertical-ellipsis.svg'

const boardStore = useBoardStore()
const uiStore = useUiStore()

const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
const shortcutsOpen = ref(false)
const shortcutsRoot = ref<HTMLElement | null>(null)

onClickOutside(shortcutsRoot, () => { shortcutsOpen.value = false })

// Board progress
const totalTasks = computed(() =>
  boardStore.activeBoard?.columns.reduce((sum, c) => sum + c.tasks.length, 0) ?? 0
)
const completedTasks = computed(() =>
  boardStore.activeBoard?.columns
    .flatMap(c => c.tasks)
    .filter(t => {
      // A task is "done" if it's in the last column or all subtasks complete
      const cols = boardStore.activeBoard!.columns
      const isLastCol = cols[cols.length - 1]?.tasks.includes(t)
      const allSubtasksDone = t.subtasks.length > 0 && t.subtasks.every(s => s.is_completed)
      return isLastCol || allSubtasksDone
    }).length ?? 0
)
const progressPercent = computed(() =>
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)

// Only treat as mobile when window is narrow - guards board-name click behaviour
const isMobile = ref(false)
onMounted(() => {
  const mq = window.matchMedia('(max-width: 767px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => { isMobile.value = e.matches })
})

onClickOutside(menuRoot, () => { menuOpen.value = false })

function onBoardNameClick() {
  if (!isMobile.value) return
  uiStore.toggleMobileBoardPicker()
}

function onEditBoard() {
  menuOpen.value = false
  uiStore.openModal({ type: 'editBoard' })
}

function onDeleteBoard() {
  menuOpen.value = false
  uiStore.openModal({ type: 'deleteBoard' })
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.app-header {
  position: relative;
  display: flex;
  align-items: stretch;
  height: 96px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  z-index: 10;

  @include mobile-only {
    height: 64px;   // back to single row now search is a popover button
  }

  &__progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: 0%;
    background-color: var(--color-primary);
    transition: none;
    z-index: 100;

    &--active {
      animation: progress-indeterminate 1.4s ease-in-out infinite;
    }
  }

  &__logo-pane {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 260px;
    padding: 0 32px;
    border-right: 1px solid var(--color-border);

    @include wide-up {
      width: 300px;   // match sidebar width at wide breakpoint
    }

    @include mobile-only {
      width: auto;
      padding: 0 16px;
      border-right: none;
    }
  }

  &__board-name {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;          // fills space at tablet/compact where search bar is icon-only
    min-width: 0;
    padding: 0 24px;

    &--clickable {
      cursor: pointer;
    }

    @include wide-up {
      flex: 0 1 280px; // at wide, search bar is flex:1 — board name just shrinks if needed
    }

    @include mobile-only {
      padding: 0 12px;
    }
  }

  &__title {
    @include type('heading-xl');
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include mobile-only {
      @include type('heading-l');
    }
  }

  &__chevron {
    flex-shrink: 0;
    display: none;

    @include mobile-only {
      display: block;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    padding-right: 16px;

    @include wide-up {
      gap: 12px;
      padding-right: 24px;
    }
  }

  &__add-desktop {
    // Only show the full text button when the layout has room
    @media (max-width: #{1360px - 1px}) {
      display: none;
    }
  }

  &__add-mobile {
    @include focus-ring;
    display: none;
    width: 48px;
    height: 32px;
    border-radius: var(--radius-pill);
    background-color: var(--color-primary);
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    // Show whenever the text button is hidden
    @media (max-width: #{1360px - 1px}) {
      display: flex;
    }
  }

  &__ellipsis {
    @include focus-ring;
    padding: 8px;
    color: var(--color-text-secondary);
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-text-primary);
    }
  }

  &__menu {
    position: relative;
  }

  &__shortcuts {
    position: relative;

    // Only show when there's enough room
    @media (max-width: #{1360px - 1px}) {
      display: none;
    }
  }

  &__shortcuts-btn {
    @include focus-ring;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px solid var(--color-border);
    background: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    transition: border-color 0.15s ease, color 0.15s ease;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }

  &__shortcuts-panel {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    min-width: 200px;
    background-color: var(--color-surface);
    border-radius: var(--radius-modal);
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
    padding: 16px;
    z-index: 20;
  }

  &__shortcuts-heading {
    @include type('heading-s');
    color: var(--color-text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  &__shortcuts-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
      @include type('body-m');
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 22px;
      padding: 0 6px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-bottom-width: 2px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    min-width: 192px;
    background-color: var(--color-bg);
    border-radius: var(--radius-modal);
    box-shadow: var(--shadow-card);
    z-index: 20;
    padding: 16px 0;
  }

  &__dropdown-item {
    @include type('body-l');
    @include focus-ring;
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    color: var(--color-text-secondary);
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-text-primary);
    }

    &--danger {
      color: var(--color-danger);

      &:hover {
        color: var(--color-danger-hover);
      }
    }
  }
}

// Dropdown transition (shared pattern)
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes progress-indeterminate {
  0%   { left: -40%; width: 40%; }
  60%  { left: 100%; width: 40%; }
  100% { left: 100%; width: 40%; }
}
</style>
