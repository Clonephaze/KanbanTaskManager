<template>
  <aside class="sidebar">
    <!-- Board list -->
    <nav class="sidebar__nav">
      <p class="sidebar__all-boards">All Boards ({{ boardStore.boards.length }})</p>
      <ul class="sidebar__board-list">
        <li v-for="board in boardStore.boards" :key="board.id">
          <button
            :class="['sidebar__board-item', { 'sidebar__board-item--active': board.id === boardStore.activeBoardId }]"
            :style="board.id === boardStore.activeBoardId && board.accent_color ? { '--board-accent': board.accent_color } : {}"
            @click="boardStore.setActiveBoard(board.id)"
          >
            <img :src="boardIcon" alt="" aria-hidden="true" width="16" height="16" />
            <span>{{ board.name }}</span>
          </button>
        </li>
        <li>
          <button class="sidebar__board-item sidebar__board-item--create" @click="uiStore.openModal({ type: 'addBoard' })">
            <img :src="boardIcon" alt="" aria-hidden="true" width="16" height="16" />
            <span>+ Create New Board</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Bottom controls -->
    <div class="sidebar__footer">
      <!-- Auth buttons (demo mode only) -->
      <div v-if="boardStore.isDemoMode" class="sidebar__auth">
        <p class="sidebar__auth-label">You're in demo mode</p>
        <div class="sidebar__auth-btns">
          <BaseButton variant="primary-s" @click="navigateTo('/login?mode=signup')">Create account</BaseButton>
          <BaseButton variant="secondary" @click="navigateTo('/login')">Log in</BaseButton>
        </div>
      </div>

      <!-- Theme toggle -->
      <div class="sidebar__theme-toggle">
        <img :src="moonIcon" alt="Dark mode" width="15" height="15" />
        <button
          class="sidebar__toggle-track"
          :aria-checked="uiStore.theme === 'light'"
          role="switch"
          aria-label="Toggle theme"
          @click="uiStore.toggleTheme()"
        >
          <span class="sidebar__toggle-thumb" />
        </button>
        <img :src="sunIcon" alt="Light mode" width="15" height="15" />
      </div>

      <!-- Hide sidebar -->
      <button class="sidebar__hide-btn" @click="uiStore.toggleSidebar()">
        <img :src="hideSidebarIcon" alt="" aria-hidden="true" width="18" height="16" />
        <span>Hide Sidebar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'
import boardIcon from '~/assets/icons/icon-board.svg'
import moonIcon from '~/assets/icons/icon-dark-theme.svg'
import sunIcon from '~/assets/icons/icon-light-theme.svg'
import hideSidebarIcon from '~/assets/icons/icon-hide-sidebar.svg'

const boardStore = useBoardStore()
const uiStore = useUiStore()
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/tokens' as *;

.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;

  @include mobile-only {
    display: none;
  }

  @include wide-up {
    width: 300px;
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    @include scrollbar-hidden;
    padding-top: 16px;
  }

  &__all-boards {
    @include type('heading-s');
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 2.4px;
    padding: 0 24px 20px;
  }

  &__board-list {
    padding-right: 24px; // leaves space for pill overflow on the right
  }

  &__board-item {
    @include type('heading-m');
    @include focus-ring;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 24px;
    border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
    color: var(--color-text-secondary);
    transition: background-color 0.15s ease, color 0.15s ease;
    text-align: left;

    img {
      opacity: 0.6;
      filter: none;
      flex-shrink: 0;
    }

    &:hover:not(&--active) {
      background-color: var(--color-btn-secondary-bg);
      color: var(--color-primary);

      img {
        opacity: 1;
        filter: invert(35%) sepia(80%) saturate(600%) hue-rotate(218deg);
      }
    }

    &--active {
      background-color: var(--board-accent, var(--color-primary));
      color: #ffffff;

      img {
        opacity: 1;
        filter: brightness(0) invert(1);
      }
    }

    &--create {
      color: var(--color-primary);

      img {
        opacity: 1;
        filter: invert(35%) sepia(80%) saturate(600%) hue-rotate(218deg);
      }

      &:hover {
        background-color: var(--color-btn-secondary-bg);
      }
    }
  }

  &__auth {
    padding: 12px 0 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__auth-label {
    @include type('body-m');
    color: var(--color-text-secondary);
    text-align: center;
  }

  &__auth-btns {
    display: flex;
    flex-direction: column;  // always stack vertically — 260px isn't wide enough for two side-by-side
    gap: 8px;
  }

  &__footer {
    flex-shrink: 0;
    padding: 16px 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 14px;
    background-color: var(--color-bg);
    border-radius: var(--radius-input);
    margin-bottom: 8px;
  }

  &__toggle-track {
    @include focus-ring;
    position: relative;
    width: 40px;
    height: 20px;
    border-radius: 10px;
    background-color: var(--color-primary);
    flex-shrink: 0;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--color-primary-hover);
    }
  }

  &__toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: transform 0.2s ease;

    // Light theme: thumb slides right
    [data-theme="light"] & {
      transform: translateX(20px);
    }
  }

  &__hide-btn {
    @include type('heading-m');
    @include focus-ring;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 0;
    color: var(--color-text-secondary);
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
