<template>
  <div class="flex items-start gap-3 py-4 px-3 border-b border-gray-100 dark:border-gray-800">
    <!-- Checkbox skeleton -->
    <USkeleton class="size-6 rounded-full flex-shrink-0 mt-0.5" />

    <!-- Content skeleton -->
    <div class="flex-1 min-w-0">
      <!-- Task label -->
      <USkeleton class="h-5 w-3/4 rounded" />

      <!-- Meta info -->
      <div class="flex items-center gap-3 mt-2">
        <USkeleton class="h-4 w-20 rounded" />
        <USkeleton class="h-4 w-24 rounded" />
      </div>
    </div>
  </div>
</template>
