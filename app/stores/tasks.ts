import { ref, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { createStorageService, STORAGE_KEYS } from '~/services/storage'
import type { Task, CreateTask, UpdateTask, Priority } from '~/types'

interface TaskFilters {
  projectId: string | null
  priority: Priority | null
  search: string
}

export const useTasksStore = defineStore('tasks', () => {
  // Lazy initialization du storage
  let storage: ReturnType<typeof createStorageService<Task>> | null = null
  const getStorage = () => {
    if (!storage) {
      storage = createStorageService<Task>(STORAGE_KEYS.TASKS)
    }
    return storage
  }

  // State
  const items = ref<Task[]>([])
  const selected = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TaskFilters>({
    projectId: null,
    priority: null,
    search: ''
  })

  // Getters
  const filteredTasks = computed((): Task[] => {
    return items.value.filter(task => {
      if (filters.value.projectId && task.projectId !== filters.value.projectId) {
        return false
      }
      if (filters.value.priority && task.priority !== filters.value.priority) {
        return false
      }
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        const labelMatch = task.label.toLowerCase().includes(searchLower)
        const descMatch = task.description?.toLowerCase().includes(searchLower) || false
        if (!labelMatch && !descMatch) {
          return false
        }
      }
      return true
    })
  })

  const pendingTasks = computed((): Task[] => {
    return filteredTasks.value.filter(task => !task.completedAt)
  })

  const completedTasks = computed((): Task[] => {
    return filteredTasks.value.filter(task => !!task.completedAt)
  })

  const sortedByDueDate = computed((): Task[] => {
    // Pending tasks sorted by due date (tasks without date at end), then completed tasks
    const pending = [...pendingTasks.value].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    const completed = [...completedTasks.value].sort((a, b) =>
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    return [...pending, ...completed]
  })

  const getById = computed(() => (id: string): Task | undefined => {
    return items.value.find(t => t.id === id)
  })

  const getByProjectId = computed(() => (projectId: string): Task[] => {
    return items.value.filter(t => t.projectId === projectId)
  })

  const taskCountByProject = computed(() => (projectId: string): number => {
    return items.value.filter(t => t.projectId === projectId).length
  })

  // Actions
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await getStorage().getAll()
    } catch (e) {
      error.value = 'Erreur lors du chargement des tâches'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateTask): Promise<Task> {
    const task = await getStorage().create(data)
    items.value.push(task)
    return task
  }

  async function update(id: string, data: UpdateTask): Promise<Task> {
    const updated = await getStorage().update(id, data)
    const index = items.value.findIndex(t => t.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }
    return updated
  }

  async function remove(id: string): Promise<void> {
    await getStorage().delete(id)
    items.value = items.value.filter(t => t.id !== id)
  }

  async function complete(id: string): Promise<Task> {
    const completedAt = new Date().toISOString()
    const updated = await getStorage().update(id, { completedAt })
    const index = items.value.findIndex(t => t.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }
    return updated
  }

  async function uncomplete(id: string): Promise<Task> {
    const updated = await getStorage().update(id, { completedAt: null })
    const index = items.value.findIndex(t => t.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }
    return updated
  }

  async function removeByProjectId(projectId: string): Promise<void> {
    await getStorage().deleteByField('projectId', projectId)
    items.value = items.value.filter(t => t.projectId !== projectId)
  }

  function selectTask(task: Task | null) {
    selected.value = task
  }

  function setFilters(newFilters: Partial<TaskFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      projectId: null,
      priority: null,
      search: ''
    }
  }

  async function clear(): Promise<void> {
    await getStorage().clear()
    items.value = []
  }

  async function setAll(tasks: Task[]): Promise<void> {
    await getStorage().setAll(tasks)
    items.value = tasks
  }

  function $reset() {
    items.value = []
    selected.value = null
    loading.value = false
    error.value = null
    filters.value = {
      projectId: null,
      priority: null,
      search: ''
    }
  }

  return {
    // State
    items,
    selected,
    loading,
    error,
    filters,
    // Getters
    filteredTasks,
    pendingTasks,
    completedTasks,
    sortedByDueDate,
    getById,
    getByProjectId,
    taskCountByProject,
    // Actions
    fetchAll,
    create,
    update,
    remove,
    complete,
    uncomplete,
    removeByProjectId,
    selectTask,
    setFilters,
    resetFilters,
    clear,
    setAll,
    $reset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}
