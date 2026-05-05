/**
 * ui store unit tests
 *
 * Tests theme persistence, modal routing, sidebar toggle, and search state.
 * No Supabase dependencies — this store is entirely client-side.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '~/stores/ui'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Theme ─────────────────────────────────────────────────────────────────

  describe('toggleTheme()', () => {
    it('switches from light to dark', () => {
      const store = useUiStore()
      store.theme = 'light'
      store.toggleTheme()
      expect(store.theme).toBe('dark')
    })

    it('switches from dark to light', () => {
      const store = useUiStore()
      store.theme = 'dark'
      store.toggleTheme()
      expect(store.theme).toBe('light')
    })

    it('persists theme to localStorage', () => {
      const store = useUiStore()
      store.theme = 'light'
      store.toggleTheme()
      expect(localStorage.getItem('kanban-theme')).toBe('dark')
    })

    it('sets data-theme attribute on <html>', () => {
      const store = useUiStore()
      store.theme = 'light'
      store.toggleTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('initTheme()', () => {
    it('restores theme from localStorage', () => {
      localStorage.setItem('kanban-theme', 'dark')
      const store = useUiStore()
      store.initTheme()
      expect(store.theme).toBe('dark')
    })

    it('defaults to light when localStorage is empty', () => {
      const store = useUiStore()
      store.initTheme()
      expect(store.theme).toBe('light')
    })
  })

  // ── Sidebar ───────────────────────────────────────────────────────────────

  describe('toggleSidebar()', () => {
    it('flips sidebarOpen', () => {
      const store = useUiStore()
      const before = store.sidebarOpen
      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(!before)
      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(before)
    })
  })

  // ── Modal ─────────────────────────────────────────────────────────────────

  describe('openModal() / closeModal()', () => {
    it('sets activeModal to the provided type', () => {
      const store = useUiStore()
      store.openModal({ type: 'addTask' })
      expect(store.activeModal?.type).toBe('addTask')
    })

    it('replaces any existing open modal', () => {
      const store = useUiStore()
      store.openModal({ type: 'addBoard' })
      store.openModal({ type: 'editBoard' })
      expect(store.activeModal?.type).toBe('editBoard')
    })

    it('closes modal on closeModal()', () => {
      const store = useUiStore()
      store.openModal({ type: 'deleteTask' })
      store.closeModal()
      expect(store.activeModal).toBeNull()
    })

    it('preserves arbitrary payload', () => {
      const store = useUiStore()
      const payload = { task: { id: 'abc', title: 'Test' }, columnName: 'Todo' }
      store.openModal({ type: 'viewTask', payload })
      expect(store.activeModal?.payload).toEqual(payload)
    })

    it('all modal types are accepted', () => {
      const store = useUiStore()
      const types = ['addTask', 'editTask', 'viewTask', 'addBoard', 'editBoard', 'deleteBoard', 'deleteTask'] as const
      for (const type of types) {
        store.openModal({ type })
        expect(store.activeModal?.type).toBe(type)
      }
    })
  })

  // ── Search / filter ───────────────────────────────────────────────────────

  describe('searchQuery and filterPriority', () => {
    it('initialises to empty strings', () => {
      const store = useUiStore()
      expect(store.searchQuery).toBe('')
      expect(store.filterPriority).toBe('')
    })

    it('can be set to a priority value', () => {
      const store = useUiStore()
      store.filterPriority = 'high'
      expect(store.filterPriority).toBe('high')
    })

    it('can be cleared back to empty string', () => {
      const store = useUiStore()
      store.filterPriority = 'urgent'
      store.filterPriority = ''
      expect(store.filterPriority).toBe('')
    })
  })

  // ── Mobile board picker ───────────────────────────────────────────────────

  describe('toggleMobileBoardPicker()', () => {
    it('opens the picker when closed', () => {
      const store = useUiStore()
      expect(store.mobileBoardPickerOpen).toBe(false)
      store.toggleMobileBoardPicker()
      expect(store.mobileBoardPickerOpen).toBe(true)
    })

    it('closes the picker when open', () => {
      const store = useUiStore()
      store.toggleMobileBoardPicker()
      store.toggleMobileBoardPicker()
      expect(store.mobileBoardPickerOpen).toBe(false)
    })

    it('closeMobileBoardPicker() always closes', () => {
      const store = useUiStore()
      store.toggleMobileBoardPicker() // open it
      store.closeMobileBoardPicker()
      expect(store.mobileBoardPickerOpen).toBe(false)
    })
  })
})
