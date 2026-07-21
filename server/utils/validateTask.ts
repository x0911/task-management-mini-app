import { TASK_STATUSES } from '~/types/task'
import type { TaskStatus } from '~/types/task'

export interface TaskValidationResult {
  valid: boolean
  errors: string[]
  data?: {
    title: string
    description: string
    status: TaskStatus
    dueDate: string
  }
}

export function validateTaskPayload(body: any, options: { partial?: boolean } = {}): TaskValidationResult {
  const errors: string[] = []
  const partial = options.partial ?? false

  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  if (!partial || body?.title !== undefined) {
    if (!title) errors.push('Title is required.')
    else if (title.length > 140) errors.push('Title must be 140 characters or fewer.')
  }

  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  if (description.length > 2000) errors.push('Description must be 2000 characters or fewer.')

  const status = body?.status
  if (!partial || status !== undefined) {
    if (!TASK_STATUSES.includes(status)) errors.push('Status must be one of pending, in-progress, done.')
  }

  const dueDate = typeof body?.dueDate === 'string' ? body.dueDate : ''
  if (!partial || body?.dueDate !== undefined) {
    const parsed = dueDate ? new Date(dueDate) : null
    if (!parsed || Number.isNaN(parsed.getTime())) {
      errors.push('Due date is required and must be a valid date.')
    } else if (!partial && parsed.getTime() <= Date.now()) {
      errors.push('Due date must be in the future.')
    }
  }

  if (errors.length) return { valid: false, errors }

  return {
    valid: true,
    errors: [],
    data: {
      title,
      description,
      status: (status ?? 'pending') as TaskStatus,
      dueDate
    }
  }
}
