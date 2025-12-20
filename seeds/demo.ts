import type { Project, Task } from '~/types'

export const seedData: { projects: Project[]; tasks: Task[] } = {
  projects: [
    { 
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Site vitrine',
      createdAt: '2025-01-15T10:00:00.000Z'
    },
    { 
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      name: 'Application mobile',
      createdAt: '2025-02-01T14:30:00.000Z'
    },
    { 
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'API Backend',
      createdAt: '2025-02-10T09:00:00.000Z'
    }
  ],
  tasks: [
    { 
      id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      label: 'Maquettes Figma',
      dueDate: '2025-02-10T00:00:00.000Z',
      priority: 'high',
      projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      createdAt: '2025-01-16T09:00:00.000Z'
    },
    { 
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      label: 'Intégration header',
      dueDate: '2025-02-15T00:00:00.000Z',
      priority: 'medium',
      projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      createdAt: '2025-01-17T11:00:00.000Z'
    },
    { 
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      label: 'Responsive footer',
      dueDate: '2025-02-20T00:00:00.000Z',
      priority: 'low',
      projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      createdAt: '2025-01-18T14:00:00.000Z'
    },
    { 
      id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
      label: 'Setup React Native',
      dueDate: '2025-02-20T00:00:00.000Z',
      priority: 'high',
      projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      createdAt: '2025-02-02T08:00:00.000Z'
    },
    { 
      id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
      label: 'Navigation stack',
      dueDate: '2025-02-25T00:00:00.000Z',
      priority: 'medium',
      projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      createdAt: '2025-02-03T10:00:00.000Z'
    },
    { 
      id: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
      label: 'Configuration base de données',
      dueDate: '2025-02-12T00:00:00.000Z',
      priority: 'high',
      projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      createdAt: '2025-02-11T08:30:00.000Z'
    },
    { 
      id: 'd0e1f2a3-b4c5-6789-defa-890123456789',
      label: 'Endpoints CRUD utilisateurs',
      dueDate: '2025-02-18T00:00:00.000Z',
      priority: 'medium',
      projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      createdAt: '2025-02-12T09:00:00.000Z'
    }
  ]
}
