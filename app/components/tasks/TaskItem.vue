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
  reschedule: [task: Task]
}>()

// Swipe handling
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)
const swipeOffset = ref(0)
const swipeThreshold = 80

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = e.touches[0].clientX
  isSwiping.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return
  touchCurrentX.value = e.touches[0].clientX
  const diff = touchStartX.value - touchCurrentX.value

  // Only allow left swipe (positive diff), limit to max offset
  if (diff > 0) {
    swipeOffset.value = Math.min(diff, 100)
    // Prevent scroll when swiping horizontally
    if (diff > 10) {
      e.preventDefault()
    }
  }
}

const handleTouchEnd = () => {
  isSwiping.value = false

  if (swipeOffset.value >= swipeThreshold) {
    // Trigger reschedule action
    emit('reschedule', props.task)
  }

  // Reset swipe
  swipeOffset.value = 0
}

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

const isCompleted = computed(() => !!props.task.completedAt)

const isOverdue = computed(() => {
  if (isCompleted.value) return false
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
  <div class="relative overflow-hidden border-b border-gray-100 dark:border-gray-800">
    <!-- Swipe action background -->
    <div
      class="absolute inset-y-0 right-0 flex items-center justify-end bg-primary"
      :style="{ width: swipeOffset + 'px' }"
    >
      <UIcon name="i-lucide-calendar" class="size-6 text-white mr-4" />
    </div>

    <!-- Main content (slides on swipe) -->
    <div
      class="group relative flex items-start gap-3 py-4 px-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-700"
      :style="{ transform: `translateX(-${swipeOffset}px)`, transition: isSwiping ? 'none' : 'transform 0.2s ease-out' }"
      @click="emit('click', task)"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Checkbox - larger touch target -->
      <button
        class="flex-shrink-0 size-6 rounded-full border-2 transition-colors mt-0.5 flex items-center justify-center"
        :class="isCompleted
          ? 'border-gray-300 dark:border-gray-600 bg-gray-300 dark:bg-gray-600'
          : {
              'border-red-400 hover:border-red-500 hover:bg-gray-100 dark:hover:bg-gray-700': priorityColor === 'error',
              'border-amber-400 hover:border-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700': priorityColor === 'warning',
              'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700': priorityColor === 'neutral'
            }"
        @click.stop="emit('complete', task)"
        :aria-label="isCompleted ? 'Réactiver la tâche' : 'Marquer comme terminée'"
      >
        <UIcon v-if="isCompleted" name="i-lucide-check" class="size-4 text-white" />
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span
            class="text-base leading-snug"
            :class="isCompleted
              ? 'text-gray-400 dark:text-gray-500 line-through'
              : 'text-gray-900 dark:text-gray-100'"
          >
            {{ task.label }}
          </span>
        </div>

        <!-- Meta info -->
        <div class="flex items-center gap-3 mt-1.5">
          <span
            class="flex items-center gap-1 text-sm"
            :class="isCompleted
              ? 'text-gray-400 dark:text-gray-500'
              : isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'"
          >
            <UIcon name="i-lucide-calendar" class="size-4" />
            {{ formattedDueDate }}
          </span>

          <span
            v-if="projectName"
            class="flex items-center gap-1 text-sm"
            :class="isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'"
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
  </div>
</template>
