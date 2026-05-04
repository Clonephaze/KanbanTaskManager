<template>
  <div class="delete-confirm">
    <h2 class="delete-confirm__title">{{ isTask ? 'Delete this task?' : 'Delete this board?' }}</h2>
    <p class="delete-confirm__body">
      <template v-if="isTask">
        Are you sure you want to delete the '{{ itemName }}' task and its subtasks? This action cannot be reversed.
      </template>
      <template v-else>
        Are you sure you want to delete the '{{ itemName }}' board? This action will remove all columns and tasks and cannot be reversed.
      </template>
    </p>
    <div class="delete-confirm__actions">
      <BaseButton variant="destructive" full @click="onConfirm">Delete</BaseButton>
      <BaseButton variant="secondary" full @click="uiStore.closeModal()">Cancel</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'
import type { Task } from '~/types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const isTask = computed(() => uiStore.activeModal?.type === 'deleteTask')
const payload = computed(() => uiStore.activeModal?.payload as { task: Task; columnName: string } | undefined)

const itemName = computed(() =>
  isTask.value
    ? (payload.value?.task.title ?? '')
    : (boardStore.activeBoard?.name ?? ''),
)

function onConfirm() {
  if (isTask.value && payload.value) {
    boardStore.deleteTask(payload.value.columnName, payload.value.task.title)
  } else {
    boardStore.deleteBoard()
  }
  uiStore.closeModal()
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__title {
    @include type('heading-l');
    color: var(--color-danger);
  }

  &__body {
    @include type('body-l');
    color: var(--color-text-secondary);
    line-height: 1.7;
  }

  &__actions {
    display: flex;
    gap: 16px;
  }
}
</style>
