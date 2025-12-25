<script setup lang="ts">
import type { Task } from '~/types'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '~/types'

interface Props {
  task: Task
  projectName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
}>()

const { formatDateWithYear, isOverdue: checkOverdue } = useDateFormat()

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return 'Pas de date'
  return formatDateWithYear(props.task.dueDate)
})

const isOverdue = computed(() => checkOverdue(props.task.dueDate))
</script>

<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-base">
          {{ props.task.label }}
        </h3>
        
        <div class="flex flex-wrap items-center gap-2 mt-2">
          <UBadge
            :color="PRIORITY_COLORS[props.task.priority]"
            variant="subtle"
            size="xs"
          >
            {{ PRIORITY_LABELS[props.task.priority] }}
          </UBadge>
          
          <span
            class="flex items-center gap-1 text-sm"
            :class="isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'"
          >
            <UIcon name="i-lucide-calendar" class="size-4" />
            {{ formattedDueDate }}
          </span>
          
          <span
            v-if="props.projectName"
            class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
          >
            <UIcon name="i-lucide-folder" class="size-4" />
            {{ props.projectName }}
          </span>
        </div>
      </div>

      <UDropdownMenu
        :items="[
          [{
            label: 'Modifier',
            icon: 'i-lucide-pencil',
            onSelect: () => emit('edit', props.task)
          }],
          [{
            label: 'Supprimer',
            icon: 'i-lucide-trash-2',
            color: 'error',
            onSelect: () => emit('delete', props.task)
          }]
        ]"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-ellipsis-vertical"
          aria-label="Actions de la tâche"
        />
      </UDropdownMenu>
    </div>
  </UCard>
</template>
