<script setup lang="ts">
import type { Task } from '~/types'
import { PRIORITY_COLORS } from '~/types'

interface Props {
  task: Task
  projectName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [task: Task]
  complete: [task: Task]
  delete: [task: Task]
}>()

const formattedDueDate = computed(() => {
  const date = new Date(props.task.dueDate)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Reset time for comparison
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)

  if (taskDate.getTime() === today.getTime()) {
    return "Aujourd'hui"
  }
  if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Demain'
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
})

const isOverdue = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(props.task.dueDate)
  taskDate.setHours(0, 0, 0, 0)
  return taskDate < today
})

const priorityColor = computed(() => {
  return PRIORITY_COLORS[props.task.priority]
})
</script>

<template>
  <div
    class="group flex items-start gap-3 py-4 px-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-700"
    @click="emit('click', task)"
  >
    <!-- Checkbox - larger touch target -->
    <button
      class="flex-shrink-0 size-6 rounded-full border-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 mt-0.5"
      :class="{
        'border-red-400 hover:border-red-500': priorityColor === 'error',
        'border-amber-400 hover:border-amber-500': priorityColor === 'warning',
        'border-gray-300 dark:border-gray-600 hover:border-gray-400': priorityColor === 'neutral'
      }"
      @click.stop="emit('complete', task)"
      aria-label="Marquer comme terminée"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-base text-gray-900 dark:text-gray-100 leading-snug">
          {{ task.label }}
        </span>
      </div>

      <!-- Meta info -->
      <div class="flex items-center gap-3 mt-1.5">
        <span
          class="flex items-center gap-1 text-sm"
          :class="isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'"
        >
          <UIcon name="i-lucide-calendar" class="size-4" />
          {{ formattedDueDate }}
        </span>

        <span
          v-if="projectName"
          class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-lucide-hash" class="size-4" />
          {{ projectName }}
        </span>
      </div>
    </div>

    <!-- Actions (visible on hover/touch) -->
    <div class="flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <UDropdownMenu
        :items="[
          [{
            label: 'Supprimer',
            icon: 'i-lucide-trash-2',
            color: 'error',
            onSelect: () => emit('delete', task)
          }]
        ]"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-ellipsis"
          size="sm"
          aria-label="Plus d'actions"
          @click.stop
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
