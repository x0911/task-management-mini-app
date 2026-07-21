export type TaskStatus = 'pending' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
  dueDate: string
}

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'done']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  done: 'Done'
}
