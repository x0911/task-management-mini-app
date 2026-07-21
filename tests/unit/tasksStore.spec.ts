import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../../stores/tasks'
import type { Task } from '../../types/task'

const baseTask: Task = {
  id: '1',
  title: 'Sample',
  description: '',
  status: 'pending',
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('$fetch', vi.fn())
})

describe('useTasksStore', () => {
  it('starts with empty, unloaded state', () => {
    const store = useTasksStore()
    expect(store.tasks).toEqual([])
    expect(store.loaded).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches tasks successfully', async () => {
    ; (global.$fetch as any).mockResolvedValueOnce([baseTask])
    const store = useTasksStore()
    await store.fetchTasks()
    expect(store.tasks).toHaveLength(1)
    expect(store.loaded).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets an error message when fetching fails', async () => {
    ; (global.$fetch as any).mockRejectedValueOnce({ statusMessage: 'Boom' })
    const store = useTasksStore()
    await store.fetchTasks()
    expect(store.error).toBe('Boom')
    expect(store.loading).toBe(false)
  })

  it('creates a task and prepends it to the list', async () => {
    ; (global.$fetch as any).mockResolvedValueOnce(baseTask)
    const store = useTasksStore()
    const created = await store.createTask({
      title: 'Sample',
      description: '',
      status: 'pending',
      dueDate: baseTask.dueDate
    })
    expect(created).toEqual(baseTask)
    expect(store.tasks[0]).toEqual(baseTask)
  })

  it('surfaces validation errors from the API on create', async () => {
    ; (global.$fetch as any).mockRejectedValueOnce({ data: { data: { errors: ['Title is required.'] } } })
    const store = useTasksStore()
    await expect(
      store.createTask({ title: '', description: '', status: 'pending', dueDate: baseTask.dueDate })
    ).rejects.toBeTruthy()
    expect(store.error).toBe('Title is required.')
  })

  it('updates an existing task in place', async () => {
    const store = useTasksStore()
    store.tasks = [baseTask]
    const updatedTask = { ...baseTask, status: 'done' as const }
      ; (global.$fetch as any).mockResolvedValueOnce(updatedTask)
    await store.updateTask('1', { status: 'done' })
    expect(store.tasks[0].status).toBe('done')
  })

  it('deletes a task from the list', async () => {
    const store = useTasksStore()
    store.tasks = [baseTask]
      ; (global.$fetch as any).mockResolvedValueOnce(null)
    await store.deleteTask('1')
    expect(store.tasks).toHaveLength(0)
  })

  it('filters tasks by status', () => {
    const store = useTasksStore()
    store.tasks = [baseTask, { ...baseTask, id: '2', status: 'done' }]
    store.setStatusFilter('done')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].id).toBe('2')
  })

  it('filters tasks by case-insensitive search term', () => {
    const store = useTasksStore()
    store.tasks = [baseTask, { ...baseTask, id: '2', title: 'Other item' }]
    store.setSearchTerm('SAMPLE')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].id).toBe('1')
  })

  it('combines status filter and search term', () => {
    const store = useTasksStore()
    store.tasks = [
      baseTask,
      { ...baseTask, id: '2', status: 'done' },
      { ...baseTask, id: '3', title: 'Other', status: 'done' }
    ]
    store.setStatusFilter('done')
    store.setSearchTerm('sample')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].id).toBe('2')
  })

  it('computes task counts per status', () => {
    const store = useTasksStore()
    store.tasks = [
      baseTask,
      { ...baseTask, id: '2', status: 'done' },
      { ...baseTask, id: '3', status: 'in-progress' }
    ]
    expect(store.taskCounts).toEqual({ all: 3, pending: 1, 'in-progress': 1, done: 1 })
  })

  it('finds a task by id via getById', () => {
    const store = useTasksStore()
    store.tasks = [baseTask]
    expect(store.getById('1')).toEqual(baseTask)
    expect(store.getById('missing')).toBeUndefined()
  })

  it('clears the error state', () => {
    const store = useTasksStore()
    store.error = 'Something broke'
    store.clearError()
    expect(store.error).toBeNull()
  })
})
