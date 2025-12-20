interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'red' | 'primary' | 'gray'
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  options: {
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmColor: 'primary'
  },
  resolve: null
})

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.options = {
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        confirmColor: 'primary',
        ...options
      }
      state.resolve = resolve
      state.isOpen = true
    })
  }

  const handleConfirm = () => {
    if (state.resolve) {
      state.resolve(true)
    }
    state.isOpen = false
    state.resolve = null
  }

  const handleCancel = () => {
    if (state.resolve) {
      state.resolve(false)
    }
    state.isOpen = false
    state.resolve = null
  }

  return {
    isOpen: computed(() => state.isOpen),
    options: computed(() => state.options),
    confirm,
    handleConfirm,
    handleCancel
  }
}
