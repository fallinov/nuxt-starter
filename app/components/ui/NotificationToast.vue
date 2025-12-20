<script setup lang="ts">
const { notifications, remove } = useNotification()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'i-heroicons-check-circle'
    case 'error': return 'i-heroicons-x-circle'
    case 'warning': return 'i-heroicons-exclamation-triangle'
    case 'info': return 'i-heroicons-information-circle'
    default: return 'i-heroicons-bell'
  }
}

const getColor = (type: string) => {
  switch (type) {
    case 'success': return 'green'
    case 'error': return 'red'
    case 'warning': return 'yellow'
    case 'info': return 'blue'
    default: return 'gray'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
    <TransitionGroup name="notification">
      <UAlert
        v-for="notification in notifications"
        :key="notification.id"
        :icon="getIcon(notification.type)"
        :color="getColor(notification.type)"
        :title="notification.title"
        :description="notification.message"
        :close-button="{ icon: 'i-heroicons-x-mark', color: 'gray', variant: 'ghost' }"
        class="shadow-lg"
        @close="remove(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
