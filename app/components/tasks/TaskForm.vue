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
  submit: [data: { label: string; dueDate: string; priority: Priority; projectId: string }]
  cancel: []
}>()

const projectsStore = useProjectsStore()

const priorityOptions = [
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' }
]

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0] as string
  }
  return dateString.split('T')[0] as string
}

const state = reactive({
  label: props.initialData?.label || '',
  dueDate: formatDateForInput(props.initialData?.dueDate),
  priority: props.initialData?.priority || 'medium',
  projectId: props.initialData?.projectId || ''
})

const schema = z.object({
  label: z.string().min(1, 'Le libellé est requis').max(200),
  dueDate: z.string().min(1, 'La date est requise'),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().min(1, 'Le projet est requis')
})

type Schema = z.output<typeof schema>

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const dueDateISO = new Date(event.data.dueDate).toISOString()
  emit('submit', {
    ...event.data,
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
    <UFormGroup
      label="Libellé"
      name="label"
      required
    >
      <UInput
        v-model="state.label"
        placeholder="Décrivez la tâche..."
        autofocus
      />
    </UFormGroup>

    <UFormGroup
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
    </UFormGroup>

    <div class="grid grid-cols-2 gap-4">
      <UFormGroup
        label="Date d'échéance"
        name="dueDate"
        required
      >
        <UInput
          v-model="state.dueDate"
          type="date"
        />
      </UFormGroup>

      <UFormGroup
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
      </UFormGroup>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <UButton
        color="gray"
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
