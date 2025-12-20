<script setup lang="ts">
const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <UModal
    :model-value="isOpen"
    :prevent-close="true"
    :ui="{ width: 'sm:max-w-md' }"
  >
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-6 h-6 text-yellow-500"
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
            color="gray"
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
