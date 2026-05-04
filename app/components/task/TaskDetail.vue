<template>
  <div class="task-detail">
    <header class="task-detail__header">
      <h2 class="task-detail__title">{{ task.title }}</h2>
      <div class="task-detail__menu" ref="menuRef">
        <button
          class="task-detail__ellipsis"
          aria-label="Task options"
          aria-haspopup="true"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <img :src="ellipsisIcon" alt="" aria-hidden="true" width="4" height="20" />
        </button>
        <Transition name="dropdown">
          <div v-if="menuOpen" class="task-detail__dropdown">
            <button class="task-detail__dropdown-item" @click="onEditTask">Edit Task</button>
            <button class="task-detail__dropdown-item task-detail__dropdown-item--danger" @click="onDeleteTask">
              Delete Task
            </button>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Priority + Due Date badges -->
    <div v-if="task.priority || task.due_date" class="task-detail__meta">
      <span v-if="task.priority" class="task-detail__priority" :class="`task-detail__priority--${task.priority}`">
        {{ task.priority }}
      </span>
      <span v-if="task.due_date" class="task-detail__due" :class="dueDateClass">
        Due {{ formattedDueDate }}
      </span>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="task-detail__description">{{ task.description }}</p>

    <!-- Subtasks -->
    <div v-if="task.subtasks.length" class="task-detail__section">
      <h3 class="task-detail__section-title">
        Subtasks ({{ completedCount }} of {{ task.subtasks.length }})
      </h3>
      <ul class="task-detail__subtask-list">
        <li v-for="subtask in task.subtasks" :key="subtask.title">
          <BaseCheckbox
            :model-value="subtask.is_completed"
            :label="subtask.title"
            @update:model-value="onToggleSubtask(subtask.title)"
          />
        </li>
      </ul>
    </div>

    <!-- Current Status -->
    <div class="task-detail__section">
      <BaseDropdown
        :model-value="currentStatus"
        :options="columnNames"
        label="Current Status"
        @update:model-value="onStatusChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'
import type { Task } from '~/types'
import ellipsisIcon from '~/assets/icons/icon-vertical-ellipsis.svg'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const payload = computed(() => uiStore.activeModal?.payload as { task: Task; columnName: string } | undefined)
const task = computed(() => payload.value!.task)

const currentColumnName = ref(payload.value?.columnName ?? '')
const currentStatus = ref(task.value?.status ?? '')

const completedCount = computed(() => task.value.subtasks.filter(s => s.is_completed).length)
const columnNames = computed(() => boardStore.activeBoard?.columns.map(c => c.name) ?? [])

// Due date helpers
const dueDateClass = computed(() => {
  if (!task.value.due_date) return ''
  const diff = Math.ceil((() => {
    const parts = task.value.due_date!.split('-')
    return new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10)).getTime() - Date.now()
  })() / 86400000)
  if (diff < 0) return 'task-detail__due--overdue'
  if (diff <= 2) return 'task-detail__due--soon'
  return 'task-detail__due--ok'
})
const formattedDueDate = computed(() => {
  if (!task.value.due_date) return ''
  const parts = task.value.due_date!.split('-')
  return new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

// Confetti when all subtasks complete
const prevCompleted = ref(completedCount.value)
watch(completedCount, async (val) => {
  if (val === task.value.subtasks.length && task.value.subtasks.length > 0 && val > prevCompleted.value) {
    const confetti = (await import('canvas-confetti')).default
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
  }
  prevCompleted.value = val
})

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => { menuOpen.value = false })

function onToggleSubtask(subtaskTitle: string) {
  boardStore.toggleSubtask(currentColumnName.value, task.value.title, subtaskTitle)
}

function onStatusChange(newStatus: string) {
  boardStore.moveTask(task.value.title, currentColumnName.value, newStatus)
  currentColumnName.value = newStatus
  currentStatus.value = newStatus
}

function onEditTask() {
  menuOpen.value = false
  uiStore.openModal({ type: 'editTask', payload: { task: task.value, columnName: currentColumnName.value } })
}

function onDeleteTask() {
  menuOpen.value = false
  uiStore.openModal({ type: 'deleteTask', payload: { task: task.value, columnName: currentColumnName.value } })
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.task-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  &__title {
    @include type('heading-l');
    color: var(--color-text-primary);
    flex: 1;
  }

  &__menu {
    position: relative;
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__ellipsis {
    @include focus-ring;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 4px;
    border-radius: 2px;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 192px;
    background-color: var(--color-bg);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 8px 0;
    z-index: 10;
  }

  &__dropdown-item {
    @include type('body-l');
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--color-surface-alt);
    }

    &--danger {
      color: var(--color-danger);
    }
  }

  &__description {
    @include type('body-l');
    color: var(--color-text-secondary);
    line-height: 1.7;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__section-title {
    @include type('heading-s');
    color: var(--color-text-secondary);
  }

  &__subtask-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__priority {
    @include type('heading-s');
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    text-transform: capitalize;

    &--low    { color: var(--color-priority-low);    background: var(--color-priority-low-bg); }
    &--medium { color: var(--color-priority-medium); background: var(--color-priority-medium-bg); }
    &--high   { color: var(--color-priority-high);   background: var(--color-priority-high-bg); }
    &--urgent { color: var(--color-priority-urgent); background: var(--color-priority-urgent-bg); }
  }

  &__due {
    @include type('body-m');

    &--ok      { color: var(--color-due-ok); }
    &--soon    { color: var(--color-due-soon); }
    &--overdue { color: var(--color-due-overdue); font-weight: 700; }
  }
}

// Dropdown transition
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
