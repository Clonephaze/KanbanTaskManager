/**
 * TaskCard component tests
 *
 * Verifies title rendering, subtask count, priority class, due-date classes,
 * and that clicking the card opens the viewTask modal.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import TaskCard from '~/components/task/TaskCard.vue'
import type { Task } from '~/types'

const baseTask: Task = {
  id: 'task-1',
  title: 'Build onboarding flow',
  description: 'Some desc',
  status: 'Todo',
  priority: 'high',
  subtasks: [
    { id: 's1', title: 'Sign up page', is_completed: true, position: 0 },
    { id: 's2', title: 'Sign in page', is_completed: false, position: 1 },
    { id: 's3', title: 'Welcome page', is_completed: false, position: 2 },
  ],
  position: 0,
}

function mountCard(task: Partial<Task> = {}) {
  return mount(TaskCard, {
    props: { task: { ...baseTask, ...task }, columnName: 'Todo' },
    global: {
      plugins: [
        createTestingPinia({ createSpy: () => vi.fn() }),
      ],
    },
  })
}

describe('TaskCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the task title', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.task-card__title').text()).toBe('Build onboarding flow')
  })

  it('shows correct completed/total subtask count', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.task-card__subtasks').text()).toBe('1 of 3 subtasks')
  })

  it('shows 0 of N when no subtasks are completed', () => {
    const wrapper = mountCard({
      subtasks: [
        { id: 's1', title: 'A', is_completed: false, position: 0 },
        { id: 's2', title: 'B', is_completed: false, position: 1 },
      ],
    })
    expect(wrapper.find('.task-card__subtasks').text()).toBe('0 of 2 subtasks')
  })

  it('renders the priority badge with correct modifier class', () => {
    const wrapper = mountCard({ priority: 'urgent' })
    const badge = wrapper.find('.task-card__priority')
    expect(badge.exists()).toBe(true)
    expect(badge.classes()).toContain('task-card__priority--urgent')
    expect(badge.text()).toBe('urgent')
  })

  it('does not render priority badge when priority is undefined', () => {
    const wrapper = mountCard({ priority: undefined })
    expect(wrapper.find('.task-card__priority').exists()).toBe(false)
  })

  it('does not render due date element when due_date is absent', () => {
    const wrapper = mountCard({ due_date: undefined })
    expect(wrapper.find('.task-card__due').exists()).toBe(false)
  })

  it('renders due date element when due_date is present', () => {
    const wrapper = mountCard({ due_date: '2099-12-31' })
    expect(wrapper.find('.task-card__due').exists()).toBe(true)
  })

  it('applies --overdue class for past due dates', () => {
    const wrapper = mountCard({ due_date: '2020-01-01' })
    expect(wrapper.find('.task-card__due').classes()).toContain('task-card__due--overdue')
  })

  it('applies --ok class for far-future due dates', () => {
    const wrapper = mountCard({ due_date: '2099-12-31' })
    expect(wrapper.find('.task-card__due').classes()).toContain('task-card__due--ok')
  })

  it('calls uiStore.openModal with viewTask payload on click', async () => {
    const wrapper = mountCard()
    await wrapper.find('.task-card').trigger('click')
    // createTestingPinia spies on store actions — access via useUiStore()
    const { useUiStore } = await import('~/stores/ui')
    const uiStore = useUiStore()
    expect(uiStore.openModal).toHaveBeenCalledWith({
      type: 'viewTask',
      payload: expect.objectContaining({ columnName: 'Todo' }),
    })
  })
})
