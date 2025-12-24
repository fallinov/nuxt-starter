# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A complete **Nuxt 4 starter template** designed to serve as a foundation for all future Nuxt projects. Demonstrates best practices for resource management applications through a generic CRUD architecture with tasks and projects as the reference implementation.

This starter provides:
- A fully configured development environment with Nuxt 4 and Nuxt UI 4
- Reusable patterns for resource management (create, read, update, delete)
- A sandbox template for building new projects faster

**Tech Stack:**
- Nuxt 4.x (latest framework)
- Nuxt UI 4.x (component library)
- Tailwind CSS (styling)
- Pinia 2.x (state management)
- Zod (schema validation)
- Vitest (unit tests)
- TypeScript (strict mode)
- pnpm (package manager)

## Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Preview
npm run build        # Production build
npm run generate     # Generate static site
npm run preview      # Preview production build locally

# Tests
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (no watch)

# Setup
npm run postinstall  # Auto-run by npm (runs `nuxt prepare`)
```

## Project Structure

The `app/` directory contains the main application:
- **components/** - Vue components organized by domain (projects, tasks, ui)
- **composables/** - Reusable Vue composables (useConfirm, useNotification)
- **layouts/** - Nuxt layouts (default layout with navigation)
- **pages/** - Nuxt pages (index, projects, tasks)
- **services/storage/** - Storage abstraction layer (LocalStorageAdapter)
- **stores/** - Pinia stores (projects, tasks)
- **types/** - TypeScript types and Zod schemas

Other directories:
- **seeds/** - Demo/seed data
- **tests/** - Vitest unit tests

## Key Architecture Patterns

### Component Naming Conventions
- `components/ui/` → prefix `Ui` (e.g., `UiConfirmModal`, `UiNotificationToast`)
- `components/projects/` → prefix `Project` (e.g., `ProjectCard`)
- `components/tasks/` → prefix `Task` (e.g., `TaskCard`)

### Storage Adapter Pattern
The `StorageAdapter<T>` interface provides an abstraction layer:
```typescript
interface StorageAdapter<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  deleteByField(field: keyof T, value: unknown): Promise<void>
  clear(): Promise<void>
  setAll(items: T[]): Promise<void>
}
```
This allows swapping LocalStorageAdapter for an API adapter without changing application code.

### Data Flow
```
UI (pages/components) → Pinia Stores → StorageAdapter → LocalStorage
```

### Pinia Stores
Each store exposes:
- `items` - array of entities
- `loading`, `error` - state flags
- `fetchAll()`, `fetchById()`, `create()`, `update()`, `remove()` - actions
- Getters: `sortedByDate`, `getById`

Tasks store additional features:
- `complete(id)`, `uncomplete(id)` - mark task as done/undone
- `pendingTasks`, `completedTasks` - filtered getters
- `sortedByDueDate` - pending first (sorted by date, no-date at end), then completed
- `filters` - reactive filters state (projectId, priority, search)
- `setFilters()`, `resetFilters()` - filter management

## Important Implementation Details

### SSR & Hydration
- Pages using localStorage must be wrapped in `<ClientOnly>` to avoid hydration errors
- `LocalStorageAdapter.isClient()` is called on each access (no flag caching)

### TypeScript Configuration
- Strict mode enabled in `nuxt.config.ts`
- Tests excluded from `tsconfig.json` to prevent build errors
- May use `as any` for complex Nuxt UI component types if needed

### Development Server
- Runs on port 3000
- Nuxt devtools enabled by default
- Hot module reloading for fast iteration

### Styling & Components
- Tailwind CSS configured via Nuxt UI
- All components from Nuxt UI 4 are auto-imported
- Custom components in `app/components/` are auto-imported by Nuxt

## Reference Entities

The example implementation uses:
- **Project** - id, name, isDefault (optional), createdAt
- **Task** - id, label, description (optional), dueDate (nullable), priority, projectId, completedAt (nullable), createdAt

### Task Schema
```typescript
const TaskSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().nullable(),  // null = no due date
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().uuid(),
  completedAt: z.string().datetime().nullable().optional(),  // null = not completed
  createdAt: z.string().datetime()
})
```

## Key Components

### Task Components
- **TaskItem** - List item with swipe-to-reschedule, completion checkbox, priority colors
  - Props: `task`, `projectName`, `hideActions` (optional)
  - Events: `click`, `complete`, `delete`, `reschedule`
- **TaskDateSheet** - Bottom sheet for quick date selection with presets
- **TaskDatePicker** - Popover date picker with presets and "no date" option
- **TaskDetailModal** - Slideover for viewing/editing task details
- **TaskFilters** - Search, project filter, priority filter

### Mobile UX Patterns
- Swipe left on TaskItem triggers reschedule action
- Touch events: `touchstart`, `touchmove`, `touchend` for gesture handling
- Floating action button (FAB) for quick task creation
- Toast notifications with undo actions (Todoist-style)

## Using This Starter for New Projects

1. **Customize entities:** Modify types in `app/types/` and replace Project/Task with your domain models
2. **Update stores:** Adapt Pinia stores in `app/stores/` for your entities (copy existing store pattern)
3. **Create new components:** Build domain-specific components following the naming conventions
4. **Connect to backend:** Replace `LocalStorageAdapter` with your API adapter (see next section)
5. **Keep seed data:** Update `seeds/` with your demo data

## Switching to API Backend

To replace LocalStorage with a REST API:

1. Create a new adapter in `app/services/storage/apiAdapter.ts`
2. Modify the factory in `app/services/storage/index.ts`
3. No changes needed in stores or components thanks to the adapter abstraction

## Demo Data

Click "Charger les données de démo" button on the dashboard to load sample projects and tasks. This demonstrates the full CRUD flow.
