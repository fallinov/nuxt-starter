import { LocalStorageAdapter } from './localStorage'
import type { StorageService } from './types'

export type { StorageService, StorageAdapter } from './types'

interface BaseEntity {
  id: string
  createdAt: string
}

export function createStorageService<T extends BaseEntity>(key: string): StorageService<T> {
  // Pour passer à une API ou autre backend, remplacer LocalStorageAdapter ici
  // Exemple: return new ApiAdapter<T>(key)
  return new LocalStorageAdapter<T>(key)
}

export const STORAGE_KEYS = {
  PROJECTS: 'nuxt-crud-projects',
  TASKS: 'nuxt-crud-tasks'
} as const
