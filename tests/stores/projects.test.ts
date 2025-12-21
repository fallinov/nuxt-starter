import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock the storage service
vi.mock('../../app/services/storage', () => {
  let items: any[] = []
  return {
    createStorageService: () => ({
      getAll: vi.fn(async () => items),
      getById: vi.fn(async (id: string) => items.find(i => i.id === id) || null),
      create: vi.fn(async (data: any) => {
        const newItem = { 
          ...data, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString() 
        }
        items.push(newItem)
        return newItem
      }),
      update: vi.fn(async (id: string, data: any) => {
        const index = items.findIndex(i => i.id === id)
        if (index !== -1) {
          items[index] = { ...items[index], ...data }
          return items[index]
        }
        throw new Error('Not found')
      }),
      delete: vi.fn(async (id: string) => {
        items = items.filter(i => i.id !== id)
      }),
      deleteByField: vi.fn(async (field: string, value: any) => {
        items = items.filter(i => i[field] !== value)
      }),
      clear: vi.fn(async () => {
        items = []
      }),
      setAll: vi.fn(async (newItems: any[]) => {
        items = newItems
      })
    }),
    STORAGE_KEYS: {
      PROJECTS: 'test-projects',
      TASKS: 'test-tasks'
    }
  }
})

// Import after mocking
import { useProjectsStore } from '../../app/stores/projects'
import { useTasksStore } from '../../app/stores/tasks'

describe('useProjectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty state', () => {
    const store = useProjectsStore()
    expect(store.items).toEqual([])
    expect(store.selected).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('creates a project', async () => {
    const store = useProjectsStore()
    const project = await store.create({ name: 'Test Project' })
    
    expect(project.id).toBeDefined()
    expect(project.name).toBe('Test Project')
    expect(project.createdAt).toBeDefined()
    expect(store.items).toHaveLength(1)
  })

  it('updates a project', async () => {
    const store = useProjectsStore()
    const project = await store.create({ name: 'Original' })
    const updated = await store.update(project.id, { name: 'Updated' })
    
    expect(updated.name).toBe('Updated')
    expect(store.items[0].name).toBe('Updated')
  })

  it('removes a project', async () => {
    const store = useProjectsStore()
    // Initialize tasks store so it's available for cascade delete
    useTasksStore()

    const project = await store.create({ name: 'To Delete' })
    await store.remove(project.id)

    expect(store.items).toHaveLength(0)
  })

  it('selects a project', async () => {
    const store = useProjectsStore()
    const project = await store.create({ name: 'Test' })
    store.selectProject(project)
    
    expect(store.selected).toEqual(project)
  })

  it('gets project by id', async () => {
    const store = useProjectsStore()
    const project = await store.create({ name: 'Test' })
    const found = store.getById(project.id)
    
    expect(found).toEqual(project)
  })

  it('returns sorted projects by date', async () => {
    const store = useProjectsStore()
    await store.create({ name: 'First' })
    // Add small delay to ensure different timestamps
    await new Promise(r => setTimeout(r, 10))
    await store.create({ name: 'Second' })

    expect(store.sortedByDate[0].name).toBe('Second')
    expect(store.sortedByDate[1].name).toBe('First')
  })
})
