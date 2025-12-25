export default defineNuxtPlugin(async () => {
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()
  const { subscribe } = useRealtimeSync()

  // Charger les données depuis Supabase au démarrage
  await Promise.all([
    projectsStore.fetchAll(),
    tasksStore.fetchAll()
  ])

  // Activer la synchronisation en temps réel
  subscribe()
})
