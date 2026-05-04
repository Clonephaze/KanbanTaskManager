<template>
  <div class="board-form">
    <h2 class="board-form__title">{{ isEdit ? 'Edit Board' : 'Add New Board' }}</h2>

    <!-- Name -->
    <BaseInput
      v-model="formName"
      label="Name"
      placeholder="e.g. Web Design"
      :error="nameError"
    />

    <!-- Columns -->
    <div class="board-form__field-group">
      <span class="board-form__field-label">Columns</span>
      <ul class="board-form__list">
        <li v-for="(col, i) in columnInputs" :key="i" class="board-form__list-item">
          <input
            v-model="col.value"
            type="text"
            class="board-form__input"
            :class="{ 'board-form__input--error': col.error }"
            placeholder="e.g. Todo"
          />
          <button
            type="button"
            class="board-form__remove-btn"
            aria-label="Remove column"
            @click="removeColumn(i)"
          >
            <img :src="crossIcon" alt="" aria-hidden="true" width="15" height="15" />
          </button>
        </li>
      </ul>
      <BaseButton variant="secondary" full @click="addColumn">+ Add New Column</BaseButton>
    </div>

    <!-- Submit -->
    <div class="board-form__field-group">
      <span class="board-form__field-label">Board Colour</span>
      <div class="board-form__swatches">
        <button
          v-for="color in PRESET_COLORS"
          :key="color"
          type="button"
          class="board-form__swatch"
          :class="{ 'board-form__swatch--selected': formAccentColor === color }"
          :style="{ background: color }"
          :aria-label="color"
          @click="formAccentColor = color"
        />
        <!-- Custom colour input -->
        <label class="board-form__swatch board-form__swatch--custom" title="Custom colour">
          <input v-model="formAccentColor" type="color" class="board-form__color-input" />
          <span>+</span>
        </label>
      </div>
    </div>

    <!-- Submit -->
    <BaseButton variant="primary-l" full @click="onSubmit">
      {{ isEdit ? 'Save Changes' : 'Create New Board' }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'
import crossIcon from '~/assets/icons/icon-cross.svg'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const isEdit = computed(() => uiStore.activeModal?.type === 'editBoard')

const PRESET_COLORS = ['#635FC7', '#49C4E5', '#67E2AE', '#F0A030', '#EA5555', '#FF2D55', '#8471F2']

// Pre-populate in edit mode
const formName = ref(isEdit.value ? (boardStore.activeBoard?.name ?? '') : '')
const formAccentColor = ref(isEdit.value ? (boardStore.activeBoard?.accentColor ?? '#635FC7') : '#635FC7')
const columnInputs = ref<{ value: string; error: boolean }[]>(
  isEdit.value && boardStore.activeBoard
    ? boardStore.activeBoard.columns.map(c => ({ value: c.name, error: false }))
    : [{ value: '', error: false }],
)

const nameError = ref('')

function addColumn() {
  columnInputs.value.push({ value: '', error: false })
}

function removeColumn(i: number) {
  columnInputs.value.splice(i, 1)
}

function onSubmit() {
  // Validate
  nameError.value = formName.value.trim() ? '' : "Can't be empty"
  columnInputs.value.forEach(c => {
    c.error = !c.value.trim()
  })

  if (nameError.value || columnInputs.value.some(c => c.error)) return

  const columnNames = columnInputs.value.filter(c => c.value.trim()).map(c => c.value.trim())

  if (isEdit.value) {
    boardStore.updateBoard(formName.value.trim(), columnNames, formAccentColor.value)
  } else {
    boardStore.addBoard(formName.value.trim(), columnNames, formAccentColor.value)
  }

  uiStore.closeModal()
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.board-form {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__title {
    @include type('heading-l');
    color: var(--color-text-primary);
  }

  &__field-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field-label {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__input {
    @include type('body-l');
    flex: 1;
    padding: 8px 16px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-input-border-idle);
    border-radius: var(--radius-input);
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.15s ease;

    &::placeholder {
      color: var(--color-text-placeholder);
    }

    &:focus {
      border-color: var(--color-primary);
    }

    &--error {
      border-color: var(--color-danger);
    }
  }

  &__remove-btn {
    @include focus-ring;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;

    &:hover {
      transform: scale(1.15);
    }

    &--selected {
      border-color: var(--color-text-primary);
      transform: scale(1.15);
    }

    &--custom {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface-alt);
      border: 2px dashed var(--color-border);
      color: var(--color-text-secondary);
      font-size: 16px;
      position: relative;
      overflow: hidden;

      &:hover { border-color: var(--color-primary); }
    }
  }

  &__color-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
}
</style>
