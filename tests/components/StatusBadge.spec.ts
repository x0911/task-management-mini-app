import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../../components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the correct label for each status', () => {
    expect(mount(StatusBadge, { props: { status: 'pending' } }).text()).toBe('Pending')
    expect(mount(StatusBadge, { props: { status: 'in-progress' } }).text()).toBe('In Progress')
    expect(mount(StatusBadge, { props: { status: 'done' } }).text()).toBe('Done')
  })

  it('applies distinct styling per status', () => {
    const done = mount(StatusBadge, { props: { status: 'done' } })
    const pending = mount(StatusBadge, { props: { status: 'pending' } })
    expect(done.classes().join(' ')).not.toBe(pending.classes().join(' '))
  })
})
