<template>
  <div class="search-bar">
    <div class="search-bar__input-wrap">
      <!-- magnifier icon inline -->
      <svg class="search-bar__icon" viewBox="0 0 15 15" width="15" height="15" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
        <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <input
        v-model="uiStore.searchQuery"
        type="search"
        class="search-bar__input"
        placeholder="Search tasks…"
        aria-label="Search tasks"
      />
      <button
        v-if="uiStore.searchQuery"
        class="search-bar__clear"
        aria-label="Clear search"
        @click="uiStore.searchQuery = ''"
      >
        ✕
      </button>
    </div>

    <!-- Priority filter chips -->
    <div class="search-bar__filters" role="group" aria-label="Filter by priority">
      <button
        v-for="p in priorities"
        :key="p"
        class="search-bar__chip"
        :class="[`search-bar__chip--${p}`, { 'search-bar__chip--active': uiStore.filterPriority === p }]"
        @click="uiStore.filterPriority = uiStore.filterPriority === p ? '' : p"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import type { Priority } from '~/types'

const uiStore = useUiStore()
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;

  @include mobile-only {
    display: none; // search lives in a separate overlay on mobile (future enhancement)
  }

  &__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 180px;
    max-width: 280px;
  }

  &__icon {
    position: absolute;
    left: 10px;
    color: var(--color-text-secondary);
    pointer-events: none;
    flex-shrink: 0;
  }

  &__input {
    @include type('body-m');
    width: 100%;
    padding: 7px 32px 7px 32px;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.15s ease, background 0.15s ease;

    &::placeholder { color: var(--color-text-secondary); }
    &:focus { border-color: var(--color-primary); background: var(--color-surface); }

    // Hide browser default clear button
    &::-webkit-search-cancel-button { display: none; }
  }

  &__clear {
    position: absolute;
    right: 10px;
    @include type('body-m');
    color: var(--color-text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
    padding: 0;

    &:hover { color: var(--color-text-primary); }
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__chip {
    @include type('heading-s');
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    border: none;
    cursor: pointer;
    text-transform: capitalize;
    opacity: 0.55;
    transition: opacity 0.15s ease, transform 0.1s ease;

    &:hover { opacity: 0.85; }

    &--active {
      opacity: 1;
      transform: scale(1.05);
    }

    &--low    { color: var(--color-priority-low);    background: var(--color-priority-low-bg); }
    &--medium { color: var(--color-priority-medium); background: var(--color-priority-medium-bg); }
    &--high   { color: var(--color-priority-high);   background: var(--color-priority-high-bg); }
    &--urgent { color: var(--color-priority-urgent); background: var(--color-priority-urgent-bg); }
  }
}
</style>
