<script setup lang="ts">
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toast = useToast()

const isLoading = ref(true)
const isDemoLoading = ref(false)

const stats = computed(() => ({
  projects: projectsStore.items.length,
  tasks: tasksStore.items.length,
  highPriority: tasksStore.items.filter(t => t.priority === 'high').length,
  overdue: tasksStore.items.filter(t => new Date(t.dueDate) < new Date()).length
}))

const recentTasks = computed(() => {
  return [...tasksStore.items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

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
        <UCard>
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

        <UCard>
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

        <UCard>
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

        <UCard>
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
      </div>

      <!-- Quick actions -->
      <div class="grid md:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Tâches récentes</h2>
              <UButton
                to="/tasks"
                variant="ghost"
                color="neutral"
                size="sm"
                trailing-icon="i-lucide-arrow-right"
                label="Voir tout"
              />
            </div>
          </template>

          <div v-if="recentTasks.length === 0" class="text-center py-8 text-gray-500">
            Aucune tâche
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="task in recentTasks"
              :key="task.id"
              class="py-3 first:pt-0 last:pb-0"
            >
              <p class="font-medium truncate">{{ task.label }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(task.dueDate).toLocaleDateString('fr-FR') }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
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
          </template>

          <div v-if="projectsStore.items.length === 0" class="text-center py-8 text-gray-500">
            Aucun projet
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="project in projectsStore.sortedByDate.slice(0, 5)"
              :key="project.id"
              class="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
            >
              <p class="font-medium truncate">{{ project.name }}</p>
              <UBadge variant="subtle" size="xs">
                {{ tasksStore.taskCountByProject(project.id) }} tâche(s)
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </template>
    </div>

    <template #fallback>
      <div class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>
    </template>
  </ClientOnly>
</template>
