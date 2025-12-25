<script setup lang="ts">
import type { UpdateTask } from '~/types'

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const toast = useToast()

const taskId = computed(() => route.params.id as string)
const task = computed(() => tasksStore.getById(taskId.value))

const isLoading = computed(() => tasksStore.loading || projectsStore.loading)

const handleUpdate = async (data: UpdateTask) => {
  try {
    await tasksStore.update(taskId.value, data)
    toast.add({ title: 'Tâche modifiée', description: 'La tâche a été modifiée avec succès.', color: 'success' })
    router.push('/tasks')
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de modifier la tâche.', color: 'error' })
    console.error(e)
  }
}

const handleCancel = () => {
  router.push('/tasks')
}

watch(isLoading, (loading) => {
  if (!loading && !task.value) {
    toast.add({ title: 'Erreur', description: 'Tâche non trouvée.', color: 'error' })
    router.push('/tasks')
  }
}, { immediate: true })

definePageMeta({
  title: 'Modifier la tâche'
})
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/tasks"
        aria-label="Retour"
      />
      <h1 class="text-2xl font-bold">Modifier la tâche</h1>
    </div>

    <UCard v-if="isLoading" class="max-w-2xl">
      <div class="space-y-6">
        <!-- Label field skeleton -->
        <div>
          <USkeleton class="h-4 w-16 rounded mb-2" />
          <USkeleton class="h-10 w-full rounded" />
        </div>

        <!-- Description field skeleton -->
        <div>
          <USkeleton class="h-4 w-24 rounded mb-2" />
          <USkeleton class="h-24 w-full rounded" />
        </div>

        <!-- Two column fields skeleton -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <USkeleton class="h-4 w-12 rounded mb-2" />
            <USkeleton class="h-10 w-full rounded" />
          </div>
          <div>
            <USkeleton class="h-4 w-16 rounded mb-2" />
            <USkeleton class="h-10 w-full rounded" />
          </div>
        </div>

        <!-- Project field skeleton -->
        <div>
          <USkeleton class="h-4 w-14 rounded mb-2" />
          <USkeleton class="h-10 w-full rounded" />
        </div>

        <!-- Buttons skeleton -->
        <div class="flex justify-end gap-2 pt-4">
          <USkeleton class="h-10 w-24 rounded" />
          <USkeleton class="h-10 w-28 rounded" />
        </div>
      </div>
    </UCard>

    <UCard v-else-if="task" class="max-w-2xl">
      <TasksTaskForm
        :initial-data="task"
        submit-label="Enregistrer"
        @submit="handleUpdate"
        @cancel="handleCancel"
      />
    </UCard>
  </div>
</template>
