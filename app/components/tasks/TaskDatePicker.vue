<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'

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
    const [year, month, day] = currentDateValue.value.split('-').map(Number)
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
</script>

<template>
  <UPopover v-model:open="isOpen" :content="{ align: 'start', collisionPadding: 16 }">
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
        {{ formatRelativeDate(currentDateValue, 'Échéance') }}
      </span>
    </UButton>

    <template #content>
      <div class="p-2">
        <!-- Header with current selection -->
        <div class="px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-center">
          {{ currentDateValue ? formatDateFull(currentDateValue) : 'Aucune date sélectionnée' }}
        </div>

        <!-- Presets -->
        <div class="space-y-1 mb-3">
          <button
            v-for="preset in datePresets"
            :key="preset.value"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
            @click="clearDate"
          >
            <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
            <span class="text-sm">Aucune date</span>
          </button>
        </div>

        <!-- Separator -->
        <div class="border-t border-gray-100 dark:border-gray-800 mb-3" />

        <!-- Calendar -->
        <UCalendar
          v-model="calendarValue"
          class="w-full"
          @update:model-value="onCalendarSelect"
        />
      </div>
    </template>
  </UPopover>
</template>
