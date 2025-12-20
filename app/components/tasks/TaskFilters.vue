<script setup lang="ts">
import type { Priority } from '~/types'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const priorityOptions = [
  { label: 'Toutes les priorités', value: null },
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' }
]

const projectOptions = computed(() => {
  return [
    { label: 'Tous les projets', value: null },
    ...projectsStore.items.map(p => ({
      label: p.name,
      value: p.id
    }))
  ]
})

const selectedProjectId = computed({
  get: () => tasksStore.filters.projectId,
  set: (value: string | null) => tasksStore.setFilters({ projectId: value })
})

const selectedPriority = computed({
  get: () => tasksStore.filters.priority,
  set: (value: Priority | null) => tasksStore.setFilters({ priority: value })
})

const searchQuery = computed({
  get: () => tasksStore.filters.search,
  set: (value: string) => tasksStore.setFilters({ search: value })
})

const hasActiveFilters = computed(() => {
  return tasksStore.filters.projectId !== null ||
    tasksStore.filters.priority !== null ||
    tasksStore.filters.search !== ''
})

const resetFilters = () => {
  tasksStore.resetFilters()
}

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4">
    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher..."
      class="flex-1"
    />

    <USelectMenu
      v-model="selectedProjectId"
      :options="projectOptions"
      value-attribute="value"
      option-attribute="label"
      placeholder="Projet"
      class="w-full sm:w-48"
    />

    <USelectMenu
      v-model="selectedPriority"
      :options="priorityOptions"
      value-attribute="value"
      option-attribute="label"
      placeholder="Priorité"
      class="w-full sm:w-40"
    />

    <UButton
      v-if="hasActiveFilters"
      color="gray"
      variant="ghost"
      icon="i-heroicons-x-mark"
      label="Réinitialiser"
      @click="resetFilters"
    />
  </div>
</template>
