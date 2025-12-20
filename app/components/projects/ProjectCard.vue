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
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            {{ formattedDate }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4" />
            {{ props.taskCount }} tâche{{ props.taskCount !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <UDropdown
        :items="[
          [{
            label: 'Modifier',
            icon: 'i-heroicons-pencil-square',
            click: () => emit('edit', props.project)
          },
          {
            label: 'Voir les tâches',
            icon: 'i-heroicons-eye',
            to: { path: '/tasks', query: { projectId: props.project.id } }
          }],
          [{
            label: 'Supprimer',
            icon: 'i-heroicons-trash',
            iconClass: 'text-red-500',
            click: () => emit('delete', props.project)
          }]
        ]"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-ellipsis-vertical"
          aria-label="Actions du projet"
        />
      </UDropdown>
    </div>
  </UCard>
</template>
