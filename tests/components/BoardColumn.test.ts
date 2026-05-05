/**
 * BoardColumn component tests
 *
 * Verifies column name rendering, task count, WIP limit badge visibility,
 * and the over-WIP warning state.
 */
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import BoardColumn from '~/components/board/BoardColumn.vue'

// createTestingPinia still runs store setup() which calls these composables
mockNuxtImport('useSupabaseUser', () => () => ref(null))
mockNuxtImport('useSupabaseClient', () => () => ({}))
import type { Column, Task } from '~/types'

// VueDraggable is registered globally via the Nuxt client plugin so we stub it
// at mount time via global.stubs rather than trying to mock the module.

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    description: '',
    status: 'Todo',
    priority: 'medium',
    subtasks: [],
    position: 0,
    ...overrides,
  }
}

function makeColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: 'col-1',
    name: 'Todo',
    wip_limit: 0,
    position: 0,
    tasks: [],
    ...overrides,
  }
}

function mountColumn(column: Column, index = 0) {
  return mount(BoardColumn, {
    props: { column, columnIndex: index },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: () => vi.fn(),
          initialState: {
            board: {
              boards: [{ id: 'b1', name: 'Test', columns: [column], position: 0 }],
              activeBoardId: 'b1',
            },
            ui: { searchQuery: '', filterPriority: '' },
          },
        }),
      ],
      stubs: {
        BoardColumnDot: { template: '<span class="dot" />' },
        TaskCard: { template: '<div class="task-card-stub" />', props: ['task', 'columnName'] },
        Transition: { template: '<slot />' },
        VueDraggable: { template: '<div class="draggable-stub"><slot /></div>', props: ['modelValue', 'group', 'itemKey', 'ghostClass', 'dragClass'], emits: ['update:modelValue', 'end'] },
      },
    },
  })
}

describe('BoardColumn', () => {
  it('renders column name', () => {
    const wrapper = mountColumn(makeColumn({ name: 'In Progress' }))
    expect(wrapper.find('.board-column__name').text()).toContain('In Progress')
  })

  it('shows task count in the heading', () => {
    const col = makeColumn({ tasks: [makeTask(), makeTask(), makeTask()] })
    const wrapper = mountColumn(col)
    expect(wrapper.find('.board-column__name').text()).toContain('3')
  })

  describe('WIP limit badge', () => {
    it('is hidden when wip_limit is 0', () => {
      const col = makeColumn({ wip_limit: 0, tasks: [makeTask()] })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').exists()).toBe(false)
    })

    it('is visible when wip_limit > 0', () => {
      const col = makeColumn({ wip_limit: 3, tasks: [makeTask()] })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').exists()).toBe(true)
    })

    it('shows tasks/limit text', () => {
      const col = makeColumn({ wip_limit: 5, tasks: [makeTask(), makeTask()] })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').text()).toBe('2/5')
    })

    it('does not have --over class when within limit', () => {
      const col = makeColumn({ wip_limit: 3, tasks: [makeTask(), makeTask()] })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').classes()).not.toContain('board-column__wip--over')
    })

    it('has --over class when tasks exceed wip_limit', () => {
      const tasks = [makeTask(), makeTask(), makeTask(), makeTask()]
      const col = makeColumn({ wip_limit: 3, tasks })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').classes()).toContain('board-column__wip--over')
    })

    it('has --over class when tasks exactly equals wip_limit + 1', () => {
      const tasks = [makeTask(), makeTask(), makeTask(), makeTask()] // 4 tasks, limit 3
      const col = makeColumn({ wip_limit: 3, tasks })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').classes()).toContain('board-column__wip--over')
    })

    it('does NOT have --over class when tasks equal wip_limit exactly', () => {
      const tasks = [makeTask(), makeTask(), makeTask()]
      const col = makeColumn({ wip_limit: 3, tasks })
      const wrapper = mountColumn(col)
      expect(wrapper.find('.board-column__wip').classes()).not.toContain('board-column__wip--over')
    })
  })

  describe('empty filter state', () => {
    it('shows filter-empty message when search hides all tasks but tasks exist', async () => {
      const col = makeColumn({
        tasks: [makeTask({ title: 'Alpha Task' })],
      })
      const wrapper = mountColumn(col)
      // Simulate search query that matches nothing — update the store state
      const { useUiStore } = await import('~/stores/ui')
      const uiStore = useUiStore()
      uiStore.searchQuery = 'zzzzz_no_match'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.board-column__filter-empty').exists()).toBe(true)
    })
  })
})
