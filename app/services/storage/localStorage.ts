import type { StorageAdapter } from './types'

interface BaseEntity {
  id: string
  createdAt: string
}

export class LocalStorageAdapter<T extends BaseEntity> implements StorageAdapter<T> {
  private memoryFallback: T[] = []

  constructor(public readonly key: string) {}

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  private getItems(): T[] {
    if (!this.isClient()) {
      return this.memoryFallback
    }
    try {
      const data = localStorage.getItem(this.key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Erreur de lecture LocalStorage pour ${this.key}:`, error)
      return []
    }
  }

  private setItems(items: T[]): void {
    if (!this.isClient()) {
      this.memoryFallback = items
      return
    }
    try {
      localStorage.setItem(this.key, JSON.stringify(items))
    } catch (error) {
      console.error(`Erreur d'écriture LocalStorage pour ${this.key}:`, error)
    }
  }

  async getAll(): Promise<T[]> {
    return this.getItems()
  }

  async getById(id: string): Promise<T | null> {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const items = this.getItems()
    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    } as T
    items.push(newItem)
    this.setItems(items)
    return newItem
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Élément avec l'id ${id} non trouvé`)
    }
    const { id: _id, createdAt: _createdAt, ...updateData } = data as Record<string, unknown>
    items[index] = { ...items[index], ...updateData } as T
    this.setItems(items)
    return items[index] as T
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      console.warn(`Élément avec l'id ${id} non trouvé pour suppression`)
      return
    }
    items.splice(index, 1)
    this.setItems(items)
  }

  async deleteByField(field: keyof T, value: unknown): Promise<void> {
    const items = this.getItems()
    const filtered = items.filter(item => item[field] !== value)
    this.setItems(filtered)
  }

  async clear(): Promise<void> {
    this.setItems([])
  }

  async setAll(items: T[]): Promise<void> {
    this.setItems(items)
  }
}
