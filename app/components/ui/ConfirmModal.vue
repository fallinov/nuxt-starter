<script setup lang="ts">
const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <UModal
    :model-value="isOpen"
    :prevent-close="true"
  >
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-triangle-alert"
            class="size-6 text-yellow-500"
          />
          <h3 class="text-lg font-semibold">
            {{ options.title }}
          </h3>
        </div>
      </template>

      <p class="text-gray-600 dark:text-gray-300">
        {{ options.message }}
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :label="options.cancelLabel"
            @click="handleCancel"
          />
          <UButton
            :color="options.confirmColor"
            :label="options.confirmLabel"
            @click="handleConfirm"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
