import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { Task } from '~/types/task'

const currentDir = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = resolve(currentDir, '../../data/tasks.json')

let writeQueue: Promise<unknown> = Promise.resolve()

async function readTasksFromDisk(): Promise<Task[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw createError({ statusCode: 500, statusMessage: 'Unable to read tasks data file.' })
  }
}

async function writeTasksToDisk(tasks: Task[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation)
  writeQueue = result.catch(() => undefined)
  return result
}

export const taskRepository = {
  async findAll(): Promise<Task[]> {
    return readTasksFromDisk()
  },

  async findById(id: string): Promise<Task | undefined> {
    const tasks = await readTasksFromDisk()
    return tasks.find((task) => task.id === id)
  },

  async create(task: Task): Promise<Task> {
    return queued(async () => {
      const tasks = await readTasksFromDisk()
      tasks.unshift(task)
      await writeTasksToDisk(tasks)
      return task
    })
  },

  async update(id: string, patch: Partial<Task>): Promise<Task | undefined> {
    return queued(async () => {
      const tasks = await readTasksFromDisk()
      const index = tasks.findIndex((task) => task.id === id)
      if (index === -1) return undefined
      const updated: Task = {
        ...tasks[index],
        ...patch,
        id: tasks[index].id,
        createdAt: tasks[index].createdAt,
        updatedAt: new Date().toISOString()
      }
      tasks[index] = updated
      await writeTasksToDisk(tasks)
      return updated
    })
  },

  async remove(id: string): Promise<boolean> {
    return queued(async () => {
      const tasks = await readTasksFromDisk()
      const next = tasks.filter((task) => task.id !== id)
      if (next.length === tasks.length) return false
      await writeTasksToDisk(next)
      return true
    })
  }
}
