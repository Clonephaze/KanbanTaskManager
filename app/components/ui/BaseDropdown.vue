<template>
  <div class="base-dropdown" ref="rootEl">
    <label v-if="label" :for="id" class="base-dropdown__label">{{ label }}</label>
    <button
      :id="id"
      type="button"
      :class="['base-dropdown__trigger', { 'base-dropdown__trigger--open': isOpen }]"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="base-dropdown__value">{{ modelValue }}</span>
      <img
        :src="isOpen ? chevronUp : chevronDown"
        alt=""
        aria-hidden="true"
        class="base-dropdown__chevron"
        width="10"
        height="7"
      />
    </button>

    <Transition name="dropdown">
      <ul
        v-if="isOpen"
        role="listbox"
        class="base-dropdown__list"
      >
        <li
          v-for="option in options"
          :key="option"
          role="option"
          :aria-selected="option === modelValue"
          :class="['base-dropdown__option', { 'base-dropdown__option--selected': option === modelValue }]"
          @click="select(option)"
        >
          {{ option }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import chevronDown from '~/assets/icons/icon-chevron-down.svg'
import chevronUp from '~/assets/icons/icon-chevron-up.svg'

const props = withDefaults(defineProps<{
  modelValue: string
  options: string[]
  label?: string
  id?: string
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = props.id ?? `dropdown-${Math.random().toString(36).slice(2, 9)}`
const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

onClickOutside(rootEl, () => { isOpen.value = false })

function toggle() {
  isOpen.value = !isOpen.value
}

function select(option: string) {
  emit('update:modelValue', option)
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.base-dropdown {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__trigger {
    @include type('body-l');
    @include flex-between;
    @include focus-ring;
    padding: 8px 16px;
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-input-border-idle);
    border-radius: var(--radius-input);
    cursor: pointer;
    transition: border-color 0.15s ease;

    &--open {
      border-color: var(--color-primary);
    }

    &:hover {
      border-color: var(--color-primary);
    }
  }

  &__chevron {
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__list {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background-color: var(--color-bg);
    border-radius: var(--radius-input);
    box-shadow: var(--shadow-card);
    z-index: 10;
    overflow: hidden;
  }

  &__option {
    @include type('body-l');
    padding: 8px 16px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-text-primary);
    }

    &--selected {
      color: var(--color-text-primary);
    }
  }
}

// Dropdown open/close transition
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
