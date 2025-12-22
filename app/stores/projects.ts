import { defineStore } from 'pinia'
import { createStorageService, STORAGE_KEYS } from '~/services/storage'
import { useTasksStore } from '~/stores/tasks'
import type { Project, CreateProject, UpdateProject } from '~/types'

const storage = createStorageService<Project>(STORAGE_KEYS.PROJECTS)

interface ProjectsState {
  items: Project[]
  selected: Project | null
  loading: boolean
  error: string | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    items: [],
    selected: null,
    loading: false,
    error: null
  }),

  getters: {
    getById: (state) => (id: string): Project | undefined => {
      return state.items.find(p => p.id === id)
    },
    sortedByDate: (state): Project[] => {
      return [...state.items].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
    defaultProject: (state): Project | undefined => {
      return state.items.find(p => p.isDefault)
    },
    defaultProjectId: (state): string | undefined => {
      return state.items.find(p => p.isDefault)?.id
    }
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await storage.getAll()
      } catch (e) {
        this.error = 'Erreur lors du chargement des projets'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateProject): Promise<Project> {
      const project = await storage.create(data)
      this.items.push(project)
      return project
    },

    async update(id: string, data: UpdateProject): Promise<Project> {
      const updated = await storage.update(id, data)
      const index = this.items.findIndex(p => p.id === id)
      if (index !== -1) {
        this.items[index] = updated
      }
      return updated
    },

    async remove(id: string): Promise<void> {
      // Suppression cascade des tâches associées
      const tasksStore = useTasksStore()
      await tasksStore.removeByProjectId(id)
      
      await storage.delete(id)
      this.items = this.items.filter(p => p.id !== id)
    },

    selectProject(project: Project | null) {
      this.selected = project
    },

    async clear(): Promise<void> {
      await storage.clear()
      this.items = []
    },

    async setAll(projects: Project[]): Promise<void> {
      await storage.setAll(projects)
      this.items = projects
    },

    async setAsDefault(id: string): Promise<void> {
      // Remove default from current default project
      const currentDefault = this.items.find(p => p.isDefault)
      if (currentDefault && currentDefault.id !== id) {
        await this.update(currentDefault.id, { isDefault: false })
      }
      // Set new project as default
      await this.update(id, { isDefault: true })
    },

    async removeDefault(id: string): Promise<void> {
      await this.update(id, { isDefault: false })
    }
  }
})
