import { defineStore } from 'pinia'
import { createStorageService, STORAGE_KEYS } from '~/services/storage'
import type { Task, CreateTask, UpdateTask, Priority } from '~/types'

const storage = createStorageService<Task>(STORAGE_KEYS.TASKS)

interface TaskFilters {
  projectId: string | null
  priority: Priority | null
  search: string
}

interface TasksState {
  items: Task[]
  selected: Task | null
  loading: boolean
  error: string | null
  filters: TaskFilters
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    items: [],
    selected: null,
    loading: false,
    error: null,
    filters: {
      projectId: null,
      priority: null,
      search: ''
    }
  }),

  getters: {
    filteredTasks: (state): Task[] => {
      return state.items.filter(task => {
        if (state.filters.projectId && task.projectId !== state.filters.projectId) {
          return false
        }
        if (state.filters.priority && task.priority !== state.filters.priority) {
          return false
        }
        if (state.filters.search) {
          const searchLower = state.filters.search.toLowerCase()
          const labelMatch = task.label.toLowerCase().includes(searchLower)
          const descMatch = task.description?.toLowerCase().includes(searchLower) || false
          if (!labelMatch && !descMatch) {
            return false
          }
        }
        return true
      })
    },

    pendingTasks(): Task[] {
      return this.filteredTasks.filter(task => !task.completedAt)
    },

    completedTasks(): Task[] {
      return this.filteredTasks.filter(task => !!task.completedAt)
    },

    sortedByDueDate(): Task[] {
      // Pending tasks sorted by due date (tasks without date at end), then completed tasks sorted by completion date
      const pending = [...this.pendingTasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
      const completed = [...this.completedTasks].sort((a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )
      return [...pending, ...completed]
    },

    getById: (state) => (id: string): Task | undefined => {
      return state.items.find(t => t.id === id)
    },

    getByProjectId: (state) => (projectId: string): Task[] => {
      return state.items.filter(t => t.projectId === projectId)
    },

    taskCountByProject: (state) => (projectId: string): number => {
      return state.items.filter(t => t.projectId === projectId).length
    }
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await storage.getAll()
      } catch (e) {
        this.error = 'Erreur lors du chargement des tâches'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateTask): Promise<Task> {
      const task = await storage.create(data)
      this.items.push(task)
      return task
    },

    async update(id: string, data: UpdateTask): Promise<Task> {
      const updated = await storage.update(id, data)
      const index = this.items.findIndex(t => t.id === id)
      if (index !== -1) {
        this.items[index] = updated
      }
      return updated
    },

    async remove(id: string): Promise<void> {
      await storage.delete(id)
      this.items = this.items.filter(t => t.id !== id)
    },

    async complete(id: string): Promise<Task> {
      const completedAt = new Date().toISOString()
      const updated = await storage.update(id, { completedAt })
      const index = this.items.findIndex(t => t.id === id)
      if (index !== -1) {
        this.items[index] = updated
      }
      return updated
    },

    async uncomplete(id: string): Promise<Task> {
      const updated = await storage.update(id, { completedAt: null })
      const index = this.items.findIndex(t => t.id === id)
      if (index !== -1) {
        this.items[index] = updated
      }
      return updated
    },

    async removeByProjectId(projectId: string): Promise<void> {
      await storage.deleteByField('projectId', projectId)
      this.items = this.items.filter(t => t.projectId !== projectId)
    },

    selectTask(task: Task | null) {
      this.selected = task
    },

    setFilters(filters: Partial<TaskFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        projectId: null,
        priority: null,
        search: ''
      }
    },

    async clear(): Promise<void> {
      await storage.clear()
      this.items = []
    },

    async setAll(tasks: Task[]): Promise<void> {
      await storage.setAll(tasks)
      this.items = tasks
    }
  }
})
