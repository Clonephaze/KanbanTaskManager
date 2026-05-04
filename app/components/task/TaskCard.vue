<template>
  <article class="task-card" @click="openTask">
    <!-- Priority badge -->
    <span v-if="task.priority" class="task-card__priority" :class="`task-card__priority--${task.priority}`">
      {{ task.priority }}
    </span>

    <h3 class="task-card__title">{{ task.title }}</h3>

    <div class="task-card__meta">
      <p class="task-card__subtasks">
        {{ completedCount }} of {{ task.subtasks.length }} subtasks
      </p>
      <span v-if="task.due_date" class="task-card__due" :class="dueDateClass">
        {{ formattedDueDate }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { useUiStore } from '~/stores/ui'

const props = defineProps<{
  task: Task
  columnName: string
}>()

const uiStore = useUiStore()

const completedCount = computed(() =>
  props.task.subtasks.filter(s => s.is_completed).length
)

// Due date helpers
const dueDateClass = computed(() => {
  if (!props.task.due_date) return ''
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const parts = props.task.due_date.split('-')
  const due = new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10))
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
  if (diffDays < 0) return 'task-card__due--overdue'
  if (diffDays <= 2) return 'task-card__due--soon'
  return 'task-card__due--ok'
})

const formattedDueDate = computed(() => {
  if (!props.task.due_date) return ''
  const parts = props.task.due_date.split('-')
  return new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function openTask() {
  uiStore.openModal({
    type: 'viewTask',
    payload: { task: props.task, columnName: props.columnName },
  })
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.task-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 23px 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(54, 78, 126, 0.18);

    .task-card__title {
      color: var(--color-primary);
    }
  }

  @include focus-ring;

  &__priority {
    @include type('heading-s');
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    margin-bottom: 8px;
    text-transform: capitalize;
    letter-spacing: 0.5px;

    &--low    { color: var(--color-priority-low);    background: var(--color-priority-low-bg); }
    &--medium { color: var(--color-priority-medium); background: var(--color-priority-medium-bg); }
    &--high   { color: var(--color-priority-high);   background: var(--color-priority-high-bg); }
    &--urgent { color: var(--color-priority-urgent); background: var(--color-priority-urgent-bg); }
  }

  &__title {
    @include type('heading-m');
    color: var(--color-text-primary);
    transition: color 0.15s ease;
    margin-bottom: 8px;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__subtasks {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__due {
    @include type('body-m');
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-input);

    &--ok      { color: var(--color-due-ok); }
    &--soon    { color: var(--color-due-soon); }
    &--overdue { color: var(--color-due-overdue); }
  }
}
</style>
