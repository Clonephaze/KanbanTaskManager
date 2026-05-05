/**
 * DeleteConfirmModal component tests
 *
 * Verifies that the modal shows the correct copy for board vs task deletion,
 * and that the confirm button calls the right store action.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import DeleteConfirmModal from '~/components/modal/DeleteConfirmModal.vue'

// createTestingPinia still runs store setup() which calls these composables
mockNuxtImport('useSupabaseUser', () => () => ref(null))
mockNuxtImport('useSupabaseClient', () => () => ({}))

// Stub BaseButton so we don't need the full component tree
const BaseButtonStub = {
  template: '<button @click="$emit(\'click\')"><slot /></button>',
  emits: ['click'],
  props: ['variant', 'full'],
}

function mountModal(modalState: object) {
  return mount(DeleteConfirmModal, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: () => vi.fn(),
          initialState: {
            ui: { activeModal: modalState },
            board: {
              boards: [{
                id: 'board-1',
                name: 'Platform Launch',
                columns: [{
                  id: 'col-1',
                  name: 'Todo',
                  wip_limit: 0,
                  position: 0,
                  tasks: [],
                }],
                position: 0,
              }],
              activeBoardId: 'board-1',
            },
          },
        }),
      ],
      stubs: { BaseButton: BaseButtonStub },
    },
  })
}

describe('DeleteConfirmModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('board deletion', () => {
    it('shows "Delete this board?" heading', () => {
      const wrapper = mountModal({ type: 'deleteBoard' })
      expect(wrapper.find('.delete-confirm__title').text()).toBe('Delete this board?')
    })

    it('shows the board name in the body copy', () => {
      const wrapper = mountModal({ type: 'deleteBoard' })
      expect(wrapper.find('.delete-confirm__body').text()).toContain('Platform Launch')
    })

    it('calls boardStore.deleteBoard on confirm click', async () => {
      const wrapper = mountModal({ type: 'deleteBoard' })
      const { useBoardStore } = await import('~/stores/board')
      const boardStore = useBoardStore()

      // First button is "Delete"
      await wrapper.findAll('button')[0]!.trigger('click')
      expect(boardStore.deleteBoard).toHaveBeenCalledOnce()
    })

    it('calls uiStore.closeModal on confirm click', async () => {
      const wrapper = mountModal({ type: 'deleteBoard' })
      const { useUiStore } = await import('~/stores/ui')
      const uiStore = useUiStore()

      await wrapper.findAll('button')[0]!.trigger('click')
      expect(uiStore.closeModal).toHaveBeenCalled()
    })

    it('calls uiStore.closeModal on cancel click', async () => {
      const wrapper = mountModal({ type: 'deleteBoard' })
      const { useUiStore } = await import('~/stores/ui')
      const uiStore = useUiStore()

      // Second button is "Cancel"
      await wrapper.findAll('button')[1]!.trigger('click')
      expect(uiStore.closeModal).toHaveBeenCalled()
    })
  })

  describe('task deletion', () => {
    const taskPayload = {
      task: { id: 't1', title: 'Build UI for search', status: 'Todo', description: '', subtasks: [], position: 0 },
      columnName: 'Todo',
    }

    it('shows "Delete this task?" heading', () => {
      const wrapper = mountModal({ type: 'deleteTask', payload: taskPayload })
      expect(wrapper.find('.delete-confirm__title').text()).toBe('Delete this task?')
    })

    it('shows the task title in the body copy', () => {
      const wrapper = mountModal({ type: 'deleteTask', payload: taskPayload })
      expect(wrapper.find('.delete-confirm__body').text()).toContain('Build UI for search')
    })

    it('calls boardStore.deleteTask with column and title on confirm click', async () => {
      const wrapper = mountModal({ type: 'deleteTask', payload: taskPayload })
      const { useBoardStore } = await import('~/stores/board')
      const boardStore = useBoardStore()

      await wrapper.findAll('button')[0]!.trigger('click')
      expect(boardStore.deleteTask).toHaveBeenCalledWith('Todo', 'Build UI for search')
    })
  })
})
