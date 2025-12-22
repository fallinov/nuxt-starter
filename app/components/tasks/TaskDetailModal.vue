<script setup lang="ts">
import type { Task, Priority, UpdateTask } from '~/types'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '~/types'

interface Props {
  task: Task | null
  projectName?: string
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update': [id: string, data: UpdateTask]
  'delete': [task: Task]
  'complete': [task: Task]
}>()

const projectsStore = useProjectsStore()

// Editable state
const isEditingLabel = ref(false)
const isEditingDescription = ref(false)
const editLabel = ref('')
const editDescription = ref('')
const labelInput = ref<HTMLInputElement>()
const descriptionInput = ref<HTMLTextAreaElement>()

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

const formattedDueDate = computed(() => {
  if (!props.task) return ''
  const date = new Date(props.task.dueDate)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const formattedCreatedAt = computed(() => {
  if (!props.task) return ''
  const date = new Date(props.task.createdAt)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const isOverdue = computed(() => {
  if (!props.task) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(props.task.dueDate)
  taskDate.setHours(0, 0, 0, 0)
  return taskDate < today
})

const dueDateForInput = computed(() => {
  if (!props.task) return ''
  return props.task.dueDate.split('T')[0]
})

const closeModal = () => {
  emit('update:open', false)
  isEditingLabel.value = false
  isEditingDescription.value = false
}

const startEditLabel = () => {
  if (!props.task) return
  editLabel.value = props.task.label
  isEditingLabel.value = true
  nextTick(() => {
    labelInput.value?.focus()
    labelInput.value?.select()
  })
}

const saveLabel = () => {
  if (!props.task || !editLabel.value.trim()) {
    isEditingLabel.value = false
    return
  }
  if (editLabel.value.trim() !== props.task.label) {
    emit('update', props.task.id, { label: editLabel.value.trim() })
  }
  isEditingLabel.value = false
}

const startEditDescription = () => {
  if (!props.task) return
  editDescription.value = props.task.description || ''
  isEditingDescription.value = true
  nextTick(() => {
    descriptionInput.value?.focus()
  })
}

const saveDescription = () => {
  if (!props.task) {
    isEditingDescription.value = false
    return
  }
  const newDesc = editDescription.value.trim() || undefined
  if (newDesc !== props.task.description) {
    emit('update', props.task.id, { description: newDesc })
  }
  isEditingDescription.value = false
}

const updateDueDate = (dateString: string) => {
  if (!props.task) return
  const dueDateISO = new Date(dateString).toISOString()
  emit('update', props.task.id, { dueDate: dueDateISO })
}

const updatePriority = (priority: Priority) => {
  if (!props.task) return
  emit('update', props.task.id, { priority })
}

const updateProject = (projectId: string) => {
  if (!props.task) return
  emit('update', props.task.id, { projectId })
}

const handleLabelKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveLabel()
  }
  if (e.key === 'Escape') {
    isEditingLabel.value = false
  }
}

const handleDescKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isEditingDescription.value = false
  }
}

watch(() => props.open, (newVal) => {
  if (!newVal) {
    isEditingLabel.value = false
    isEditingDescription.value = false
  }
})

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <USlideover
    :open="open"
    :title="''"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          @click="closeModal"
        />
        <UDropdownMenu
          :items="[
            [{
              label: 'Supprimer',
              icon: 'i-lucide-trash-2',
              color: 'error',
              onSelect: () => task && emit('delete', task)
            }]
          ]"
          :content="{ align: 'end' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-ellipsis"
            size="sm"
          />
        </UDropdownMenu>
      </div>
    </template>

    <template #body>
      <div v-if="task" class="space-y-6">
        <!-- Task header with checkbox and label -->
        <div class="flex items-start gap-3">
          <button
            class="flex-shrink-0 mt-1 size-6 rounded-full border-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{
              'border-red-400 hover:border-red-500': PRIORITY_COLORS[task.priority] === 'error',
              'border-amber-400 hover:border-amber-500': PRIORITY_COLORS[task.priority] === 'warning',
              'border-gray-300 dark:border-gray-600 hover:border-gray-400': PRIORITY_COLORS[task.priority] === 'neutral'
            }"
            @click="emit('complete', task)"
            aria-label="Marquer comme terminée"
          />

          <div class="flex-1 min-w-0">
            <!-- Editable label -->
            <input
              v-if="isEditingLabel"
              ref="labelInput"
              v-model="editLabel"
              type="text"
              class="w-full text-lg font-medium bg-transparent border-0 outline-none ring-2 ring-primary rounded px-2 py-1 -ml-2"
              @blur="saveLabel"
              @keydown="handleLabelKeydown"
            />
            <h2
              v-else
              class="text-lg font-medium cursor-pointer hover:text-primary transition-colors"
              @click="startEditLabel"
            >
              {{ task.label }}
            </h2>
          </div>
        </div>

        <!-- Task details -->
        <div class="space-y-4">
          <!-- Project -->
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-hash" class="size-5 text-gray-400 flex-shrink-0" />
            <USelectMenu
              :model-value="task.projectId"
              :options="projectOptions"
              value-attribute="value"
              option-attribute="label"
              class="flex-1"
              @update:model-value="updateProject"
            />
          </div>

          <!-- Due date -->
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-calendar"
              class="size-5 flex-shrink-0"
              :class="isOverdue ? 'text-red-500' : 'text-gray-400'"
            />
            <UInput
              type="date"
              :model-value="dueDateForInput"
              class="flex-1"
              @update:model-value="updateDueDate"
            />
          </div>

          <!-- Priority -->
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-flag"
              class="size-5 flex-shrink-0"
              :class="{
                'text-red-500': PRIORITY_COLORS[task.priority] === 'error',
                'text-amber-500': PRIORITY_COLORS[task.priority] === 'warning',
                'text-gray-400': PRIORITY_COLORS[task.priority] === 'neutral'
              }"
            />
            <USelectMenu
              :model-value="task.priority"
              :options="priorityOptions"
              value-attribute="value"
              option-attribute="label"
              class="flex-1"
              @update:model-value="updatePriority"
            />
          </div>
        </div>

        <!-- Description section -->
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-align-left" class="size-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Description</span>
          </div>

          <textarea
            v-if="isEditingDescription"
            ref="descriptionInput"
            v-model="editDescription"
            rows="4"
            class="w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-0 outline-none ring-2 ring-primary resize-none"
            placeholder="Ajouter une description..."
            @blur="saveDescription"
            @keydown="handleDescKeydown"
          />
          <div
            v-else
            class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[80px]"
            @click="startEditDescription"
          >
            {{ task.description || 'Ajouter une description...' }}
          </div>
        </div>

        <!-- Created at -->
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <UIcon name="i-lucide-clock" class="size-4" />
            <span>Créée le {{ formattedCreatedAt }}</span>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
