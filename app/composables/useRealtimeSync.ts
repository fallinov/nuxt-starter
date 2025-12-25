import type { RealtimeChannel } from '@supabase/supabase-js'

type TableName = 'projects' | 'tasks'

/**
 * Converts snake_case to camelCase
 */
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Maps database row (snake_case) to app format (camelCase)
 */
const mapFromDb = <T>(dbRow: Record<string, unknown>): T => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(dbRow)) {
    result[snakeToCamel(key)] = value
  }
  return result as T
}

/**
 * Composable to sync Pinia stores with Supabase Realtime
 */
export function useRealtimeSync() {
  const client = useSupabaseClient()
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()

  let projectsChannel: RealtimeChannel | null = null
  let tasksChannel: RealtimeChannel | null = null

  const subscribeToTable = <T extends { id: string }>(
    tableName: TableName,
    store: { items: T[] }
  ): RealtimeChannel => {
    return client
      .channel(`${tableName}-realtime`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        (payload) => {
          const newItem = mapFromDb<T>(payload.new as Record<string, unknown>)
          // Only add if not already in store (avoid duplicates from own actions)
          if (!store.items.find(item => item.id === newItem.id)) {
            store.items.unshift(newItem)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName },
        (payload) => {
          const updatedItem = mapFromDb<T>(payload.new as Record<string, unknown>)
          const index = store.items.findIndex(item => item.id === updatedItem.id)
          if (index !== -1) {
            store.items[index] = updatedItem
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName },
        (payload) => {
          const deletedId = (payload.old as Record<string, unknown>).id as string
          store.items = store.items.filter(item => item.id !== deletedId)
        }
      )
      .subscribe()
  }

  const subscribe = () => {
    // Subscribe to projects table
    projectsChannel = subscribeToTable('projects', projectsStore)

    // Subscribe to tasks table
    tasksChannel = subscribeToTable('tasks', tasksStore)
  }

  const unsubscribe = () => {
    if (projectsChannel) {
      client.removeChannel(projectsChannel)
      projectsChannel = null
    }
    if (tasksChannel) {
      client.removeChannel(tasksChannel)
      tasksChannel = null
    }
  }

  return {
    subscribe,
    unsubscribe
  }
}
