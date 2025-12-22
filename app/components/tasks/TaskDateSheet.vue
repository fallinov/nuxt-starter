<script setup lang="ts">
interface Props {
  open: boolean
  currentDate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [value: string]
}>()

// Helper to get day name
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
}

// Date presets
const datePresets = computed(() => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Find next Saturday for "Ce week-end"
  const nextSaturday = new Date()
  const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7 || 7
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday)

  // Find next Monday for "Semaine prochaine"
  const nextMonday = new Date()
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)

  return [
    {
      label: "Aujourd'hui",
      value: today.toISOString().split('T')[0] as string,
      day: getDayName(today),
      icon: 'i-lucide-calendar',
      color: 'text-green-600'
    },
    {
      label: 'Demain',
      value: tomorrow.toISOString().split('T')[0] as string,
      day: getDayName(tomorrow),
      icon: 'i-lucide-sun',
      color: 'text-amber-500'
    },
    {
      label: 'Ce week-end',
      value: nextSaturday.toISOString().split('T')[0] as string,
      day: getDayName(nextSaturday),
      icon: 'i-lucide-sofa',
      color: 'text-blue-500'
    },
    {
      label: 'Semaine prochaine',
      value: nextMonday.toISOString().split('T')[0] as string,
      day: getDayName(nextMonday),
      icon: 'i-lucide-arrow-right',
      color: 'text-purple-500'
    }
  ]
})

const currentDateValue = computed(() => {
  if (!props.currentDate) return ''
  return props.currentDate.includes('T')
    ? props.currentDate.split('T')[0] as string
    : props.currentDate
})

const formattedCurrentDate = computed(() => {
  if (!currentDateValue.value) return 'Aucune date'
  return new Date(currentDateValue.value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const selectPreset = (value: string) => {
  emit('select', value)
  emit('update:open', false)
}

const selectDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('select', target.value)
  emit('update:open', false)
}

const close = () => {
  emit('update:open', false)
}

const confirm = () => {
  emit('update:open', false)
}
</script>

<template>
  <USlideover
    :open="open"
    side="bottom"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="flex flex-col h-full max-h-[85vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="close"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
          <span class="font-semibold">Date</span>
          <button
            class="p-2 -mr-2 rounded-full bg-gray-200 dark:bg-gray-700"
            @click="confirm"
          >
            <UIcon name="i-lucide-check" class="size-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Current date display -->
          <div class="px-4 py-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            {{ formattedCurrentDate }}
          </div>

          <!-- Presets -->
          <div class="space-y-1">
            <button
              v-for="preset in datePresets"
              :key="preset.value"
              class="w-full flex items-center justify-between px-4 py-3.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': currentDateValue === preset.value }"
              @click="selectPreset(preset.value)"
            >
              <div class="flex items-center gap-4">
                <UIcon :name="preset.icon" class="size-5" :class="preset.color" />
                <span class="text-base">{{ preset.label }}</span>
              </div>
              <span class="text-sm text-gray-500">{{ preset.day }}</span>
            </button>

            <!-- No date option -->
            <button
              class="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
              @click="selectPreset('')"
            >
              <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
              <span class="text-base">Aucune date</span>
            </button>
          </div>

          <!-- Separator -->
          <div class="border-t border-gray-200 dark:border-gray-700 my-4" />

          <!-- Calendar input -->
          <div>
            <label class="text-sm text-gray-500 mb-2 block">Choisir une date</label>
            <input
              type="date"
              :value="currentDateValue"
              class="w-full px-4 py-3 text-base bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary"
              @change="selectDate"
            />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
