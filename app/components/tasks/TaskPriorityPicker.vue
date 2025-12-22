<script setup lang="ts">
import type { Priority } from '~/types'

interface Props {
  modelValue: Priority
  disabled?: boolean
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showLabel: true
})

const emit = defineEmits<{
  'update:modelValue': [value: Priority]
}>()

const isOpen = ref(false)

// Priority options with Todoist-style numbering (1 = highest)
const priorityOptions = [
  {
    value: 'high' as Priority,
    label: 'Priorité 1',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    fillClass: 'fill-red-500'
  },
  {
    value: 'medium' as Priority,
    label: 'Priorité 2',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    fillClass: 'fill-amber-500'
  },
  {
    value: 'low' as Priority,
    label: 'Priorité 3',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    fillClass: 'fill-blue-500'
  }
]

const selectedOption = computed(() => {
  return priorityOptions.find(opt => opt.value === props.modelValue) || priorityOptions[2]
})

const selectPriority = (value: Priority) => {
  emit('update:modelValue', value)
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
        <svg
          class="size-4"
          :class="selectedOption?.color"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 21V3.99C5 3.44 5.45 3 6 3h12c.55 0 1 .44 1 .99V21l-7-3-7 3z" />
        </svg>
      </template>
      <span v-if="showLabel">{{ selectedOption?.label }}</span>
    </UButton>

    <template #content>
      <div class="w-48 p-2">
        <div class="space-y-1">
          <button
            v-for="option in priorityOptions"
            :key="option.value"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30': modelValue === option.value }"
            @click="selectPriority(option.value)"
          >
            <div class="flex items-center gap-3">
              <svg
                class="size-5"
                :class="option.color"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 21V3.99C5 3.44 5.45 3 6 3h12c.55 0 1 .44 1 .99V21l-7-3-7 3z" />
              </svg>
              <span class="text-sm">{{ option.label }}</span>
            </div>
            <UIcon
              v-if="modelValue === option.value"
              name="i-lucide-check"
              class="size-4 text-primary"
            />
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
