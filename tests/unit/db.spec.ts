import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Task } from '../../types/task'

let virtualFile = '[]'

vi.mock('node:fs', () => {
  const promises = {
    readFile: vi.fn(async () => virtualFile),
    writeFile: vi.fn(async (_path: string, contents: string) => {
      virtualFile = contents
    })
  }
  return { promises, default: { promises } }
})

const sample: Task = {
  id: 'task-1',
  title: 'Write docs',
  description: 'Cover setup steps',
  status: 'pending',
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

beforeEach(() => {
  virtualFile = '[]'
  vi.resetModules()
})

describe('taskRepository', () => {
  it('returns an empty array when the file has no tasks', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    const tasks = await taskRepository.findAll()
    expect(tasks).toEqual([])
  })

  it('creates a task and persists it', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    await taskRepository.create(sample)
    const tasks = await taskRepository.findAll()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Write docs')
  })

  it('finds a task by id', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    await taskRepository.create(sample)
    const found = await taskRepository.findById('task-1')
    expect(found?.id).toBe('task-1')
  })

  it('returns undefined for a missing id', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    const found = await taskRepository.findById('missing')
    expect(found).toBeUndefined()
  })

  it('updates a task and bumps updatedAt while preserving createdAt', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    await taskRepository.create(sample)
    const updated = await taskRepository.update('task-1', { status: 'done' })
    expect(updated?.status).toBe('done')
    expect(updated?.createdAt).toBe(sample.createdAt)
    expect(updated?.id).toBe('task-1')
  })

  it('returns undefined when updating a missing task', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    const updated = await taskRepository.update('missing', { status: 'done' })
    expect(updated).toBeUndefined()
  })

  it('removes a task', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    await taskRepository.create(sample)
    const removed = await taskRepository.remove('task-1')
    expect(removed).toBe(true)
    const tasks = await taskRepository.findAll()
    expect(tasks).toHaveLength(0)
  })

  it('returns false when removing a task that does not exist', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    const removed = await taskRepository.remove('missing')
    expect(removed).toBe(false)
  })

  it('serializes concurrent writes without losing data', async () => {
    const { taskRepository } = await import('../../server/utils/db')
    await Promise.all([
      taskRepository.create({ ...sample, id: 'a' }),
      taskRepository.create({ ...sample, id: 'b' }),
      taskRepository.create({ ...sample, id: 'c' })
    ])
    const tasks = await taskRepository.findAll()
    expect(tasks).toHaveLength(3)
  })
})
