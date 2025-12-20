<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { CreateProjectSchema } from '~/types'

interface Props {
  initialData?: { name: string }
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  submitLabel: 'Créer'
})

const emit = defineEmits<{
  submit: [data: { name: string }]
  cancel: []
}>()

const state = reactive({
  name: props.initialData?.name || ''
})

type Schema = z.output<typeof CreateProjectSchema>

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  emit('submit', event.data)
}
</script>

<template>
  <UForm
    :schema="CreateProjectSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormGroup
      label="Nom du projet"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        placeholder="Ex: Site vitrine, Application mobile..."
        autofocus
      />
    </UFormGroup>

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
