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

const { formatRelativeDate, extractDatePart, isOverdue: checkOverdue, formatDateFull } = useDateFormat()
const { datePresets } = useDatePresets()

const isOpen = ref(false)

const currentDateValue = computed(() => extractDatePart(props.modelValue))

const isOverdue = computed(() => checkOverdue(props.modelValue))

const selectPreset = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const clearDate = () => {
  emit('update:modelValue', '')
  isOpen.value = false
}

const onCalendarSelect = (value: string) => {
  emit('update:modelValue', value)
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
        <div class="flex flex-col h-[85vh]">
          <!-- Header -->
          <div class="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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

          <!-- Current date display -->
          <div class="flex-shrink-0 px-4 py-3 mx-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            {{ currentDateValue ? formatDateFull(currentDateValue) : 'Aucune date sélectionnée' }}
          </div>

          <!-- Presets -->
          <div class="flex-shrink-0 space-y-1 px-4 mt-2">
            <button
              v-for="preset in datePresets"
              :key="preset.value"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
              @click="clearDate"
            >
              <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
              <span class="text-sm">Aucune date</span>
            </button>
          </div>

          <!-- Infinite scroll calendar -->
          <div class="flex-1 min-h-0 px-4 mt-4">
            <UiCalendarScroll
              :model-value="currentDateValue"
              @update:model-value="onCalendarSelect"
            />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
