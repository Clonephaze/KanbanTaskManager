<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="base-input__label">{{ label }}</label>
    <div :class="['base-input__wrapper', { 'base-input__wrapper--error': !!error }]">
      <input
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="base-input__field"
        type="text"
        v-bind="$attrs"
        @input="onInput"
      />
      <span v-if="error" class="base-input__error-inline">{{ error }}</span>
    </div>
    <span v-if="error" class="base-input__error-msg">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
}>(), {
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = props.id ?? `input-${Math.random().toString(36).slice(2, 9)}`

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.base-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;

    &--error .base-input__field {
      border-color: var(--color-danger);
    }
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
    transition: border-color 0.15s ease;

    &::placeholder {
      color: var(--color-text-primary);
      opacity: 0.25;
    }

    &:focus {
      border-color: var(--color-primary);
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  }

  // Error text shown inline (right-aligned inside the input row)
  &__error-inline {
    @include type('body-l');
    position: absolute;
    right: 16px;
    color: var(--color-danger);
    pointer-events: none;
  }

  // Error text below input (hidden - inline takes priority per design)
  &__error-msg {
    display: none;
  }
}
</style>
