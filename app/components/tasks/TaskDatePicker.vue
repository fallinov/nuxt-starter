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

const isOpen = ref(false)

// Helper to get day name
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
}

// Helper to format date for display
const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return 'Échéance'

  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Reset hours for comparison
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)

  if (compareDate.getTime() === today.getTime()) return "Aujourd'hui"
  if (compareDate.getTime() === tomorrow.getTime()) return 'Demain'

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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
  if (!props.modelValue) return ''
  // Handle both ISO datetime and date-only formats
  return props.modelValue.includes('T')
    ? props.modelValue.split('T')[0] as string
    : props.modelValue
})

const isOverdue = computed(() => {
  if (!props.modelValue) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(props.modelValue)
  taskDate.setHours(0, 0, 0, 0)
  return taskDate < today
})

const selectPreset = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const selectDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const clearDate = () => {
  emit('update:modelValue', '')
  isOpen.value = false
}
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
          name="i-lucide-calendar"
          class="size-4"
          :class="isOverdue ? 'text-red-500' : modelValue ? 'text-green-600' : 'text-gray-400'"
        />
      </template>
      <span :class="isOverdue ? 'text-red-500' : modelValue ? '' : 'text-gray-500'">
        {{ formatDisplayDate(currentDateValue) }}
      </span>
    </UButton>

    <template #content>
      <div class="w-72 p-2">
        <!-- Header with current selection -->
        <div class="px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-center">
          {{ currentDateValue ? new Date(currentDateValue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Aucune date' }}
        </div>

        <!-- Presets -->
        <div class="space-y-1">
          <button
            v-for="preset in datePresets"
            :key="preset.value"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30': currentDateValue === preset.value }"
            @click="selectPreset(preset.value)"
          >
            <div class="flex items-center gap-3">
              <UIcon :name="preset.icon" class="size-5" :class="preset.color" />
              <span class="text-sm">{{ preset.label }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ preset.day }}</span>
          </button>

          <!-- No date option -->
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
            @click="clearDate"
          >
            <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
            <span class="text-sm">Aucune date</span>
          </button>
        </div>

        <!-- Separator -->
        <div class="border-t border-gray-100 dark:border-gray-800 my-3" />

        <!-- Calendar input -->
        <div class="px-1">
          <label class="text-xs text-gray-500 mb-1 block">Choisir une date</label>
          <input
            type="date"
            :value="currentDateValue"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary"
            @change="selectDate"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
