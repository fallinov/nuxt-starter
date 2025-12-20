<script setup lang="ts">
definePageMeta({
  title: 'Tâches'
})
</script>

<template>
  <ClientOnly>
    <TaskList />
    <template #fallback>
      <div class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
      </div>
    </template>
  </ClientOnly>
</template>
