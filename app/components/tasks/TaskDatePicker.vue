<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

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

const { formatRelativeDate, extractDatePart, isOverdue: checkOverdue, formatDateFull } = useDateFormat()
const { datePresets } = useDatePresets()

const isOpen = ref(false)

const currentDateValue = computed(() => extractDatePart(props.modelValue))

const isOverdue = computed(() => checkOverdue(props.modelValue))

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
      emit('update:modelValue', dateStr)
    }
  }
})

const selectPreset = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const clearDate = () => {
  emit('update:modelValue', '')
  isOpen.value = false
}

const onCalendarSelect = (value: DateValue) => {
  const dateStr = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
  emit('update:modelValue', dateStr)
  isOpen.value = false
}

const close = () => {
  isOpen.value = false
}
</script>

<template>
  <div>
    <!-- Trigger button -->
    <UButton
      color="neutral"
      variant="ghost"
      class="justify-start"
      :disabled="disabled"
      @click="isOpen = true"
    >
      <template #leading>
        <UIcon
          name="i-lucide-calendar"
          class="size-4"
          :class="isOverdue ? 'text-red-500' : modelValue ? 'text-green-600' : 'text-gray-400'"
        />
      </template>
      <span :class="isOverdue ? 'text-red-500' : modelValue ? '' : 'text-gray-500'">
        {{ formatRelativeDate(currentDateValue, 'Échéance') }}
      </span>
    </UButton>

    <!-- Bottom sheet -->
    <USlideover
      v-model:open="isOpen"
      side="bottom"
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
              @click="close"
            >
              <UIcon name="i-lucide-check" class="size-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Current date display -->
            <div class="px-4 py-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              {{ currentDateValue ? formatDateFull(currentDateValue) : 'Aucune date sélectionnée' }}
            </div>

            <!-- Presets -->
            <div class="space-y-1 mb-4">
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
                @click="clearDate"
              >
                <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
                <span class="text-base">Aucune date</span>
              </button>
            </div>

            <!-- Separator -->
            <div class="border-t border-gray-200 dark:border-gray-700 mb-4" />

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
  </div>
</template>
