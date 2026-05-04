<template>
  <div class="base-textarea">
    <label v-if="label" :for="id" class="base-textarea__label">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :class="['base-textarea__field', { 'base-textarea__field--error': !!error }]"
      v-bind="$attrs"
      @input="onInput"
    />
    <span v-if="error" class="base-textarea__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  rows?: number
  disabled?: boolean
  id?: string
}>(), {
  modelValue: '',
  rows: 4,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = props.id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.base-textarea {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__field {
    @include type('body-l');
    @include focus-ring;
    width: 100%;
    padding: 8px 16px;
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-input-border-idle);
    border-radius: var(--radius-input);
    outline: none;
    resize: none;
    transition: border-color 0.15s ease;

    &::placeholder {
      color: var(--color-text-primary);
      opacity: 0.25;
    }

    &:focus {
      border-color: var(--color-primary);
    }

    &--error {
      border-color: var(--color-danger);
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  }

  &__error {
    @include type('body-l');
    color: var(--color-danger);
  }
}
</style>
