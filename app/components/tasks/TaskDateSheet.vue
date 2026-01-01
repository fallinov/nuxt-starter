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

const { extractDatePart, formatDateWithYear, formatDateShort } = useDateFormat()
const { datePresets } = useDatePresets()

const scrollRef = ref<HTMLElement>()
const isScrolled = ref(false)

const currentDateValue = computed(() => extractDatePart(props.currentDate))

const formattedCurrentDate = computed(() => {
  if (!currentDateValue.value) return 'Aucune date sélectionnée'
  return formatDateWithYear(currentDateValue.value)
})

const selectPreset = (value: string) => {
  emit('select', value)
  emit('update:open', false)
}

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

const onScroll = (event: Event) => {
  const target = event.target as HTMLElement
  isScrolled.value = target.scrollTop > 10
}

// Reset scroll state when opening
watch(() => props.open, (val) => {
  if (val) {
    isScrolled.value = false
    nextTick(() => {
      scrollRef.value?.scrollTo(0, 0)
    })
  }
})
</script>

<template>
  <USlideover
    :open="open"
    side="bottom"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="flex flex-col h-[85vh]">
        <!-- Header - compact when scrolled -->
        <div
          class="flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200"
          :class="isScrolled ? 'py-2' : 'py-3'"
        >
          <button
            class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="close"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>

          <div class="flex flex-col items-center">
            <span class="font-semibold">Date</span>
            <!-- Show compact date when scrolled -->
            <span
              v-if="isScrolled && currentDateValue"
              class="text-xs text-gray-500"
            >
              {{ formatDateShort(currentDateValue) }}
            </span>
          </div>

          <button
            class="p-2 -mr-2 rounded-full bg-gray-200 dark:bg-gray-700"
            @click="confirm"
          >
            <UIcon name="i-lucide-check" class="size-5" />
          </button>
        </div>

        <!-- Scrollable content: everything scrolls together -->
        <div
          ref="scrollRef"
          class="flex-1 overflow-y-auto overscroll-contain"
          @scroll="onScroll"
        >
          <!-- Current date display - hidden when scrolled -->
          <div
            class="px-4 py-3 mx-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center transition-all duration-200"
            :class="{ 'opacity-0 h-0 py-0 mt-0 overflow-hidden': isScrolled }"
          >
            {{ formattedCurrentDate }}
          </div>

          <!-- Presets -->
          <div class="space-y-1 px-4 mt-2">
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

          <!-- Calendar section -->
          <div class="px-4 mt-4 pb-4">
            <!-- Weekday headers -->
            <div class="grid grid-cols-7 text-center text-sm text-gray-500 py-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <span>L</span>
              <span>M</span>
              <span>M</span>
              <span>J</span>
              <span>V</span>
              <span>S</span>
              <span>D</span>
            </div>

            <!-- Calendar months -->
            <UiCalendarScroll
              :model-value="currentDateValue"
              :show-header="false"
              @update:model-value="onCalendarSelect"
            />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
