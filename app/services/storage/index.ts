import { SupabaseAdapter } from './supabase'
import type { StorageService } from './types'

export type { StorageService, StorageAdapter } from './types'

interface BaseEntity {
  id: string
  createdAt: string
}

// Mapping des clés vers les noms de tables Supabase
const TABLE_MAPPING = {
  'nuxt-crud-projects': 'projects',
  'nuxt-crud-tasks': 'tasks'
} as const

type StorageKey = keyof typeof TABLE_MAPPING

export function createStorageService<T extends BaseEntity>(key: StorageKey): StorageService<T> {
  const tableName = TABLE_MAPPING[key]
  return new SupabaseAdapter<T>(key, tableName)
}

export const STORAGE_KEYS = {
  PROJECTS: 'nuxt-crud-projects',
  TASKS: 'nuxt-crud-tasks'
} as const
