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
  setDefault: [project: Project]
}>()

const { formatDateFull } = useDateFormat()

const formattedDate = computed(() => formatDateFull(props.project.createdAt))

const dropdownItems = computed(() => {
  const items = [
    [{
      label: 'Modifier',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', props.project)
    },
    {
      label: 'Voir les tâches',
      icon: 'i-lucide-eye',
      to: { path: '/tasks', query: { projectId: props.project.id } }
    },
    {
      label: props.project.isDefault ? 'Retirer par défaut' : 'Définir par défaut',
      icon: props.project.isDefault ? 'i-lucide-star-off' : 'i-lucide-star',
      onSelect: () => emit('setDefault', props.project)
    }],
    [{
      label: 'Supprimer',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => emit('delete', props.project)
    }]
  ]
  return items
})
</script>

<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-lg truncate">
            {{ props.project.name }}
          </h3>
          <UIcon
            v-if="props.project.isDefault"
            name="i-lucide-star"
            class="size-4 text-amber-500 flex-shrink-0"
            title="Projet par défaut"
          />
        </div>
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

      <UDropdownMenu
        :items="dropdownItems"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-ellipsis-vertical"
          aria-label="Actions du projet"
        />
      </UDropdownMenu>
    </div>
  </UCard>
</template>
