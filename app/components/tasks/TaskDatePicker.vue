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
          <div class="flex-1 overflow-hidden flex flex-col">
            <!-- Current date display -->
            <div class="px-4 py-3 mx-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              {{ currentDateValue ? formatDateFull(currentDateValue) : 'Aucune date sélectionnée' }}
            </div>

            <!-- No date option -->
            <button
              class="flex items-center gap-4 px-4 py-3 mx-4 mt-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/30': !currentDateValue }"
              @click="clearDate"
            >
              <UIcon name="i-lucide-ban" class="size-5 text-gray-400" />
              <span class="text-base">Aucune date</span>
            </button>

            <!-- Infinite scroll calendar -->
            <div class="flex-1 overflow-hidden px-4 mt-2">
              <UiCalendarScroll
                :model-value="currentDateValue"
                @update:model-value="onCalendarSelect"
              />
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
