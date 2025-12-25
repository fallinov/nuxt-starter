export default defineNuxtPlugin(() => {
  const user = useSupabaseUser()
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()
  const { subscribe, unsubscribe } = useRealtimeSync()

  // Charger les données quand l'utilisateur est connecté
  const loadUserData = async () => {
    await Promise.all([
      projectsStore.fetchAll(),
      tasksStore.fetchAll()
    ])
    await subscribe()
  }

  // Nettoyer les données quand l'utilisateur se déconnecte
  const clearUserData = () => {
    unsubscribe()
    projectsStore.items = []
    tasksStore.items = []
  }

  // Observer les changements d'authentification
  watch(user, async (newUser, oldUser) => {
    if (newUser && !oldUser) {
      // Utilisateur vient de se connecter
      await loadUserData()
    } else if (!newUser && oldUser) {
      // Utilisateur vient de se déconnecter
      clearUserData()
    }
  }, { immediate: true })
})
