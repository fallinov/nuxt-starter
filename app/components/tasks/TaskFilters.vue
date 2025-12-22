<script setup lang="ts">
import type { Priority } from '~/types'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const isProjectFilterOpen = ref(false)
const isPriorityFilterOpen = ref(false)

// Priority options for filter (includes "all" option)
const priorityOptions = [
  { value: null as Priority | null, label: 'Toutes', color: 'text-gray-400' },
  { value: 'high' as Priority | null, label: 'Priorité 1', color: 'text-red-500' },
  { value: 'medium' as Priority | null, label: 'Priorité 2', color: 'text-amber-500' },
  { value: 'low' as Priority | null, label: 'Priorité 3', color: 'text-blue-500' }
]

const selectedProjectId = computed({
  get: () => tasksStore.filters.projectId,
  set: (value: string | null) => tasksStore.setFilters({ projectId: value })
})

const selectedPriority = computed({
  get: () => tasksStore.filters.priority,
  set: (value: Priority | null) => tasksStore.setFilters({ priority: value })
})

const searchQuery = computed({
  get: () => tasksStore.filters.search,
  set: (value: string) => tasksStore.setFilters({ search: value })
})

const selectedProject = computed(() => {
  if (!selectedProjectId.value) return null
  return projectsStore.items.find(p => p.id === selectedProjectId.value)
})

const selectedPriorityOption = computed(() => {
  return priorityOptions.find(p => p.value === selectedPriority.value) || priorityOptions[0]
})

const hasActiveFilters = computed(() => {
  return tasksStore.filters.projectId !== null ||
    tasksStore.filters.priority !== null ||
    tasksStore.filters.search !== ''
})

const selectProject = (projectId: string | null) => {
  selectedProjectId.value = projectId
  isProjectFilterOpen.value = false
}

const selectPriority = (priority: Priority | null) => {
  selectedPriority.value = priority
  isPriorityFilterOpen.value = false
}

const resetFilters = () => {
  tasksStore.resetFilters()
}

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:gap-3">
    <!-- Search input -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Rechercher..."
      size="lg"
      class="w-full"
    />

    <!-- Filter buttons row -->
    <div class="flex gap-2 sm:gap-3">
      <!-- Project filter -->
      <UPopover v-model:open="isProjectFilterOpen" class="flex-1">
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          class="justify-start w-full"
        >
        <template #leading>
          <UIcon
            name="i-lucide-hash"
            class="size-4"
            :class="selectedProject ? 'text-primary' : 'text-gray-400'"
          />
        </template>
        {{ selectedProject?.name || 'Tous les projets' }}
        <template #trailing>
          <UIcon name="i-lucide-chevron-down" class="size-4" />
        </template>
      </UButton>

      <template #content>
        <div class="w-64 p-2">
          <div class="space-y-1 max-h-64 overflow-y-auto">
            <!-- All projects option -->
            <button
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': !selectedProjectId }"
              @click="selectProject(null)"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-layers" class="size-5 text-gray-400" />
                <span class="text-sm">Tous les projets</span>
              </div>
              <UIcon
                v-if="!selectedProjectId"
                name="i-lucide-check"
                class="size-4 text-primary"
              />
            </button>

            <div class="border-t border-gray-100 dark:border-gray-800 my-2" />

            <!-- Project list -->
            <button
              v-for="project in projectsStore.items"
              :key="project.id"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': selectedProjectId === project.id }"
              @click="selectProject(project.id)"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-hash" class="size-5 text-primary" />
                <span class="text-sm truncate">{{ project.name }}</span>
                <UIcon
                  v-if="project.isDefault"
                  name="i-lucide-star"
                  class="size-3 text-amber-500"
                />
              </div>
              <UIcon
                v-if="selectedProjectId === project.id"
                name="i-lucide-check"
                class="size-4 text-primary flex-shrink-0"
              />
            </button>
          </div>
        </div>
      </template>
    </UPopover>

      <!-- Priority filter -->
      <UPopover v-model:open="isPriorityFilterOpen" class="flex-1">
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          class="justify-start w-full"
        >
          <template #leading>
            <svg
              class="size-4"
              :class="selectedPriorityOption?.color"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 21V3.99C5 3.44 5.45 3 6 3h12c.55 0 1 .44 1 .99V21l-7-3-7 3z" />
            </svg>
          </template>
          {{ selectedPriorityOption?.label || 'Priorité' }}
          <template #trailing>
            <UIcon name="i-lucide-chevron-down" class="size-4" />
          </template>
        </UButton>

        <template #content>
          <div class="w-48 p-2">
            <div class="space-y-1">
              <button
                v-for="option in priorityOptions"
                :key="option.value ?? 'all'"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/30': selectedPriority === option.value }"
                @click="selectPriority(option.value)"
              >
                <div class="flex items-center gap-3">
                  <svg
                    class="size-5"
                    :class="option.color"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 21V3.99C5 3.44 5.45 3 6 3h12c.55 0 1 .44 1 .99V21l-7-3-7 3z" />
                  </svg>
                  <span class="text-sm">{{ option.label }}</span>
                </div>
                <UIcon
                  v-if="selectedPriority === option.value"
                  name="i-lucide-check"
                  class="size-4 text-primary"
                />
              </button>
            </div>
          </div>
        </template>
      </UPopover>

      <!-- Reset button -->
      <UButton
        v-if="hasActiveFilters"
        color="neutral"
        variant="ghost"
        size="lg"
        icon="i-lucide-x"
        @click="resetFilters"
        class="flex-shrink-0"
      />
    </div>
  </div>
</template>
