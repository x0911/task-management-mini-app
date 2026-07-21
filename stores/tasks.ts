import { defineStore } from 'pinia'
import type { Task, TaskInput, TaskStatus } from '~/types/task'

interface TasksState {
  tasks: Task[]
  loading: boolean
  mutating: boolean
  error: string | null
  loaded: boolean
  statusFilter: TaskStatus | 'all'
  searchTerm: string
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
    loading: false,
    mutating: false,
    error: null,
    loaded: false,
    statusFilter: 'all',
    searchTerm: ''
  }),

  getters: {
    filteredTasks(state): Task[] {
      const term = state.searchTerm.trim().toLowerCase()
      return state.tasks.filter((task) => {
        const matchesStatus = state.statusFilter === 'all' || task.status === state.statusFilter
        const matchesSearch = !term || task.title.toLowerCase().includes(term)
        return matchesStatus && matchesSearch
      })
    },

    taskCounts(state): Record<TaskStatus | 'all', number> {
      return {
        all: state.tasks.length,
        pending: state.tasks.filter((t) => t.status === 'pending').length,
        'in-progress': state.tasks.filter((t) => t.status === 'in-progress').length,
        done: state.tasks.filter((t) => t.status === 'done').length
      }
    },

    getById(state) {
      return (id: string) => state.tasks.find((task) => task.id === id)
    }
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Task[]>('/api/tasks')
        this.tasks = data
        this.loaded = true
      } catch (err) {
        this.error = extractErrorMessage(err, 'Failed to load tasks.')
      } finally {
        this.loading = false
      }
    },

    async createTask(input: TaskInput) {
      this.mutating = true
      this.error = null
      try {
        const created = await $fetch<Task>('/api/tasks', { method: 'POST', body: input })
        this.tasks.unshift(created)
        return created
      } catch (err) {
        this.error = extractErrorMessage(err, 'Failed to create task.')
        throw err
      } finally {
        this.mutating = false
      }
    },

    async updateTask(id: string, patch: Partial<TaskInput>) {
      this.mutating = true
      this.error = null
      try {
        const updated = await $fetch<Task>(`/api/tasks/${id}`, { method: 'PUT', body: patch })
        const index = this.tasks.findIndex((task) => task.id === id)
        if (index !== -1) this.tasks[index] = updated
        return updated
      } catch (err) {
        this.error = extractErrorMessage(err, 'Failed to update task.')
        throw err
      } finally {
        this.mutating = false
      }
    },

    async deleteTask(id: string) {
      this.mutating = true
      this.error = null
      try {
        await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        this.tasks = this.tasks.filter((task) => task.id !== id)
      } catch (err) {
        this.error = extractErrorMessage(err, 'Failed to delete task.')
        throw err
      } finally {
        this.mutating = false
      }
    },

    setStatusFilter(status: TaskStatus | 'all') {
      this.statusFilter = status
    },

    setSearchTerm(term: string) {
      this.searchTerm = term
    },

    clearError() {
      this.error = null
    }
  }
})

function extractErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any
  const messages: string[] | undefined = anyErr?.data?.data?.errors
  if (messages?.length) return messages.join(' ')
  return anyErr?.data?.statusMessage || anyErr?.statusMessage || anyErr?.message || fallback
}
