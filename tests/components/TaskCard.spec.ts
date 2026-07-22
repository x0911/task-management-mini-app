import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '../../components/TaskCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import StageTracker from '../../components/StageTracker.vue'
import type { Task } from '../../types/task'

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

const baseTask: Task = {
  id: 'abc',
  title: 'Prepare release notes',
  description: 'Summarize changes for the changelog',
  status: 'pending',
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

function mountCard(task: Task) {
  return mount(TaskCard, {
    props: { task },
    global: {
      stubs: { NuxtLink: NuxtLinkStub },
      components: { StatusBadge, StageTracker }
    }
  })
}

describe('TaskCard', () => {
  it('renders the task title and description', () => {
    const wrapper = mountCard(baseTask)
    expect(wrapper.text()).toContain('Prepare release notes')
    expect(wrapper.text()).toContain('Summarize changes for the changelog')
  })

  it('links to the task detail page', () => {
    const wrapper = mountCard(baseTask)
    const link = wrapper.find(`a[href="/tasks/${baseTask.id}"]`)
    expect(link.exists()).toBe(true)
  })

  it('emits a delete event with the task when delete is clicked', async () => {
    const wrapper = mountCard(baseTask)
    await wrapper.find('[data-testid="delete-task-button"]').trigger('click')
    const emitted = wrapper.emitted('delete')
    expect(emitted).toHaveLength(1)
    expect((emitted![0][0] as Task).id).toBe('abc')
  })

  it('flags an overdue task that is not done', () => {
    const overdue = { ...baseTask, dueDate: new Date(Date.now() - 86400000).toISOString() }
    const wrapper = mountCard(overdue)
    expect(wrapper.find('.text-clay-600').exists()).toBe(true)
  })

  it('does not flag a done task as overdue even with a past due date', () => {
    const doneOverdue = { ...baseTask, status: 'done' as const, dueDate: new Date(Date.now() - 86400000).toISOString() }
    const wrapper = mountCard(doneOverdue)
    const dueLabel = wrapper.findAll('span').find((el) => el.text().startsWith('Due'))
    expect(dueLabel?.classes()).not.toContain('text-clay-600')
  })
})
