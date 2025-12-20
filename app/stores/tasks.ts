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
          if (!task.label.toLowerCase().includes(searchLower)) {
            return false
          }
        }
        return true
      })
    },

    sortedByDueDate(): Task[] {
      return [...this.filteredTasks].sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
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
