<template>
  <UCard>
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <!-- Project name -->
        <USkeleton class="h-6 w-32 rounded" />

        <!-- Meta info -->
        <div class="flex items-center gap-4 mt-3">
          <USkeleton class="h-4 w-24 rounded" />
          <USkeleton class="h-4 w-16 rounded" />
        </div>
      </div>

      <!-- Action button skeleton -->
      <USkeleton class="size-8 rounded" />
    </div>
  </UCard>
</template>
