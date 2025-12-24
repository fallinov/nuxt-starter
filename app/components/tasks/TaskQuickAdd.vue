<script setup lang="ts">
import type { Priority } from '~/types'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '~/types'

interface Props {
  defaultProjectId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: { label: string; description?: string; dueDate: string; priority: Priority; projectId: string }]
  cancel: []
}>()

const projectsStore = useProjectsStore()
const { formatRelativeDate, getTomorrowDateString } = useDateFormat()
const { simpleDatePresets: datePresets } = useDatePresets()

const isExpanded = ref(false)
const labelInput = ref<HTMLInputElement>()

const state = reactive({
  label: '',
  description: '',
  dueDate: '',
  priority: 'medium' as Priority,
  projectId: props.defaultProjectId || ''
})

const priorityOptions = [
  { label: 'Basse', value: 'low' as Priority, color: PRIORITY_COLORS.low },
  { label: 'Moyenne', value: 'medium' as Priority, color: PRIORITY_COLORS.medium },
  { label: 'Haute', value: 'high' as Priority, color: PRIORITY_COLORS.high }
]

const projectOptions = computed(() => {
  return projectsStore.items.map(p => ({
    label: p.name,
    value: p.id
  }))
})

const selectedProject = computed(() => {
  return projectsStore.items.find(p => p.id === state.projectId)
})

const selectedPriority = computed(() => {
  return priorityOptions.find(p => p.value === state.priority)
})

const formattedDueDate = computed(() => {
  if (!state.dueDate) return null
  return formatRelativeDate(state.dueDate)
})

const canSubmit = computed(() => {
  return state.label.trim() && state.projectId && state.dueDate
})

const expand = () => {
  isExpanded.value = true
  // Set default date to tomorrow if not set
  if (!state.dueDate) {
    state.dueDate = getTomorrowDateString()
  }
  // Set default project if only one exists and none selected
  if (!state.projectId && projectsStore.items.length === 1) {
    state.projectId = projectsStore.items[0]!.id
  }
  nextTick(() => {
    labelInput.value?.focus()
  })
}

const collapse = () => {
  isExpanded.value = false
  resetForm()
  emit('cancel')
}

const resetForm = () => {
  state.label = ''
  state.description = ''
  state.dueDate = ''
  state.priority = 'medium'
  state.projectId = props.defaultProjectId || ''
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  const dueDateISO = new Date(state.dueDate).toISOString()
  emit('submit', {
    label: state.label.trim(),
    description: state.description.trim() || undefined,
    dueDate: dueDateISO,
    priority: state.priority,
    projectId: state.projectId
  })

  resetForm()
  // Keep expanded for quick consecutive adds
  nextTick(() => {
    labelInput.value?.focus()
  })
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey && canSubmit.value) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape') {
    collapse()
  }
}

const setDueDate = (date: string) => {
  state.dueDate = date
}

const setPriority = (priority: Priority) => {
  state.priority = priority
}

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <!-- Collapsed state: simple button -->
    <button
      v-if="!isExpanded"
      class="w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      @click="expand"
    >
      <UIcon name="i-lucide-plus" class="size-5 text-primary" />
      <span>Ajouter une tâche</span>
    </button>

    <!-- Expanded state: full form -->
    <div v-else class="p-4">
      <!-- Label input -->
      <input
        ref="labelInput"
        v-model="state.label"
        type="text"
        placeholder="Nom de la tâche"
        class="w-full text-base font-medium bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        @keydown="handleKeydown"
      />

      <!-- Description input -->
      <input
        v-model="state.description"
        type="text"
        placeholder="Description"
        class="w-full mt-2 text-sm bg-transparent border-0 outline-none text-gray-600 dark:text-gray-400 placeholder:text-gray-400"
        @keydown="handleKeydown"
      />

      <!-- Quick action buttons -->
      <div class="flex flex-wrap items-center gap-2 mt-4">
        <!-- Due date -->
        <UPopover>
          <UButton
            :color="state.dueDate ? 'primary' : 'neutral'"
            variant="soft"
            size="xs"
            :icon="state.dueDate ? 'i-lucide-calendar-check' : 'i-lucide-calendar'"
          >
            {{ formattedDueDate || 'Échéance' }}
          </UButton>

          <template #content>
            <div class="p-2 space-y-1 min-w-[180px]">
              <button
                v-for="preset in datePresets"
                :key="preset.value"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/30 text-primary': state.dueDate === preset.value }"
                @click="setDueDate(preset.value)"
              >
                <UIcon :name="preset.icon" class="size-4" />
                {{ preset.label }}
              </button>
              <div class="border-t border-gray-100 dark:border-gray-800 my-2" />
              <input
                v-model="state.dueDate"
                type="date"
                class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border-0"
              />
            </div>
          </template>
        </UPopover>

        <!-- Priority -->
        <UPopover>
          <UButton
            :color="selectedPriority?.color || 'neutral'"
            variant="soft"
            size="xs"
            icon="i-lucide-flag"
          >
            {{ PRIORITY_LABELS[state.priority] }}
          </UButton>

          <template #content>
            <div class="p-2 space-y-1 min-w-[140px]">
              <button
                v-for="option in priorityOptions"
                :key="option.value"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :class="{ 'bg-primary-50 dark:bg-primary-900/30': state.priority === option.value }"
                @click="setPriority(option.value)"
              >
                <UIcon
                  name="i-lucide-flag"
                  class="size-4"
                  :class="{
                    'text-red-500': option.color === 'error',
                    'text-amber-500': option.color === 'warning',
                    'text-gray-400': option.color === 'neutral'
                  }"
                />
                {{ option.label }}
              </button>
            </div>
          </template>
        </UPopover>

        <!-- Project -->
        <UPopover>
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-lucide-folder"
          >
            {{ selectedProject?.name || 'Projet' }}
          </UButton>

          <template #content>
            <div class="p-2 space-y-1 min-w-[180px] max-h-[200px] overflow-y-auto">
              <button
                v-for="option in projectOptions"
                :key="option.value"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                :class="{ 'bg-primary-50 dark:bg-primary-900/30 text-primary': state.projectId === option.value }"
                @click="state.projectId = option.value"
              >
                <UIcon name="i-lucide-hash" class="size-4 flex-shrink-0" />
                <span class="truncate">{{ option.label }}</span>
              </button>
            </div>
          </template>
        </UPopover>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="collapse"
        >
          Annuler
        </UButton>
        <UButton
          size="sm"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          Ajouter
        </UButton>
      </div>
    </div>
  </div>
</template>
