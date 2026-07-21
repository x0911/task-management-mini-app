import { reactive, computed } from 'vue'
import type { TaskInput, TaskStatus } from '~/types/task'

export interface TaskFormErrors {
  title?: string
  dueDate?: string
}

export function toDateInputValue(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function useTaskForm(initial?: Partial<TaskInput>, options: { requireFutureDueDate?: boolean } = {}) {
  const requireFutureDueDate = options.requireFutureDueDate ?? true

  const form = reactive<TaskInput>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    status: (initial?.status as TaskStatus) ?? 'pending',
    dueDate: initial?.dueDate ? toDateInputValue(initial.dueDate) : ''
  })

  const errors = reactive<TaskFormErrors>({})

  function validate(): boolean {
    errors.title = undefined
    errors.dueDate = undefined

    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) {
      errors.title = 'Title is required.'
    } else if (trimmedTitle.length > 140) {
      errors.title = 'Title must be 140 characters or fewer.'
    }

    if (!form.dueDate) {
      errors.dueDate = 'Due date is required.'
    } else if (requireFutureDueDate) {
      const chosen = new Date(form.dueDate + 'T23:59:59')
      const now = new Date()
      if (chosen.getTime() <= now.getTime()) {
        errors.dueDate = 'Due date must be in the future.'
      }
    }

    return !errors.title && !errors.dueDate
  }

  const isValid = computed(() => !errors.title && !errors.dueDate)

  function toPayload(): TaskInput {
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      dueDate: new Date(form.dueDate + 'T23:59:59').toISOString()
    }
  }

  return { form, errors, validate, isValid, toPayload }
}
