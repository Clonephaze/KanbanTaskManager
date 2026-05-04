<template>
  <button
    :class="['base-btn', `base-btn--${variant}`, { 'base-btn--full': full }]"
    :disabled="disabled"
    :type="type"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: 'primary-l' | 'primary-s' | 'secondary' | 'destructive'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  full?: boolean
}>(), {
  variant: 'primary-l',
  type: 'button',
  disabled: false,
  full: false,
})
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.base-btn {
  @include flex-center;
  @include focus-ring;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--full {
    width: 100%;
  }

  // Primary Large
  &--primary-l {
    @include type('heading-m');
    padding: 15px 24px;
    background-color: var(--color-primary);
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
    }
  }

  // Primary Small
  &--primary-s {
    @include type('heading-m');
    padding: 8px 18px;
    background-color: var(--color-primary);
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
    }
  }

  // Secondary
  &--secondary {
    @include type('heading-m');
    padding: 15px 24px;
    background-color: var(--color-btn-secondary-bg);
    color: var(--color-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
      color: var(--color-primary);
    }
  }

  // Destructive
  &--destructive {
    @include type('heading-m');
    padding: 15px 24px;
    background-color: var(--color-danger);
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: var(--color-danger-hover);
    }
  }
}
</style>
