<template>
  <div class="search-bar" ref="root">

    <!-- ── INLINE mode (≥1360px): input + chips live directly in the bar ── -->
    <div class="search-bar__inline" role="search" aria-label="Search tasks">
      <div class="search-bar__input-wrap">
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
        >✕</button>
      </div>

      <div class="search-bar__filters" role="group" aria-label="Filter by priority">
        <button
          v-for="p in priorities"
          :key="p"
          class="search-bar__chip"
          :class="[`search-bar__chip--${p}`, { 'search-bar__chip--active': uiStore.filterPriority === p }]"
          @click="uiStore.filterPriority = uiStore.filterPriority === p ? '' : p"
        >{{ p }}</button>
      </div>
    </div>

    <!-- ── COMPACT mode (<1360px): plain icon button ── -->
    <button
      class="search-bar__trigger"
      :aria-expanded="open"
      aria-label="Search and filter tasks"
      @click="toggleOpen"
    >
      <svg viewBox="0 0 15 15" width="16" height="16" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
        <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- ── POPOVER (compact only) ── -->
    <Transition name="search-drop">
      <div
        v-if="open"
        class="search-bar__popover"
        role="search"
        aria-label="Search tasks"
        @keydown.escape="open = false"
      >
        <div class="search-bar__input-wrap">
          <svg class="search-bar__icon" viewBox="0 0 15 15" width="15" height="15" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            ref="inputEl"
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
          >✕</button>
        </div>

        <div class="search-bar__filters" role="group" aria-label="Filter by priority">
          <button
            v-for="p in priorities"
            :key="p"
            class="search-bar__chip"
            :class="[`search-bar__chip--${p}`, { 'search-bar__chip--active': uiStore.filterPriority === p }]"
            @click="uiStore.filterPriority = uiStore.filterPriority === p ? '' : p"
          >{{ p }}</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useUiStore } from '~/stores/ui'
import type { Priority } from '~/types'

const uiStore = useUiStore()
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

onClickOutside(root, () => { open.value = false })

function toggleOpen() {
  open.value = !open.value
  if (open.value) nextTick(() => inputEl.value?.focus())
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 12px;
  padding: 0 16px;

  // Compact: shrink to just the icon button
  @media (max-width: #{1360px - 1px}) {
    flex: none;
    padding: 0;
  }

  &__inline {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 12px;

    @media (max-width: #{1360px - 1px}) {
      display: none;
    }
  }

  &__trigger {
    @include focus-ring;
    display: none;
    padding: 8px;
    color: var(--color-text-secondary);
    transition: color 0.15s ease;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: var(--color-text-primary);
    }

    @media (max-width: #{1360px - 1px}) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @include wide-up {
      display: none; // explicit — ensures trigger is hidden even if base rule is overridden
    }
  }

  &__popover {
    // Tablet+: drop down anchored to right edge of trigger
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: min(360px, calc(100vw - 32px));
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-modal);
    box-shadow: var(--shadow-card);
    padding: 16px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 12px;

    // Mobile: fixed to viewport — avoids clipping off either screen edge
    @include mobile-only {
      position: fixed;
      top: 74px;   // 64px header + 10px gap
      left: 16px;
      right: 16px;
      width: auto;
    }
  }

  &__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    max-width: 280px;

    // In popover: full width
    .search-bar__popover & {
      max-width: none;
    }
  }

  &__icon {
    position: absolute;
    left: 10px;
    color: var(--color-text-secondary);
    pointer-events: none;
    flex-shrink: 0;
  }

  &__input {
    @include type('body-l');
    width: 100%;
    padding: 7px 32px 7px 32px;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.15s ease;

    &::placeholder { color: var(--color-text-secondary); }
    &:focus { border-color: var(--color-primary); }
    &::-webkit-search-cancel-button { display: none; }

    // Popover input uses full rounded rect
    .search-bar__popover & {
      border-radius: var(--radius-input);
    }
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
    padding: 4px;

    &:hover { color: var(--color-text-primary); }
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  &__chip {
    @include type('heading-s');
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    border: none;
    cursor: pointer;
    text-transform: capitalize;
    opacity: 0.6;
    transition: opacity 0.15s ease, transform 0.1s ease;

    &:hover { opacity: 0.85; }

    &--active {
      opacity: 1;
      transform: scale(1.05);
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    &--low    { color: var(--color-priority-low);    background: var(--color-priority-low-bg); }
    &--medium { color: var(--color-priority-medium); background: var(--color-priority-medium-bg); }
    &--high   { color: var(--color-priority-high);   background: var(--color-priority-high-bg); }
    &--urgent { color: var(--color-priority-urgent); background: var(--color-priority-urgent-bg); }
  }
}

.search-drop-enter-active,
.search-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.search-drop-enter-from,
.search-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
