<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { Task, Priority } from '~/types'

interface Props {
  initialData?: Partial<Task>
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  submitLabel: 'Créer'
})

const emit = defineEmits<{
  submit: [data: { label: string; description?: string; dueDate: string; priority: Priority; projectId: string }]
  cancel: []
}>()

const projectsStore = useProjectsStore()
const { extractDatePart, getTomorrowDateString } = useDateFormat()

const priorityOptions = [
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' }
]

const formatDateForInput = (dateString?: string | null): string => {
  if (!dateString) {
    return getTomorrowDateString()
  }
  return extractDatePart(dateString)
}

const state = reactive({
  label: props.initialData?.label || '',
  description: props.initialData?.description || '',
  dueDate: formatDateForInput(props.initialData?.dueDate),
  priority: props.initialData?.priority || 'medium',
  projectId: props.initialData?.projectId || ''
})

const schema = z.object({
  label: z.string().min(1, 'Le libellé est requis').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().min(1, 'La date est requise'),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().min(1, 'Le projet est requis')
})

type Schema = z.output<typeof schema>

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const dueDateISO = new Date(event.data.dueDate).toISOString()
  emit('submit', {
    ...event.data,
    description: event.data.description?.trim() || undefined,
    dueDate: dueDateISO
  })
}

const projectOptions = computed(() => {
  return projectsStore.items.map(p => ({
    label: p.name,
    value: p.id
  }))
})

onMounted(() => {
  if (projectsStore.items.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Libellé"
      name="label"
      required
    >
      <UInput
        v-model="state.label"
        placeholder="Décrivez la tâche..."
        autofocus
      />
    </UFormField>

    <UFormField
      label="Description"
      name="description"
    >
      <UTextarea
        v-model="state.description"
        placeholder="Ajouter des détails (optionnel)..."
        :rows="3"
      />
    </UFormField>

    <UFormField
      label="Projet"
      name="projectId"
      required
    >
      <USelectMenu
        v-model="state.projectId"
        :options="projectOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Sélectionner un projet"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField
        label="Date d'échéance"
        name="dueDate"
        required
      >
        <UInput
          v-model="state.dueDate"
          type="date"
        />
      </UFormField>

      <UFormField
        label="Priorité"
        name="priority"
        required
      >
        <USelectMenu
          v-model="state.priority"
          :options="priorityOptions"
          value-attribute="value"
          option-attribute="label"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <UButton
        color="neutral"
        variant="ghost"
        label="Annuler"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="props.submitLabel"
      />
    </div>
  </UForm>
</template>
