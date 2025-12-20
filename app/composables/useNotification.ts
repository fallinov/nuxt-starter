type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  timeout?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const notify = (options: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID()
    const notification: Notification = {
      id,
      timeout: 5000,
      ...options
    }
    
    notifications.value.push(notification)

    if (notification.timeout && notification.timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, notification.timeout)
    }

    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string) => {
    return notify({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    return notify({ type: 'error', title, message })
  }

  const warning = (title: string, message?: string) => {
    return notify({ type: 'warning', title, message })
  }

  const info = (title: string, message?: string) => {
    return notify({ type: 'info', title, message })
  }

  return {
    notifications: computed(() => notifications.value),
    notify,
    remove,
    success,
    error,
    warning,
    info
  }
}
