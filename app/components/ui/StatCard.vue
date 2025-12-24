<script setup lang="ts">
type StatCardColor = 'primary' | 'blue' | 'red' | 'yellow' | 'green' | 'orange'

interface Props {
  value: number | string
  label: string
  icon: string
  color?: StatCardColor
}

withDefaults(defineProps<Props>(), {
  color: 'primary'
})

const colorClasses: Record<StatCardColor, { bg: string; icon: string }> = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400'
  }
}
</script>

<template>
  <UCard class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer h-full">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-lg" :class="colorClasses[color].bg">
        <UIcon :name="icon" class="size-6" :class="colorClasses[color].icon" />
      </div>
      <div>
        <p class="text-2xl font-bold">{{ value }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
      </div>
    </div>
  </UCard>
</template>
