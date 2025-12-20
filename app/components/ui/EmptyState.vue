<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-inbox',
  description: undefined,
  actionLabel: undefined
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <UIcon
      :name="props.icon"
      class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
    />
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ props.title }}
    </h3>
    <p
      v-if="props.description"
      class="text-gray-500 dark:text-gray-400 mb-4 max-w-sm"
    >
      {{ props.description }}
    </p>
    <UButton
      v-if="props.actionLabel"
      :label="props.actionLabel"
      icon="i-heroicons-plus"
      @click="emit('action')"
    />
  </div>
</template>
