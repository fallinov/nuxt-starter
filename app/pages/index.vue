<script setup lang="ts">
import type { Task, CreateTask, UpdateTask } from '~/types'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toast = useToast()
const { confirm } = useConfirm()

const isLoading = ref(true)
const isDemoLoading = ref(false)

// Modal state
const isModalOpen = ref(false)
const modalMode = ref<'view' | 'create'>('view')
const selectedTask = ref<Task | null>(null)

// Date sheet state for swipe reschedule
const isDateSheetOpen = ref(false)
const taskToReschedule = ref<Task | null>(null)

// Helper to check if date is today
const isToday = (dueDate: string | null): boolean => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(dueDate)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate.getTime() === today.getTime()
}

// Helper to check if date is overdue (before today)
const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(dueDate)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

// Filter only pending tasks (not completed)
const pendingTasks = computed(() => {
  return tasksStore.items.filter(t => !t.completedAt)
})

const stats = computed(() => ({
  projects: projectsStore.items.length,
  tasks: pendingTasks.value.length,
  highPriority: pendingTasks.value.filter(t => t.priority === 'high').length,
  overdue: pendingTasks.value.filter(t => isOverdue(t.dueDate)).length
}))

// Tasks grouped by status
const overdueTasks = computed(() => {
  return pendingTasks.value
    .filter(t => isOverdue(t.dueDate))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
})

const todayTasks = computed(() => {
  return pendingTasks.value
    .filter(t => isToday(t.dueDate))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})

const noDateTasks = computed(() => {
  return pendingTasks.value
    .filter(t => !t.dueDate)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})

const getProjectName = (projectId: string): string => {
  const project = projectsStore.getById(projectId)
  return project?.name || ''
}

// Modal handlers
const openCreateModal = () => {
  selectedTask.value = null
  modalMode.value = 'create'
  isModalOpen.value = true
}

const openDetailModal = (task: Task) => {
  selectedTask.value = task
  modalMode.value = 'view'
  isModalOpen.value = true
}

const closeModal = () => {
  selectedTask.value = null
  isModalOpen.value = false
}

const handleCreate = async (data: CreateTask) => {
  try {
    await tasksStore.create(data)
    toast.add({ title: 'Tâche créée', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de créer la tâche.', color: 'error' })
  }
}

const handleUpdate = async (id: string, data: UpdateTask) => {
  try {
    await tasksStore.update(id, data)
    if (selectedTask.value?.id === id) {
      selectedTask.value = tasksStore.getById(id) || null
    }
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier la tâche.', color: 'error' })
  }
}

// Task handlers
const handleTaskClick = (task: Task) => {
  openDetailModal(task)
}

const handleComplete = async (task: Task) => {
  try {
    await tasksStore.complete(task.id)
    toast.add({
      title: 'Tâche terminée',
      icon: 'i-lucide-check-circle',
      color: 'success',
      duration: 5000,
      actions: [{
        label: 'Annuler',
        color: 'neutral' as const,
        variant: 'outline' as const,
        onClick: async () => {
          try {
            await tasksStore.uncomplete(task.id)
          } catch (e) {
            toast.add({ title: 'Erreur', description: 'Impossible de restaurer la tâche.', color: 'error' })
          }
        }
      }]
    })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de terminer la tâche.', color: 'error' })
  }
}

const handleDelete = async (task: Task) => {
  const confirmed = await confirm({
    title: 'Supprimer la tâche',
    message: `Êtes-vous sûr de vouloir supprimer "${task.label}" ?`,
    confirmLabel: 'Supprimer',
    confirmColor: 'error'
  })

  if (confirmed) {
    try {
      await tasksStore.remove(task.id)
      closeModal()
      toast.add({ title: 'Tâche supprimée', color: 'success' })
    } catch (e) {
      toast.add({ title: 'Erreur', description: 'Impossible de supprimer la tâche.', color: 'error' })
    }
  }
}

const handleReschedule = (task: Task) => {
  taskToReschedule.value = task
  isDateSheetOpen.value = true
}

const handleDateSelect = async (newDate: string) => {
  if (!taskToReschedule.value) return

  try {
    const dueDate = newDate ? new Date(newDate).toISOString() : null
    await tasksStore.update(taskToReschedule.value.id, { dueDate })
    toast.add({ title: dueDate ? 'Date modifiée' : 'Date supprimée', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier la date.', color: 'error' })
  } finally {
    taskToReschedule.value = null
  }
}

const loadDemoData = async () => {
  isDemoLoading.value = true
  try {
    const { seedData } = await import('../../seeds/demo')
    
    await projectsStore.setAll(seedData.projects)
    await tasksStore.setAll(seedData.tasks)
    
    toast.add({ title: 'Données chargées', description: 'Les données de démonstration ont été chargées.', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de charger les données de démonstration.', color: 'error' })
    console.error(e)
  } finally {
    isDemoLoading.value = false
  }
}

const clearAllData = async () => {
  try {
    await projectsStore.clear()
    await tasksStore.clear()
    toast.add({ title: 'Données supprimées', description: 'Toutes les données ont été supprimées.', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de supprimer les données.', color: 'error' })
    console.error(e)
  }
}

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchAll(),
    tasksStore.fetchAll()
  ])
  isLoading.value = false
})
</script>

<template>
  <ClientOnly>
    <div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <div class="flex gap-2">
          <UButton
            v-if="stats.projects === 0 && stats.tasks === 0"
            color="primary"
            variant="soft"
            icon="i-lucide-download"
            label="Charger données démo"
            :loading="isDemoLoading"
            @click="loadDemoData"
          />
          <UButton
            v-else
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            label="Réinitialiser"
            @click="clearAllData"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>

      <template v-else>
      <!-- Stats cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <NuxtLink to="/projects">
          <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <UIcon name="i-lucide-folder" class="size-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stats.projects }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Projets</p>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <NuxtLink to="/tasks">
          <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <UIcon name="i-lucide-clipboard-list" class="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stats.tasks }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Tâches</p>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <NuxtLink to="/tasks?priority=high">
          <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <UIcon name="i-lucide-triangle-alert" class="size-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stats.highPriority }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Haute priorité</p>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <a href="#overdue" class="scroll-smooth">
          <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <UIcon name="i-lucide-clock" class="size-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stats.overdue }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">En retard</p>
              </div>
            </div>
          </UCard>
        </a>
      </div>

      <!-- Overdue tasks section -->
      <div v-if="overdueTasks.length > 0" id="overdue" class="mb-6">
        <h2 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-alert-circle" class="size-5" />
          En retard
        </h2>
        <div class="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden -mx-2 sm:mx-0">
          <TasksTaskItem
            v-for="task in overdueTasks"
            :key="task.id"
            :task="task"
            :project-name="getProjectName(task.projectId)"
            hide-actions
            @click="handleTaskClick"
            @complete="handleComplete"
            @delete="handleDelete"
            @reschedule="handleReschedule"
          />
        </div>
      </div>

      <!-- Today's tasks section -->
      <div v-if="todayTasks.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-calendar" class="size-5 text-green-600" />
          Aujourd'hui
        </h2>
        <div class="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden -mx-2 sm:mx-0">
          <TasksTaskItem
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
            :project-name="getProjectName(task.projectId)"
            hide-actions
            @click="handleTaskClick"
            @complete="handleComplete"
            @delete="handleDelete"
            @reschedule="handleReschedule"
          />
        </div>
      </div>

      <!-- No date tasks section -->
      <div v-if="noDateTasks.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-inbox" class="size-5" />
          Pas de date
        </h2>
        <div class="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden -mx-2 sm:mx-0">
          <TasksTaskItem
            v-for="task in noDateTasks"
            :key="task.id"
            :task="task"
            :project-name="getProjectName(task.projectId)"
            hide-actions
            @click="handleTaskClick"
            @complete="handleComplete"
            @delete="handleDelete"
            @reschedule="handleReschedule"
          />
        </div>
      </div>

      <!-- Empty state when no tasks -->
      <div v-if="overdueTasks.length === 0 && todayTasks.length === 0 && pendingTasks.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-check-circle" class="size-12 text-green-500 mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">Tout est à jour !</p>
        <p class="text-gray-500 mt-1">Aucune tâche en retard ou pour aujourd'hui.</p>
        <UButton
          to="/tasks"
          class="mt-4"
          variant="soft"
          label="Voir toutes les tâches"
        />
      </div>

      <!-- Projects section -->
      <div v-if="projectsStore.items.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Projets</h2>
          <UButton
            to="/projects"
            variant="ghost"
            color="neutral"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
            label="Voir tout"
          />
        </div>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <NuxtLink
            v-for="project in projectsStore.sortedByDate.slice(0, 6)"
            :key="project.id"
            :to="`/tasks?projectId=${project.id}`"
          >
            <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-hash" class="size-4 text-primary" />
                  <span class="font-medium truncate">{{ project.name }}</span>
                </div>
                <UBadge variant="subtle" size="xs">
                  {{ tasksStore.taskCountByProject(project.id) }}
                </UBadge>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Floating Action Button -->
    <button
      v-if="projectsStore.items.length > 0"
      class="fixed bottom-6 right-6 size-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      aria-label="Ajouter une tâche"
      @click="openCreateModal"
    >
      <UIcon name="i-lucide-plus" class="size-7" />
    </button>

    <!-- Task detail modal -->
    <TasksTaskDetailModal
      v-model:open="isModalOpen"
      :task="selectedTask"
      :mode="modalMode"
      @create="handleCreate"
      @update="handleUpdate"
      @delete="handleDelete"
      @complete="handleComplete"
    />

    <!-- Date sheet for swipe reschedule -->
    <TasksTaskDateSheet
      v-model:open="isDateSheetOpen"
      :current-date="taskToReschedule?.dueDate || ''"
      @select="handleDateSelect"
    />
    </div>

    <template #fallback>
      <div class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>
    </template>
  </ClientOnly>
</template>
