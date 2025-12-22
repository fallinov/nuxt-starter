<script setup lang="ts">
interface Props {
  modelValue: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const projectsStore = useProjectsStore()
const isOpen = ref(false)

const selectedProject = computed(() => {
  return projectsStore.items.find(p => p.id === props.modelValue)
})

const selectProject = (projectId: string) => {
  emit('update:modelValue', projectId)
  isOpen.value = false
}

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <UPopover v-model:open="isOpen">
    <UButton
      color="neutral"
      variant="ghost"
      class="justify-start"
      :disabled="disabled"
    >
      <template #leading>
        <UIcon
          name="i-lucide-hash"
          class="size-4"
          :class="selectedProject ? 'text-primary' : 'text-gray-400'"
        />
      </template>
      <span :class="selectedProject ? '' : 'text-gray-500'">
        {{ selectedProject?.name || 'Projet' }}
      </span>
    </UButton>

    <template #content>
      <div class="w-64 p-2">
        <!-- Header -->
        <div class="px-3 py-2 mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Sélectionner un projet
        </div>

        <!-- Project list -->
        <div class="space-y-1 max-h-64 overflow-y-auto">
          <button
            v-for="project in projectsStore.items"
            :key="project.id"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30': modelValue === project.id }"
            @click="selectProject(project.id)"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-hash" class="size-5 text-primary" />
              <span class="text-sm truncate">{{ project.name }}</span>
            </div>
            <UIcon
              v-if="modelValue === project.id"
              name="i-lucide-check"
              class="size-4 text-primary flex-shrink-0"
            />
          </button>

          <!-- Empty state -->
          <div
            v-if="projectsStore.items.length === 0"
            class="px-3 py-4 text-center text-sm text-gray-500"
          >
            Aucun projet disponible
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
