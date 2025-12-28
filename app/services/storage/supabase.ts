import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageAdapter } from './types'

interface BaseEntity {
  id: string
  createdAt: string
}

type TableName = 'projects' | 'tasks'

export class SupabaseAdapter<T extends BaseEntity> implements StorageAdapter<T> {
  private getClient: () => SupabaseClient

  constructor(
    public readonly key: string,
    private readonly tableName: TableName
  ) {
    // Lazy client getter - useSupabaseClient() sera appelé au moment de l'exécution
    this.getClient = () => {
      const client = useSupabaseClient()
      if (!client) {
        throw new Error('Supabase client not available')
      }
      return client
    }
  }

  private async getUserId(): Promise<string> {
    const { data: { user } } = await this.getClient().auth.getUser()
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    return user.id
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`Erreur Supabase getAll ${this.tableName}:`, error)
      throw error
    }

    return (data || []).map(this.mapFromDb)
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error(`Erreur Supabase getById ${this.tableName}:`, error)
      throw error
    }

    return data ? this.mapFromDb(data) : null
  }

  async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const dbData = {
      ...this.mapToDb(data as Partial<T>),
      user_id: await this.getUserId()
    }

    const { data: created, error } = await this.getClient()
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error(`Erreur Supabase create ${this.tableName}:`, error)
      throw error
    }

    return this.mapFromDb(created)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { id: _id, createdAt: _createdAt, ...updateData } = data as Record<string, unknown>
    const dbData = this.mapToDb(updateData as Partial<T>)

    const { data: updated, error } = await this.getClient()
      .from(this.tableName)
      .update(dbData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Erreur Supabase update ${this.tableName}:`, error)
      throw error
    }

    return this.mapFromDb(updated)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.getClient()
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Erreur Supabase delete ${this.tableName}:`, error)
      throw error
    }
  }

  async deleteByField(field: keyof T, value: unknown): Promise<void> {
    const dbField = this.camelToSnake(field as string)
    const { error } = await this.getClient()
      .from(this.tableName)
      .delete()
      .eq(dbField, value)

    if (error) {
      console.error(`Erreur Supabase deleteByField ${this.tableName}:`, error)
      throw error
    }
  }

  async clear(): Promise<void> {
    const { error } = await this.getClient()
      .from(this.tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (error) {
      console.error(`Erreur Supabase clear ${this.tableName}:`, error)
      throw error
    }
  }

  async setAll(items: T[]): Promise<void> {
    // Clear existing and insert new items
    await this.clear()

    if (items.length === 0) return

    const dbItems = items.map(item => this.mapToDb(item))

    const { error } = await this.getClient()
      .from(this.tableName)
      .insert(dbItems)

    if (error) {
      console.error(`Erreur Supabase setAll ${this.tableName}:`, error)
      throw error
    }
  }

  // Convertit camelCase en snake_case pour la DB
  private camelToSnake = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }

  // Convertit snake_case en camelCase pour l'app
  private snakeToCamel = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  // Mappe les données de la DB vers le format de l'app
  private mapFromDb = (dbRow: Record<string, unknown>): T => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dbRow)) {
      result[this.snakeToCamel(key)] = value
    }
    return result as T
  }

  // Mappe les données de l'app vers le format de la DB
  private mapToDb = (data: Partial<T>): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[this.camelToSnake(key)] = value
    }
    return result
  }
}
