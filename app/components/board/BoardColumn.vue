<template>
  <section class="board-column">
    <header class="board-column__header">
      <BoardColumnDot :color="dotColor" />
      <h2 class="board-column__name">{{ column.name }} ({{ tasks.length }})</h2>
      <!-- WIP limit badge -->
      <span
        v-if="wipLimit > 0"
        class="board-column__wip"
        :class="{ 'board-column__wip--over': isOverWip }"
        :title="isOverWip ? `Over WIP limit of ${wipLimit}` : `WIP limit: ${wipLimit}`"
      >
        {{ tasks.length }}/{{ wipLimit }}
      </span>
    </header>

    <VueDraggable
      v-model="tasks"
      group="tasks"
      item-key="title"
      class="board-column__tasks"
      ghost-class="task-card--ghost"
      drag-class="task-card--dragging"
      @end="onDragEnd"
    >
      <TaskCard
        v-for="task in visibleTasks"
        :key="task.title"
        :task="task"
        :column-name="column.name"
      />
    </VueDraggable>

    <!-- Empty state when filter hides all -->
    <p v-if="visibleTasks.length === 0 && tasks.length > 0" class="board-column__filter-empty">
      No tasks match current filter
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Column, Task } from '~/types'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

// Column dot colors — use board accentColor if available, else cycle fallback palette
const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE']

// Generate variants of the accent color by cycling hue offset
function accentVariant(base: string, index: number): string {
  if (index === 0) return base
  // Simple cycling — shift via opacity layers using CSS; just return the base for dot
  // For multi-column variety: offset index-1 uses a lighter tint approximation
  const tints = [base, base + 'BB', base + '88']
  return tints[index % tints.length] ?? base
}

const props = defineProps<{
  column: Column
  columnIndex: number
}>()

const boardStore = useBoardStore()
const uiStore = useUiStore()

const dotColor = computed(() => {
  const accent = boardStore.activeBoard?.accentColor
  if (accent) return accentVariant(accent, props.columnIndex)
  return COLUMN_COLORS[props.columnIndex % COLUMN_COLORS.length] ?? '#49C4E5'
})

// Local reactive copy for vue-draggable-plus
const tasks = ref<Task[]>([...props.column.tasks])

// Keep local copy in sync when the store changes externally
watch(() => props.column.tasks, (newTasks) => {
  tasks.value = [...newTasks]
}, { deep: true })

// Filtered view — search + priority filter
const visibleTasks = computed(() => {
  const q = uiStore.searchQuery.trim().toLowerCase()
  const p = uiStore.filterPriority
  return tasks.value.filter(t => {
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    const matchesPriority = !p || t.priority === p
    return matchesSearch && matchesPriority
  })
})

// WIP limit warning
const wipLimit = computed(() => props.column.wipLimit ?? 0)
const isOverWip = computed(() => wipLimit.value > 0 && tasks.value.length > wipLimit.value)

function onDragEnd() {
  // After any drag (reorder or cross-column move), sync back to store.
  // vue-draggable-plus mutates the tasks array and updates status via the
  // group binding — we reflect that back to the store here.
  const col = boardStore.activeBoard?.columns[props.columnIndex]
  if (!col) return
  col.tasks = tasks.value
  col.tasks.forEach(t => { t.status = props.column.name })
  // Trigger persist
  boardStore.setActiveBoard(boardStore.activeBoardIndex)
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.board-column {
  display: flex;
  flex-direction: column;
  width: 280px;
  flex-shrink: 0;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__name {
    @include type('heading-s');
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 2.4px;
    flex: 1;
  }

  &__wip {
    @include type('heading-s');
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-alt);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    transition: background 0.2s, color 0.2s, border-color 0.2s;

    &--over {
      background: rgba(234, 85, 85, 0.15);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
  }

  &__tasks {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    overflow-y: auto;
    @include scrollbar-hidden;
    padding-bottom: 8px;
    min-height: 20px; // keeps drop zone active even when empty
  }

  &__filter-empty {
    @include type('body-m');
    color: var(--color-text-secondary);
    text-align: center;
    padding: 16px 0;
  }
}

// Card list transition
.card-list-enter-active,
.card-list-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.card-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

<!-- Ghost / drag styles are unscoped so they apply inside vue-draggable-plus -->
<style lang="scss">
.task-card--ghost {
  opacity: 0.4;
}

.task-card--dragging {
  box-shadow: 0 8px 16px rgba(54, 78, 126, 0.2);
  transform: rotate(2deg);
}
</style>
