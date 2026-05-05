/**
 * BaseDropdown component tests
 *
 * Verifies open/close behaviour, option selection, and v-model emission.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseDropdown from '~/components/ui/BaseDropdown.vue'

// Stub SVG imports that Nuxt resolves at build time
vi.mock('~/assets/icons/icon-chevron-down.svg', () => ({ default: 'chevron-down.svg' }))
vi.mock('~/assets/icons/icon-chevron-up.svg', () => ({ default: 'chevron-up.svg' }))

function mountDropdown(overrides: object = {}) {
  return mount(BaseDropdown, {
    props: {
      modelValue: 'Todo',
      options: ['Todo', 'Doing', 'Done'],
      ...overrides,
    },
    global: {
      stubs: { Transition: { template: '<slot />' } },
    },
  })
}

describe('BaseDropdown', () => {
  it('renders the current modelValue', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('.base-dropdown__value').text()).toBe('Todo')
  })

  it('list is hidden initially', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('.base-dropdown__list').exists()).toBe(false)
  })

  it('opens the list on trigger click', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    expect(wrapper.find('.base-dropdown__list').exists()).toBe(true)
  })

  it('closes the list on second trigger click', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    expect(wrapper.find('.base-dropdown__list').exists()).toBe(false)
  })

  it('renders all options', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    const options = wrapper.findAll('.base-dropdown__option')
    expect(options).toHaveLength(3)
    expect(options[0]!.text()).toBe('Todo')
    expect(options[1]!.text()).toBe('Doing')
    expect(options[2]!.text()).toBe('Done')
  })

  it('marks the selected option with --selected class', async () => {
    const wrapper = mountDropdown({ modelValue: 'Doing' })
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    const selected = wrapper.find('.base-dropdown__option--selected')
    expect(selected.text()).toBe('Doing')
  })

  it('emits update:modelValue with the clicked option', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    await wrapper.findAll('.base-dropdown__option')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Done'])
  })

  it('closes the list after an option is selected', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    await wrapper.findAll('.base-dropdown__option')[1]!.trigger('click')
    expect(wrapper.find('.base-dropdown__list').exists()).toBe(false)
  })

  it('renders the label when provided', () => {
    const wrapper = mountDropdown({ label: 'Status' })
    expect(wrapper.find('.base-dropdown__label').text()).toBe('Status')
  })

  it('does not render label element when label prop is absent', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('.base-dropdown__label').exists()).toBe(false)
  })

  it('trigger has aria-expanded="true" when open', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.base-dropdown__trigger').trigger('click')
    expect(wrapper.find('.base-dropdown__trigger').attributes('aria-expanded')).toBe('true')
  })

  it('trigger has aria-expanded="false" when closed', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('.base-dropdown__trigger').attributes('aria-expanded')).toBe('false')
  })
})
