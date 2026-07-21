import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../../components/TaskForm.vue'

function futureDateInput(daysAhead = 3) {
  return new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10)
}

describe('TaskForm', () => {
  it('renders empty fields by default', () => {
    const wrapper = mount(TaskForm)
    expect((wrapper.find('#task-title').element as HTMLInputElement).value).toBe('')
  })

  it('shows a title error and does not emit submit when title is empty', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.find('#task-due-date').setValue(futureDateInput())
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Title is required.')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('shows a due date error when the date is missing', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.find('#task-title').setValue('New task')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Due date is required.')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('emits submit with a valid payload when the form is valid', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.find('#task-title').setValue('New task')
    await wrapper.find('#task-due-date').setValue(futureDateInput())
    await wrapper.find('form').trigger('submit.prevent')

    const events = wrapper.emitted('submit')
    expect(events).toHaveLength(1)
    expect((events![0][0] as any).title).toBe('New task')
  })

  it('pre-fills fields from the initial prop', () => {
    const wrapper = mount(TaskForm, {
      props: {
        initial: {
          title: 'Existing task',
          description: 'Some notes',
          status: 'in-progress',
          dueDate: new Date().toISOString()
        }
      }
    })
    expect((wrapper.find('#task-title').element as HTMLInputElement).value).toBe('Existing task')
    expect((wrapper.find('#task-status').element as HTMLSelectElement).value).toBe('in-progress')
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables the submit button while busy', () => {
    const wrapper = mount(TaskForm, { props: { busy: true } })
    expect(wrapper.find('[data-testid="task-form-submit"]').attributes('disabled')).toBeDefined()
  })
})
