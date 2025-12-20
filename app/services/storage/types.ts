export interface StorageService<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: Omit<T, 'id' | 'createdAt'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  deleteByField(field: keyof T, value: unknown): Promise<void>
  clear(): Promise<void>
  setAll(items: T[]): Promise<void>
}

export interface StorageAdapter<T> extends StorageService<T> {
  readonly key: string
}
