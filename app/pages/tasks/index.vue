<script setup lang="ts">
definePageMeta({
  title: 'Tâches'
})
</script>

<template>
  <ClientOnly>
    <TasksTaskList />
    <template #fallback>
      <div class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>
    </template>
  </ClientOnly>
</template>
