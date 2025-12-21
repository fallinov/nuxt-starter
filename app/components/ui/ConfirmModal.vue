<script setup lang="ts">
const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <UModal
    :open="isOpen"
    :dismissible="false"
    @update:open="(value: boolean) => !value && handleCancel()"
  >
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

    <template #body>
      <p class="text-muted">
        {{ options.message }}
      </p>
    </template>

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
  </UModal>
</template>
