<script setup lang="ts">
import type { Task, CreateTask, UpdateTask } from '~/types'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const { confirm } = useConfirm()
const toast = useToast()
const route = useRoute()

const isModalOpen = ref(false)
const modalMode = ref<'view' | 'create'>('view')
const selectedTask = ref<Task | null>(null)

// Date sheet state for swipe reschedule
const isDateSheetOpen = ref(false)
const taskToReschedule = ref<Task | null>(null)

const getProjectName = (projectId: string): string => {
  const project = projectsStore.getById(projectId)
  return project?.name || 'Projet inconnu'
}

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
    toast.add({ title: 'Tâche créée', description: 'La tâche a été créée avec succès.', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de créer la tâche.', color: 'error' })
    console.error(e)
  }
}

const handleUpdate = async (id: string, data: UpdateTask) => {
  try {
    await tasksStore.update(id, data)
    // Update selectedTask to reflect changes
    if (selectedTask.value && selectedTask.value.id === id) {
      selectedTask.value = tasksStore.getById(id) || null
    }
    toast.add({ title: 'Tâche modifiée', description: 'La tâche a été modifiée avec succès.', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier la tâche.', color: 'error' })
    console.error(e)
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
      toast.add({ title: 'Tâche supprimée', description: 'La tâche a été supprimée.', color: 'success' })
    } catch (e) {
      toast.add({ title: 'Erreur', description: 'Impossible de supprimer la tâche.', color: 'error' })
      console.error(e)
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
    // Convert date string to ISO datetime, or null if no date
    const dueDate = newDate ? new Date(newDate).toISOString() : null
    await tasksStore.update(taskToReschedule.value.id, { dueDate })
    toast.add({ title: dueDate ? 'Date modifiée' : 'Date supprimée', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier la date.', color: 'error' })
    console.error(e)
  } finally {
    taskToReschedule.value = null
  }
}

const handleComplete = async (task: Task) => {
  // If task is already completed, uncomplete it
  if (task.completedAt) {
    try {
      await tasksStore.uncomplete(task.id)
    } catch (e) {
      toast.add({ title: 'Erreur', description: 'Impossible de réactiver la tâche.', color: 'error' })
      console.error(e)
    }
    return
  }

  try {
    await tasksStore.complete(task.id)
    closeModal()

    // Show toast with undo action
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
            console.error(e)
          }
        }
      }]
    })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de terminer la tâche.', color: 'error' })
    console.error(e)
  }
}

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchAll(),
    projectsStore.fetchAll()
  ])

  // Appliquer les filtres depuis l'URL si présents
  const projectId = route.query.projectId as string | undefined
  const priority = route.query.priority as 'high' | 'medium' | 'low' | undefined

  if (projectId || priority) {
    tasksStore.setFilters({
      ...(projectId && { projectId }),
      ...(priority && { priority })
    })
  }
})
</script>

<template>
  <div class="relative min-h-[calc(100vh-200px)]">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Tâches</h1>
    </div>

    <TasksTaskFilters class="mb-4 sm:mb-6" />

    <div v-if="tasksStore.loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
    </div>

    <UAlert
      v-else-if="tasksStore.error"
      color="error"
      icon="i-lucide-circle-x"
      :title="tasksStore.error"
    />

    <UAlert
      v-else-if="projectsStore.items.length === 0"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Aucun projet disponible"
      description="Créez d'abord un projet avant d'ajouter des tâches."
    >
      <template #actions>
        <UButton
          to="/projects"
          label="Créer un projet"
          size="sm"
        />
      </template>
    </UAlert>

    <template v-else>
      <!-- Task list -->
      <div class="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden -mx-2 sm:mx-0">
        <template v-if="tasksStore.sortedByDueDate.length > 0">
          <TasksTaskItem
            v-for="task in tasksStore.sortedByDueDate"
            :key="task.id"
            :task="task"
            :project-name="getProjectName(task.projectId)"
            @click="openDetailModal"
            @complete="handleComplete"
            @delete="handleDelete"
            @reschedule="handleReschedule"
          />
        </template>

        <UiEmptyState
          v-else
          :title="tasksStore.items.length === 0 ? 'Aucune tâche' : 'Aucun résultat'"
          :description="tasksStore.items.length === 0
            ? 'Cliquez sur + pour ajouter votre première tâche.'
            : 'Aucune tâche ne correspond à vos filtres.'"
          icon="i-lucide-clipboard-list"
          class="py-12"
        />
      </div>

      <!-- Floating Action Button -->
      <button
        class="fixed bottom-6 right-6 size-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        aria-label="Ajouter une tâche"
        @click="openCreateModal"
      >
        <UIcon name="i-lucide-plus" class="size-7" />
      </button>
    </template>

    <!-- Unified Modal for Create/View/Edit -->
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
</template>
