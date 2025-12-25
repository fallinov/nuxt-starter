<script setup lang="ts">
import type { Project } from '~/types'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { confirm } = useConfirm()
const toast = useToast()

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedProject = ref<Project | null>(null)

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const openEditModal = (project: Project) => {
  selectedProject.value = project
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  selectedProject.value = null
  isEditModalOpen.value = false
}

const handleCreate = async (data: { name: string }) => {
  try {
    await projectsStore.create(data)
    toast.add({ title: 'Projet créé', description: `Le projet "${data.name}" a été créé avec succès.`, color: 'success' })
    closeCreateModal()
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de créer le projet.', color: 'error' })
    console.error(e)
  }
}

const handleEdit = async (data: { name: string }) => {
  if (!selectedProject.value) return

  try {
    await projectsStore.update(selectedProject.value.id, data)
    toast.add({ title: 'Projet modifié', description: `Le projet "${data.name}" a été modifié avec succès.`, color: 'success' })
    closeEditModal()
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier le projet.', color: 'error' })
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
    confirmColor: 'error'
  })

  if (confirmed) {
    try {
      await projectsStore.remove(project.id)
      toast.add({ title: 'Projet supprimé', description: `Le projet "${project.name}" a été supprimé.`, color: 'success' })
    } catch (e) {
      toast.add({ title: 'Erreur', description: 'Impossible de supprimer le projet.', color: 'error' })
      console.error(e)
    }
  }
}

const handleSetDefault = async (project: Project) => {
  try {
    if (project.isDefault) {
      await projectsStore.removeDefault(project.id)
      toast.add({ title: 'Projet par défaut retiré', description: `"${project.name}" n'est plus le projet par défaut.`, color: 'success' })
    } else {
      await projectsStore.setAsDefault(project.id)
      toast.add({ title: 'Projet par défaut défini', description: `"${project.name}" est maintenant le projet par défaut.`, color: 'success' })
    }
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier le projet par défaut.', color: 'error' })
    console.error(e)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Projets</h1>
      <UButton
        label="Nouveau projet"
        icon="i-lucide-plus"
        @click="openCreateModal"
      />
    </div>

    <div v-if="projectsStore.loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectsProjectCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <UAlert
      v-else-if="projectsStore.error"
      color="error"
      icon="i-lucide-circle-x"
      :title="projectsStore.error"
    />

    <UiEmptyState
      v-else-if="projectsStore.items.length === 0"
      title="Aucun projet"
      description="Créez votre premier projet pour commencer à organiser vos tâches."
      action-label="Créer un projet"
      icon="i-lucide-folder"
      @action="openCreateModal"
    />

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectsProjectCard
        v-for="project in projectsStore.sortedByDate"
        :key="project.id"
        :project="project"
        :task-count="tasksStore.taskCountByProject(project.id)"
        @edit="openEditModal"
        @delete="handleDelete"
        @set-default="handleSetDefault"
      />
    </div>

    <!-- Modal de création -->
    <UModal v-model:open="isCreateModalOpen" title="Nouveau projet">
      <template #body>
        <ProjectsProjectForm
          submit-label="Créer"
          @submit="handleCreate"
          @cancel="closeCreateModal"
        />
      </template>
    </UModal>

    <!-- Modal d'édition -->
    <UModal v-model:open="isEditModalOpen" title="Modifier le projet">
      <template #body>
        <ProjectsProjectForm
          v-if="selectedProject"
          :initial-data="{ name: selectedProject.name }"
          submit-label="Enregistrer"
          @submit="handleEdit"
          @cancel="closeEditModal"
        />
      </template>
    </UModal>
  </div>
</template>
