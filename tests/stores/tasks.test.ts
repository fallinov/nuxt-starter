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
import { useTasksStore } from '../../app/stores/tasks'

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty state', () => {
    const store = useTasksStore()
    expect(store.items).toEqual([])
    expect(store.selected).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('creates a task', async () => {
    const store = useTasksStore()
    const task = await store.create({
      label: 'Test Task',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    
    expect(task.id).toBeDefined()
    expect(task.label).toBe('Test Task')
    expect(task.priority).toBe('medium')
    expect(store.items).toHaveLength(1)
  })

  it('updates a task', async () => {
    const store = useTasksStore()
    const task = await store.create({
      label: 'Original',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'low',
      projectId: 'proj-1'
    })
    const updated = await store.update(task.id, { label: 'Updated', priority: 'high' })
    
    expect(updated.label).toBe('Updated')
    expect(updated.priority).toBe('high')
    expect(store.items[0].label).toBe('Updated')
  })

  it('removes a task', async () => {
    const store = useTasksStore()
    const task = await store.create({
      label: 'To Delete',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'low',
      projectId: 'proj-1'
    })
    await store.remove(task.id)
    
    expect(store.items).toHaveLength(0)
  })

  it('filters tasks by priority', async () => {
    const store = useTasksStore()
    await store.create({
      label: 'High Priority',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'high',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Low Priority',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'low',
      projectId: 'proj-1'
    })
    
    store.setFilters({ priority: 'high' })
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].label).toBe('High Priority')
  })

  it('filters tasks by projectId', async () => {
    const store = useTasksStore()
    await store.create({
      label: 'Project 1 Task',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Project 2 Task',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-2'
    })
    
    store.setFilters({ projectId: 'proj-1' })
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].label).toBe('Project 1 Task')
  })

  it('filters tasks by search', async () => {
    const store = useTasksStore()
    await store.create({
      label: 'Setup database',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Write tests',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    
    store.setFilters({ search: 'database' })
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].label).toBe('Setup database')
  })

  it('resets filters', async () => {
    const store = useTasksStore()
    store.setFilters({ projectId: 'proj-1', priority: 'high', search: 'test' })
    store.resetFilters()
    
    expect(store.filters.projectId).toBeNull()
    expect(store.filters.priority).toBeNull()
    expect(store.filters.search).toBe('')
  })

  it('counts tasks by project', async () => {
    const store = useTasksStore()
    await store.create({
      label: 'Task 1',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Task 2',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Task 3',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-2'
    })
    
    expect(store.taskCountByProject('proj-1')).toBe(2)
    expect(store.taskCountByProject('proj-2')).toBe(1)
    expect(store.taskCountByProject('proj-3')).toBe(0)
  })

  it('sorts tasks by due date', async () => {
    const store = useTasksStore()
    await store.create({
      label: 'Later',
      dueDate: '2025-03-15T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    await store.create({
      label: 'Earlier',
      dueDate: '2025-03-01T00:00:00Z',
      priority: 'medium',
      projectId: 'proj-1'
    })
    
    expect(store.sortedByDueDate[0].label).toBe('Earlier')
    expect(store.sortedByDueDate[1].label).toBe('Later')
  })
})
