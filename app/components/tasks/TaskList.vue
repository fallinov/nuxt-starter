<script setup lang="ts">
import type { Task, CreateTask, UpdateTask } from '~/types'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const { confirm } = useConfirm()
const toast = useToast()
const route = useRoute()

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

const getProjectName = (projectId: string): string => {
  const project = projectsStore.getById(projectId)
  return project?.name || 'Projet inconnu'
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const openEditModal = (task: Task) => {
  selectedTask.value = task
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  selectedTask.value = null
  isEditModalOpen.value = false
}

const handleCreate = async (data: CreateTask) => {
  try {
    await tasksStore.create(data)
    toast.add({ title: 'Tâche créée', description: 'La tâche a été créée avec succès.', color: 'success' })
    closeCreateModal()
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de créer la tâche.', color: 'error' })
    console.error(e)
  }
}

const handleUpdate = async (data: UpdateTask) => {
  if (!selectedTask.value) return
  
  try {
    await tasksStore.update(selectedTask.value.id, data)
    toast.add({ title: 'Tâche modifiée', description: 'La tâche a été modifiée avec succès.', color: 'success' })
    closeEditModal()
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
      toast.add({ title: 'Tâche supprimée', description: 'La tâche a été supprimée.', color: 'success' })
    } catch (e) {
      toast.add({ title: 'Erreur', description: 'Impossible de supprimer la tâche.', color: 'error' })
      console.error(e)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchAll(),
    projectsStore.fetchAll()
  ])
  
  // Appliquer le filtre de projet depuis l'URL si présent
  const projectId = route.query.projectId as string | undefined
  if (projectId) {
    tasksStore.setFilters({ projectId })
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Tâches</h1>
      <UButton
        label="Nouvelle tâche"
        icon="i-heroicons-plus"
        :disabled="projectsStore.items.length === 0"
        @click="openCreateModal"
      />
    </div>

    <TaskFilters class="mb-6" />

    <div v-if="tasksStore.loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <UAlert
      v-else-if="tasksStore.error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="tasksStore.error"
    />

    <UAlert
      v-else-if="projectsStore.items.length === 0"
      color="warning"
      icon="i-heroicons-exclamation-triangle"
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

    <EmptyState
      v-else-if="tasksStore.sortedByDueDate.length === 0"
      :title="tasksStore.items.length === 0 ? 'Aucune tâche' : 'Aucun résultat'"
      :description="tasksStore.items.length === 0 
        ? 'Créez votre première tâche pour commencer.'
        : 'Aucune tâche ne correspond à vos filtres.'"
      :action-label="tasksStore.items.length === 0 ? 'Créer une tâche' : undefined"
      icon="i-heroicons-clipboard-document-list"
      @action="openCreateModal"
    />

    <div v-else class="grid gap-4">
      <TaskCard
        v-for="task in tasksStore.sortedByDueDate"
        :key="task.id"
        :task="task"
        :project-name="getProjectName(task.projectId)"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <!-- Modal de création -->
    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Nouvelle tâche</h2>
        </template>
        <TaskForm
          submit-label="Créer"
          @submit="handleCreate"
          @cancel="closeCreateModal"
        />
      </UCard>
    </UModal>

    <!-- Modal d'édition -->
    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Modifier la tâche</h2>
        </template>
        <TaskForm
          v-if="selectedTask"
          :initial-data="selectedTask"
          submit-label="Enregistrer"
          @submit="handleUpdate"
          @cancel="closeEditModal"
        />
      </UCard>
    </UModal>
  </div>
</template>
