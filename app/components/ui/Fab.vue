<script setup lang="ts">
interface Props {
  icon?: string
  label?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-plus',
  label: undefined
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="fixed bottom-6 right-6 size-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
    :aria-label="label"
    @click="$emit('click')"
  >
    <slot>
      <UIcon :name="icon" class="size-7" />
    </slot>
  </button>
</template>
