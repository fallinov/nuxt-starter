<script setup lang="ts">
import type { UpdateTask } from '~/types'

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const toast = useToast()

const taskId = computed(() => route.params.id as string)
const task = computed(() => tasksStore.getById(taskId.value))

const isLoading = ref(true)

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

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchAll(),
    projectsStore.fetchAll()
  ])
  isLoading.value = false
  
  if (!task.value) {
    toast.add({ title: 'Erreur', description: 'Tâche non trouvée.', color: 'error' })
    router.push('/tasks')
  }
})

definePageMeta({
  title: 'Modifier la tâche'
})
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        to="/tasks"
        aria-label="Retour"
      />
      <h1 class="text-2xl font-bold">Modifier la tâche</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <UCard v-else-if="task" class="max-w-2xl">
      <TaskForm
        :initial-data="task"
        submit-label="Enregistrer"
        @submit="handleUpdate"
        @cancel="handleCancel"
      />
    </UCard>
  </div>
</template>
