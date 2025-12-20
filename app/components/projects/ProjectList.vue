<script setup lang="ts">
import type { Project } from '~/types'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { confirm } = useConfirm()
const { success, error } = useNotification()

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleCreate = async (data: { name: string }) => {
  try {
    await projectsStore.create(data)
    success('Projet créé', `Le projet "${data.name}" a été créé avec succès.`)
    closeModal()
  } catch (e) {
    error('Erreur', 'Impossible de créer le projet.')
    console.error(e)
  }
}

const handleDelete = async (project: Project) => {
  const taskCount = tasksStore.taskCountByProject(project.id)
  const confirmed = await confirm({
    title: 'Supprimer le projet',
    message: taskCount > 0
      ? `Êtes-vous sûr de vouloir supprimer "${project.name}" et ses ${taskCount} tâche(s) associée(s) ?`
      : `Êtes-vous sûr de vouloir supprimer "${project.name}" ?`,
    confirmLabel: 'Supprimer',
    confirmColor: 'red'
  })

  if (confirmed) {
    try {
      await projectsStore.remove(project.id)
      success('Projet supprimé', `Le projet "${project.name}" a été supprimé.`)
    } catch (e) {
      error('Erreur', 'Impossible de supprimer le projet.')
      console.error(e)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchAll(),
    tasksStore.fetchAll()
  ])
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Projets</h1>
      <UButton
        label="Nouveau projet"
        icon="i-heroicons-plus"
        @click="openModal"
      />
    </div>

    <div v-if="projectsStore.loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <UAlert
      v-else-if="projectsStore.error"
      color="red"
      icon="i-heroicons-exclamation-circle"
      :title="projectsStore.error"
    />

    <EmptyState
      v-else-if="projectsStore.items.length === 0"
      title="Aucun projet"
      description="Créez votre premier projet pour commencer à organiser vos tâches."
      action-label="Créer un projet"
      icon="i-heroicons-folder"
      @action="openModal"
    />

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard
        v-for="project in projectsStore.sortedByDate"
        :key="project.id"
        :project="project"
        :task-count="tasksStore.taskCountByProject(project.id)"
        @delete="handleDelete"
      />
    </div>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Nouveau projet</h2>
        </template>
        <ProjectForm
          submit-label="Créer"
          @submit="handleCreate"
          @cancel="closeModal"
        />
      </UCard>
    </UModal>
  </div>
</template>
