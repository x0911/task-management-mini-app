import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { kv } from '@vercel/kv'
import type { Task } from '~/types/task'

const currentDir = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = resolve(currentDir, '../../data/tasks.json')
const KV_KEY = 'tasks'

const useKv = Boolean(process.env.KV_REST_API_URL)

let writeQueue: Promise<unknown> = Promise.resolve()

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation)
  writeQueue = result.catch(() => undefined)
  return result
}

async function readTasksFromFile(): Promise<Task[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw createError({ statusCode: 500, statusMessage: 'Unable to read tasks data file.' })
  }
}

async function writeTasksToFile(tasks: Task[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

async function readTasksFromKv(): Promise<Task[]> {
  const existing = await kv.get<Task[]>(KV_KEY)
  if (existing) return existing

  const seed = await readTasksFromFile()
  await kv.set(KV_KEY, seed)
  return seed
}

async function readTasks(): Promise<Task[]> {
  return useKv ? readTasksFromKv() : readTasksFromFile()
}

async function writeTasks(tasks: Task[]): Promise<void> {
  if (useKv) {
    await kv.set(KV_KEY, tasks)
    return
  }
  await writeTasksToFile(tasks)
}

export const taskRepository = {
  async findAll(): Promise<Task[]> {
    return readTasks()
  },

  async findById(id: string): Promise<Task | undefined> {
    const tasks = await readTasks()
    return tasks.find((task) => task.id === id)
  },

  async create(task: Task): Promise<Task> {
    return queued(async () => {
      const tasks = await readTasks()
      tasks.unshift(task)
      await writeTasks(tasks)
      return task
    })
  },

  async update(id: string, patch: Partial<Task>): Promise<Task | undefined> {
    return queued(async () => {
      const tasks = await readTasks()
      const index = tasks.findIndex((task) => task.id === id)
      const existing = tasks[index]
      if (!existing) return undefined

      const updated: Task = {
        id: existing.id,
        title: patch.title ?? existing.title,
        description: patch.description ?? existing.description,
        status: patch.status ?? existing.status,
        dueDate: patch.dueDate ?? existing.dueDate,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      }
      tasks[index] = updated
      await writeTasks(tasks)
      return updated
    })
  },

  async remove(id: string): Promise<boolean> {
    return queued(async () => {
      const tasks = await readTasks()
      const next = tasks.filter((task) => task.id !== id)
      if (next.length === tasks.length) return false
      await writeTasks(next)
      return true
    })
  }
}
