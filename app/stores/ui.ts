import { defineStore } from 'pinia'
import type { ActiveModal } from '~/types'

const THEME_KEY = 'kanban-theme'

export const useUiStore = defineStore('ui', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const theme = ref<'light' | 'dark'>('light')
  const sidebarOpen = ref(true)
  const activeModal = ref<ActiveModal | null>(null)

  // ---------------------------------------------------------------------------
  // Init — restore persisted theme client-side only
  // ---------------------------------------------------------------------------
  function initTheme() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
    if (stored) theme.value = stored
    applyTheme()
  }

  function applyTheme() {
    if (!import.meta.client) return
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function openModal(modal: ActiveModal) {
    activeModal.value = modal
  }

  function closeModal() {
    activeModal.value = null
  }

  return {
    // State
    theme,
    sidebarOpen,
    activeModal,
    // Actions
    initTheme,
    toggleTheme,
    toggleSidebar,
    openModal,
    closeModal,
  }
})
