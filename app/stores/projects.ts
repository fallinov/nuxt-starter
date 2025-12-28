import { ref, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { createStorageService, STORAGE_KEYS } from '~/services/storage'
import { useTasksStore } from '~/stores/tasks'
import type { Project, CreateProject, UpdateProject } from '~/types'

export const useProjectsStore = defineStore('projects', () => {
  // Lazy initialization du storage
  let storage: ReturnType<typeof createStorageService<Project>> | null = null
  const getStorage = () => {
    if (!storage) {
      storage = createStorageService<Project>(STORAGE_KEYS.PROJECTS)
    }
    return storage
  }

  // State
  const items = ref<Project[]>([])
  const selected = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getById = computed(() => (id: string): Project | undefined => {
    return items.value.find(p => p.id === id)
  })

  const sortedByDate = computed((): Project[] => {
    return [...items.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const defaultProject = computed((): Project | undefined => {
    return items.value.find(p => p.isDefault)
  })

  const defaultProjectId = computed((): string | undefined => {
    return items.value.find(p => p.isDefault)?.id
  })

  // Actions
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await getStorage().getAll()
    } catch (e) {
      error.value = 'Erreur lors du chargement des projets'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateProject): Promise<Project> {
    const project = await getStorage().create(data)
    items.value.push(project)
    return project
  }

  async function update(id: string, data: UpdateProject): Promise<Project> {
    const updated = await getStorage().update(id, data)
    const index = items.value.findIndex(p => p.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }
    return updated
  }

  async function remove(id: string): Promise<void> {
    // Suppression cascade des tâches associées
    const tasksStore = useTasksStore()
    await tasksStore.removeByProjectId(id)

    await getStorage().delete(id)
    items.value = items.value.filter(p => p.id !== id)
  }

  function selectProject(project: Project | null) {
    selected.value = project
  }

  async function clear(): Promise<void> {
    await getStorage().clear()
    items.value = []
  }

  async function setAll(projects: Project[]): Promise<void> {
    await getStorage().setAll(projects)
    items.value = projects
  }

  async function setAsDefault(id: string): Promise<void> {
    // Remove default from current default project
    const currentDefault = items.value.find(p => p.isDefault)
    if (currentDefault && currentDefault.id !== id) {
      await update(currentDefault.id, { isDefault: false })
    }
    // Set new project as default
    await update(id, { isDefault: true })
  }

  async function removeDefault(id: string): Promise<void> {
    await update(id, { isDefault: false })
  }

  function $reset() {
    items.value = []
    selected.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    items,
    selected,
    loading,
    error,
    // Getters
    getById,
    sortedByDate,
    defaultProject,
    defaultProjectId,
    // Actions
    fetchAll,
    create,
    update,
    remove,
    selectProject,
    clear,
    setAll,
    setAsDefault,
    removeDefault,
    $reset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectsStore, import.meta.hot))
}
