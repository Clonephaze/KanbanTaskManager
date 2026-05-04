<template>
  <label :class="['base-checkbox', { 'base-checkbox--checked': modelValue }]">
    <span class="base-checkbox__box" aria-hidden="true">
      <img
        v-if="modelValue"
        :src="checkIcon"
        alt=""
        width="10"
        height="8"
      />
    </span>
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="base-checkbox__input"
      v-bind="$attrs"
      @change="onChange"
    />
    <span :class="['base-checkbox__label', { 'base-checkbox__label--checked': modelValue }]">
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  modelValue: boolean
  label: string
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

import checkIcon from '~/assets/icons/icon-check.svg'

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.base-checkbox {
  @include flex-between;
  gap: 16px;
  padding: 12px;
  background-color: var(--color-surface-alt);
  border-radius: var(--radius-input);
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--color-checkbox-hover-bg);
  }

  &__input {
    @include visually-hidden;
  }

  &__box {
    @include flex-center;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid var(--color-input-border-idle);
    border-radius: 2px;
    background-color: var(--color-surface);
    transition: background-color 0.15s ease, border-color 0.15s ease;

    .base-checkbox--checked & {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  &__label {
    @include type('body-m');
    flex: 1;
    color: var(--color-text-primary);
    transition: opacity 0.15s ease;

    &--checked {
      opacity: 0.5;
      text-decoration: line-through;
    }
  }
}
</style>
