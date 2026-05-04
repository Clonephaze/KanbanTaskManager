<template>
  <Teleport to="body">
    <div class="mobile-picker-backdrop" @click.self="uiStore.closeMobileBoardPicker()">
      <div class="mobile-picker">
        <p class="mobile-picker__heading">ALL BOARDS ({{ boardStore.boards.length }})</p>

        <ul class="mobile-picker__list">
          <li v-for="board in boardStore.boards" :key="board.id">
            <button
              :class="['mobile-picker__item', { 'mobile-picker__item--active': board.id === boardStore.activeBoardId }]"
              :style="board.id === boardStore.activeBoardId && board.accent_color ? { '--board-accent': board.accent_color } : {}"
              @click="selectBoard(board.id)"
            >
              <img :src="boardIcon" alt="" aria-hidden="true" width="16" height="16" />
              {{ board.name }}
            </button>
          </li>
          <li>
            <button class="mobile-picker__item mobile-picker__item--create" @click="onCreateBoard">
              <img :src="boardIcon" alt="" aria-hidden="true" width="16" height="16" />
              + Create New Board
            </button>
          </li>
        </ul>

        <div class="mobile-picker__theme-toggle">
          <img :src="sunIcon" alt="Light mode" width="15" height="15" />
          <button
            class="mobile-picker__toggle-track"
            role="switch"
            :aria-checked="uiStore.theme === 'dark'"
            aria-label="Toggle theme"
            @click="uiStore.toggleTheme()"
          >
            <span class="mobile-picker__toggle-thumb" />
          </button>
          <img :src="moonIcon" alt="Dark mode" width="15" height="15" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'
import boardIcon from '~/assets/icons/icon-board.svg'
import sunIcon from '~/assets/icons/icon-light-theme.svg'
import moonIcon from '~/assets/icons/icon-dark-theme.svg'

const boardStore = useBoardStore()
const uiStore = useUiStore()

function selectBoard(id: string) {
  boardStore.setActiveBoard(id)
  uiStore.closeMobileBoardPicker()
}

function onCreateBoard() {
  uiStore.closeMobileBoardPicker()
  uiStore.openModal({ type: 'addBoard' })
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.mobile-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 72px; // sits just below the 64px mobile header
}

.mobile-picker {
  background-color: var(--color-surface);
  border-radius: var(--radius-modal);
  width: min(264px, calc(100vw - 48px));
  padding-bottom: 16px;
  overflow: hidden;

  &__heading {
    @include type('heading-s');
    color: var(--color-text-secondary);
    letter-spacing: 2.4px;
    text-transform: uppercase;
    padding: 20px 24px 16px;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    padding-right: 24px;
    margin-bottom: 16px;
  }

  &__item {
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

  &__theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin: 0 16px;
    padding: 14px;
    background-color: var(--color-bg);
    border-radius: var(--radius-input);
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

    [data-theme="light"] & {
      transform: translateX(20px);
    }
  }
}
</style>
