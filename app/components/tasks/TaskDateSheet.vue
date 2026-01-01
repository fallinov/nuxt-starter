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

const { extractDatePart, formatDateWithYear } = useDateFormat()

const currentDateValue = computed(() => extractDatePart(props.currentDate))

const formattedCurrentDate = computed(() => {
  if (!currentDateValue.value) return 'Aucune date sélectionnée'
  return formatDateWithYear(currentDateValue.value)
})

const onCalendarSelect = (value: string) => {
  emit('select', value)
  emit('update:open', false)
}

const clearDate = () => {
  emit('select', '')
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
        <div class="flex-1 overflow-hidden flex flex-col">
          <!-- Current date display -->
          <div class="px-4 py-3 mx-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            {{ formattedCurrentDate }}
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
</template>
