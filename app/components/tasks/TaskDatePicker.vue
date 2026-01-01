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
      <div class="w-72 p-2">
        <!-- Header with current selection -->
        <div class="px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-center">
          {{ currentDateValue ? formatDateFull(currentDateValue) : 'Aucune date' }}
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
