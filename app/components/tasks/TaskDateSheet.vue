<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

interface Props {
  open: boolean
  currentDate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [value: string]
}>()

const { extractDatePart, formatDateWithYear } = useDateFormat()
const { datePresets } = useDatePresets()

const currentDateValue = computed(() => extractDatePart(props.currentDate))

const formattedCurrentDate = computed(() => {
  if (!currentDateValue.value) return 'Aucune date sélectionnée'
  return formatDateWithYear(currentDateValue.value)
})

// Convert string date to CalendarDate for the calendar component
const calendarValue = computed({
  get: (): DateValue | undefined => {
    if (!currentDateValue.value) return undefined
    const parts = currentDateValue.value.split('-').map(Number)
    const year = parts[0] ?? 0
    const month = parts[1] ?? 1
    const day = parts[2] ?? 1
    return new CalendarDate(year, month, day)
  },
  set: (value: DateValue | undefined) => {
    if (value) {
      const dateStr = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
      emit('select', dateStr)
    }
  }
})

const selectPreset = (value: string) => {
  emit('select', value)
  emit('update:open', false)
}

const onCalendarSelect = (value: DateValue) => {
  const dateStr = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
  emit('select', dateStr)
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
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              class="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
              @click="selectPreset('')"
            >
              <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
              <span class="text-base">Aucune date</span>
            </button>
          </div>

          <!-- Separator -->
          <div class="border-t border-gray-200 dark:border-gray-700 my-4" />

          <!-- Calendar with multiple months for scroll -->
          <div class="calendar-scroll">
            <UCalendar
              v-model="calendarValue"
              :number-of-months="3"
              class="w-full [&_[data-slot=header]]:hidden"
              @update:model-value="onCalendarSelect"
            />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
