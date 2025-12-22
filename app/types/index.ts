import { z } from 'zod'

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  isDefault: z.boolean().optional(),
  createdAt: z.string().datetime()
})

export const TaskSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Le libellé est requis').max(200, 'Le libellé ne peut pas dépasser 200 caractères'),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
  dueDate: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().uuid(),
  completedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime()
})

export const CreateProjectSchema = ProjectSchema.omit({ id: true, createdAt: true })
export const UpdateProjectSchema = ProjectSchema.partial().omit({ id: true, createdAt: true })

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true })
export const UpdateTaskSchema = TaskSchema.partial().omit({ id: true, createdAt: true })

export type Project = z.infer<typeof ProjectSchema>
export type Task = z.infer<typeof TaskSchema>
export type CreateProject = z.infer<typeof CreateProjectSchema>
export type UpdateProject = z.infer<typeof UpdateProjectSchema>
export type CreateTask = z.infer<typeof CreateTaskSchema>
export type UpdateTask = z.infer<typeof UpdateTaskSchema>
export type Priority = Task['priority']

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute'
}

export const PRIORITY_COLORS = {
  low: 'neutral',
  medium: 'warning',
  high: 'error'
} as const
