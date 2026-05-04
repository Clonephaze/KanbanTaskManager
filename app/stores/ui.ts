import { defineStore } from 'pinia'
import type { ActiveModal, Priority } from '~/types'

const THEME_KEY = 'kanban-theme'

export const useUiStore = defineStore('ui', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const theme = ref<'light' | 'dark'>('light')
  const sidebarOpen = ref(true)
  const activeModal = ref<ActiveModal | null>(null)
  const mobileBoardPickerOpen = ref(false)
  const searchQuery = ref('')
  const filterPriority = ref<Priority | ''>('')

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

  function initLayout() {
    if (!import.meta.client) return
    // Start sidebar closed on mobile, open on tablet+
    sidebarOpen.value = window.innerWidth >= 768
  }

  function toggleMobileBoardPicker() {
    mobileBoardPickerOpen.value = !mobileBoardPickerOpen.value
  }

  function closeMobileBoardPicker() {
    mobileBoardPickerOpen.value = false
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
    mobileBoardPickerOpen,
    searchQuery,
    filterPriority,
    // Actions
    initTheme,
    initLayout,
    toggleTheme,
    toggleSidebar,
    toggleMobileBoardPicker,
    closeMobileBoardPicker,
    openModal,
    closeModal,
  }
})
