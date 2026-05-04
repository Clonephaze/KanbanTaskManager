import { useUiStore } from '~/stores/ui'
import { useBoardStore } from '~/stores/board'

/**
 * Global keyboard shortcuts:
 *   N         - New task (if board has columns)
 *   B         - New board
 *   /         - Focus search bar
 *   Esc       - Handled by ModalWrapper; also clears search
 *   E         - Edit current board
 */
export function useKeyboardShortcuts() {
  const uiStore = useUiStore()
  const boardStore = useBoardStore()

  if (!import.meta.client) return

  const handler = (e: KeyboardEvent) => {
    // Don't fire when typing in an input/textarea/select
    const tag = (e.target as HTMLElement).tagName.toLowerCase()
    if (['input', 'textarea', 'select'].includes(tag)) return
    // Don't fire when a modal is open (modal handles its own keyboard)
    if (uiStore.activeModal) return

    switch (e.key) {
      case 'n':
      case 'N':
        if (boardStore.activeBoard?.columns.length) {
          e.preventDefault()
          uiStore.openModal({ type: 'addTask' })
        }
        break
      case 'b':
      case 'B':
        e.preventDefault()
        uiStore.openModal({ type: 'addBoard' })
        break
      case '/':
        e.preventDefault()
        document.querySelector<HTMLInputElement>('.search-bar__input')?.focus()
        break
      case 'e':
      case 'E':
        if (boardStore.activeBoard) {
          e.preventDefault()
          uiStore.openModal({ type: 'editBoard' })
        }
        break
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
