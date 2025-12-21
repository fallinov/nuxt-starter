<script setup lang="ts">
import type { Project } from '~/types'

interface Props {
  project: Project
  taskCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [project: Project]
  delete: [project: Project]
}>()

const formattedDate = computed(() => {
  return new Date(props.project.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-lg truncate">
          {{ props.project.name }}
        </h3>
        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-calendar" class="size-4" />
            {{ formattedDate }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clipboard-list" class="size-4" />
            {{ props.taskCount }} tâche{{ props.taskCount !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <UDropdown
        :items="[
          [{
            label: 'Modifier',
            icon: 'i-lucide-pencil',
            click: () => emit('edit', props.project)
          },
          {
            label: 'Voir les tâches',
            icon: 'i-lucide-eye',
            to: { path: '/tasks', query: { projectId: props.project.id } }
          }],
          [{
            label: 'Supprimer',
            icon: 'i-lucide-trash-2',
            iconClass: 'text-red-500',
            click: () => emit('delete', props.project)
          }]
        ]"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-ellipsis-vertical"
          aria-label="Actions du projet"
        />
      </UDropdown>
    </div>
  </UCard>
</template>
