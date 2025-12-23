<script setup lang="ts">
import type { Task, Priority, UpdateTask, CreateTask } from '~/types'
import { PRIORITY_COLORS } from '~/types'

interface Props {
  task?: Task | null
  open: boolean
  mode?: 'view' | 'create'
  defaultProjectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  mode: 'view',
  defaultProjectId: ''
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update': [id: string, data: UpdateTask]
  'create': [data: CreateTask]
  'delete': [task: Task]
  'complete': [task: Task]
}>()

const projectsStore = useProjectsStore()

// Create mode state
const createState = reactive({
  label: '',
  description: '',
  dueDate: '',
  priority: 'medium' as Priority,
  projectId: ''
})

// Edit mode state
const isEditingLabel = ref(false)
const isEditingDescription = ref(false)
const editLabel = ref('')
const editDescription = ref('')
const labelInput = ref<HTMLInputElement>()
const createLabelInput = ref<HTMLInputElement>()
const descriptionInput = ref<HTMLTextAreaElement>()

const isCreateMode = computed(() => props.mode === 'create')

const formattedCreatedAt = computed(() => {
  if (!props.task) return ''
  const date = new Date(props.task.createdAt)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const canCreate = computed(() => {
  return createState.label.trim() && createState.projectId && createState.dueDate
})

const closeModal = () => {
  emit('update:open', false)
  isEditingLabel.value = false
  isEditingDescription.value = false
}

const resetCreateState = () => {
  createState.label = ''
  createState.description = ''
  createState.dueDate = ''
  createState.priority = 'medium'
  createState.projectId = props.defaultProjectId || ''
}

const initCreateMode = () => {
  // Set default date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  createState.dueDate = tomorrow.toISOString().split('T')[0] as string

  // Set default project: use prop, then store default, then first project
  createState.projectId = props.defaultProjectId
    || projectsStore.defaultProjectId
    || (projectsStore.items[0]?.id || '')

  nextTick(() => {
    createLabelInput.value?.focus()
  })
}

const handleCreate = () => {
  if (!canCreate.value) return

  const dueDateISO = new Date(createState.dueDate).toISOString()
  emit('create', {
    label: createState.label.trim(),
    description: createState.description.trim() || undefined,
    dueDate: dueDateISO,
    priority: createState.priority,
    projectId: createState.projectId
  })

  resetCreateState()
  closeModal()
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
  if (isCreateMode.value) {
    createState.dueDate = dateString
    return
  }
  if (!props.task) return
  // Set to ISO datetime if date provided, or null if cleared
  const dueDate = dateString ? new Date(dateString).toISOString() : null
  emit('update', props.task.id, { dueDate })
}

const updatePriority = (priority: Priority) => {
  if (isCreateMode.value) {
    createState.priority = priority
    return
  }
  if (!props.task) return
  emit('update', props.task.id, { priority })
}

const updateProject = (projectId: string) => {
  if (isCreateMode.value) {
    createState.projectId = projectId
    return
  }
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

const handleCreateLabelKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && canCreate.value) {
    e.preventDefault()
    handleCreate()
  }
  if (e.key === 'Escape') {
    closeModal()
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
    if (isCreateMode.value) {
      resetCreateState()
    }
  } else if (isCreateMode.value) {
    initCreateMode()
  }
})

watch(() => props.mode, (newMode) => {
  if (newMode === 'create' && props.open) {
    initCreateMode()
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
        <div v-if="!isCreateMode && task">
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
      </div>
    </template>

    <template #body>
      <!-- Create Mode -->
      <div v-if="isCreateMode" class="space-y-6">
        <!-- Task header -->
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 mt-1 size-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
          />

          <div class="flex-1 min-w-0">
            <input
              ref="createLabelInput"
              v-model="createState.label"
              type="text"
              placeholder="Nom de la tâche"
              class="w-full text-lg font-medium bg-transparent border-0 outline-none placeholder:text-gray-400"
              @keydown="handleCreateLabelKeydown"
            />
          </div>
        </div>

        <!-- Task details with improved pickers -->
        <div class="space-y-2">
          <!-- Project picker -->
          <TasksTaskProjectPicker
            v-model="createState.projectId"
          />

          <!-- Date picker -->
          <TasksTaskDatePicker
            v-model="createState.dueDate"
          />

          <!-- Priority picker -->
          <TasksTaskPriorityPicker
            v-model="createState.priority"
          />
        </div>

        <!-- Description section -->
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-align-left" class="size-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Description</span>
          </div>

          <UTextarea
            v-model="createState.description"
            :rows="4"
            placeholder="Ajouter une description..."
            class="w-full"
          />
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              Annuler
            </UButton>
            <UButton
              :disabled="!canCreate"
              @click="handleCreate"
            >
              Ajouter la tâche
            </UButton>
          </div>
        </div>
      </div>

      <!-- View/Edit Mode -->
      <div v-else-if="task" class="space-y-6">
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

        <!-- Task details with improved pickers -->
        <div class="space-y-2">
          <!-- Project picker -->
          <TasksTaskProjectPicker
            :model-value="task.projectId"
            @update:model-value="updateProject"
          />

          <!-- Date picker -->
          <TasksTaskDatePicker
            :model-value="task.dueDate || ''"
            @update:model-value="updateDueDate"
          />

          <!-- Priority picker -->
          <TasksTaskPriorityPicker
            :model-value="task.priority"
            @update:model-value="updatePriority"
          />
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
