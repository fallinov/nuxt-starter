export default defineNuxtPlugin(() => {
  const user = useSupabaseUser()
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()
  const { subscribe, unsubscribe } = useRealtimeSync()

  const loadUserData = async () => {
    await Promise.all([
      projectsStore.fetchAll(),
      tasksStore.fetchAll()
    ])
    await subscribe()
  }

  const clearUserData = () => {
    unsubscribe()
    projectsStore.$reset()
    tasksStore.$reset()
  }

  let isInitialized = false
  watch(user, async (newUser) => {
    if (newUser && !isInitialized) {
      isInitialized = true
      await loadUserData()
    } else if (!newUser && isInitialized) {
      isInitialized = false
      clearUserData()
    }
  }, { immediate: true })
})
