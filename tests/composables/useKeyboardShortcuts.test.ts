/**
 * useKeyboardShortcuts composable tests
 *
 * Dispatches synthetic keyboard events on window and asserts the correct
 * Pinia store actions are triggered.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useSupabaseUser', () => () => ref(null))
mockNuxtImport('useSupabaseClient', () => () => ({}))

import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts'
import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fire(key: string, target: HTMLElement = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  Object.defineProperty(event, 'target', { value: target })
  window.dispatchEvent(event)
}

/**
 * Mount useKeyboardShortcuts inside a real component so that onMounted /
 * onUnmounted fire correctly and the window event listener is registered.
 */
function mountShortcuts(pinia: ReturnType<typeof createPinia>) {
  const TestComp = defineComponent({
    setup() { useKeyboardShortcuts() },
    template: '<div />',
  })
  return mount(TestComp, { global: { plugins: [pinia] } })
}

describe('useKeyboardShortcuts', () => {
  let uiStore: ReturnType<typeof useUiStore>
  let boardStore: ReturnType<typeof useBoardStore>
  let wrapper: VueWrapper

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    uiStore = useUiStore()
    boardStore = useBoardStore()
    boardStore.loadDemoBoards() // gives us an active board with columns

    wrapper = mountShortcuts(pinia)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // ── N key ─────────────────────────────────────────────────────────────────

  it('N opens addTask modal when active board has columns', () => {
    expect(boardStore.activeBoard?.columns.length).toBeGreaterThan(0)
    fire('N')
    expect(uiStore.activeModal?.type).toBe('addTask')
  })

  it('n (lowercase) also opens addTask modal', () => {
    fire('n')
    expect(uiStore.activeModal?.type).toBe('addTask')
  })

  it('N does nothing when active board has no columns', () => {
    // Add a board with no columns and make it active
    boardStore.boards.push({ id: 'empty-board', name: 'Empty', columns: [], position: 99 })
    boardStore.setActiveBoard('empty-board')

    fire('N')
    expect(uiStore.activeModal).toBeNull()
  })

  // ── B key ─────────────────────────────────────────────────────────────────

  it('B opens addBoard modal', () => {
    fire('B')
    expect(uiStore.activeModal?.type).toBe('addBoard')
  })

  it('b (lowercase) opens addBoard modal', () => {
    fire('b')
    expect(uiStore.activeModal?.type).toBe('addBoard')
  })

  // ── E key ─────────────────────────────────────────────────────────────────

  it('E opens editBoard modal when a board is active', () => {
    fire('E')
    expect(uiStore.activeModal?.type).toBe('editBoard')
  })

  it('e (lowercase) opens editBoard modal', () => {
    fire('e')
    expect(uiStore.activeModal?.type).toBe('editBoard')
  })

  // ── Modal guard ───────────────────────────────────────────────────────────

  it('ignores shortcuts when a modal is already open', () => {
    uiStore.openModal({ type: 'viewTask' })
    fire('B')
    // Should still be viewTask, not addBoard
    expect(uiStore.activeModal?.type).toBe('viewTask')
  })

  // ── Input element guard ───────────────────────────────────────────────────

  it('ignores shortcuts when focus is in an input element', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    fire('B', input)
    expect(uiStore.activeModal).toBeNull()
    document.body.removeChild(input)
  })

  it('ignores shortcuts when focus is in a textarea', () => {
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    fire('N', ta)
    expect(uiStore.activeModal).toBeNull()
    document.body.removeChild(ta)
  })
})
