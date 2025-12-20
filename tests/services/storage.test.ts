import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '../../app/services/storage/localStorage'

interface TestEntity {
  id: string
  name: string
  createdAt: string
}

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter<TestEntity>
  
  beforeEach(() => {
    localStorage.clear()
    adapter = new LocalStorageAdapter<TestEntity>('test-entities')
  })

  describe('getAll', () => {
    it('returns empty array when no data exists', async () => {
      const items = await adapter.getAll()
      expect(items).toEqual([])
    })

    it('returns all stored items', async () => {
      const entity = await adapter.create({ name: 'Test' })
      const items = await adapter.getAll()
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Test')
      expect(items[0].id).toBe(entity.id)
    })
  })

  describe('getById', () => {
    it('returns null when item does not exist', async () => {
      const item = await adapter.getById('non-existent')
      expect(item).toBeNull()
    })

    it('returns the item when it exists', async () => {
      const created = await adapter.create({ name: 'Test' })
      const item = await adapter.getById(created.id)
      expect(item).not.toBeNull()
      expect(item?.name).toBe('Test')
    })
  })

  describe('create', () => {
    it('creates an item with generated id and createdAt', async () => {
      const item = await adapter.create({ name: 'New Item' })
      expect(item.id).toBeDefined()
      expect(item.createdAt).toBeDefined()
      expect(item.name).toBe('New Item')
    })

    it('adds the item to storage', async () => {
      await adapter.create({ name: 'Item 1' })
      await adapter.create({ name: 'Item 2' })
      const items = await adapter.getAll()
      expect(items).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('updates an existing item', async () => {
      const created = await adapter.create({ name: 'Original' })
      const updated = await adapter.update(created.id, { name: 'Updated' })
      expect(updated.name).toBe('Updated')
      expect(updated.id).toBe(created.id)
    })

    it('throws error when item does not exist', async () => {
      await expect(
        adapter.update('non-existent', { name: 'Test' })
      ).rejects.toThrow()
    })

    it('preserves id and createdAt', async () => {
      const created = await adapter.create({ name: 'Original' })
      const updated = await adapter.update(created.id, { name: 'Updated' })
      expect(updated.id).toBe(created.id)
      expect(updated.createdAt).toBe(created.createdAt)
    })
  })

  describe('delete', () => {
    it('removes an existing item', async () => {
      const created = await adapter.create({ name: 'To Delete' })
      await adapter.delete(created.id)
      const items = await adapter.getAll()
      expect(items).toHaveLength(0)
    })

    it('does not throw when item does not exist', async () => {
      await expect(adapter.delete('non-existent')).resolves.not.toThrow()
    })
  })

  describe('clear', () => {
    it('removes all items', async () => {
      await adapter.create({ name: 'Item 1' })
      await adapter.create({ name: 'Item 2' })
      await adapter.clear()
      const items = await adapter.getAll()
      expect(items).toHaveLength(0)
    })
  })

  describe('setAll', () => {
    it('replaces all items', async () => {
      await adapter.create({ name: 'Old Item' })
      const newItems: TestEntity[] = [
        { id: 'id-1', name: 'New 1', createdAt: new Date().toISOString() },
        { id: 'id-2', name: 'New 2', createdAt: new Date().toISOString() }
      ]
      await adapter.setAll(newItems)
      const items = await adapter.getAll()
      expect(items).toHaveLength(2)
      expect(items[0].name).toBe('New 1')
    })
  })
})
