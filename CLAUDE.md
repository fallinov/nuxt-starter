# CLAUDE.md - Nuxt CRUD Starter

## Description du projet

Starter Nuxt 3 démontrant une architecture CRUD générique via une application de gestion de tâches (Tasks + Projects).

## Stack technique

- **Nuxt 3.x** avec compatibilité version 4
- **Nuxt UI 2.x** pour les composants UI
- **Pinia 2.x** pour la gestion d'état
- **Zod** pour la validation des schémas
- **Vitest** pour les tests unitaires
- **TypeScript** en mode strict

## Structure du projet

```
app/
├── components/
│   ├── projects/      # Composants CRUD projets (ProjectCard, ProjectForm, ProjectList)
│   ├── tasks/         # Composants CRUD tâches (TaskCard, TaskForm, TaskList, TaskFilters)
│   └── ui/            # Composants UI réutilisables (ConfirmModal, EmptyState, NotificationToast)
├── composables/       # useConfirm, useNotification
├── layouts/           # Layout par défaut avec navigation
├── pages/             # Pages (index, projects, tasks)
├── services/storage/  # Abstraction stockage (LocalStorageAdapter)
├── stores/            # Stores Pinia (projects, tasks)
└── types/             # Types TypeScript et schémas Zod
seeds/                 # Données de démonstration
tests/                 # Tests unitaires Vitest
```

## Conventions importantes

### Composants
- Les composants dans `components/ui/` utilisent le préfixe `Ui` (ex: `UiConfirmModal`, `UiNotificationToast`)
- Les composants dans `components/projects/` utilisent le préfixe `Project` (ex: `ProjectCard`)
- Les composants dans `components/tasks/` utilisent le préfixe `Task` (ex: `TaskCard`)

### SSR / Hydratation
- Les pages utilisant localStorage sont wrappées dans `<ClientOnly>` pour éviter les erreurs d'hydratation
- Le `LocalStorageAdapter` vérifie `isClient()` à chaque accès (pas de cache du flag)

### TypeScript
- Mode strict activé
- Les tests sont exclus du tsconfig pour éviter les erreurs de build
- Utiliser `as any` pour les types complexes de Nuxt UI si nécessaire

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Tests
npm run test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck
```

## Architecture CRUD

### Entités
- **Project**: id, name, createdAt, updatedAt
- **Task**: id, title, description, status, priority, projectId, createdAt, updatedAt

### Storage Adapter Pattern
L'interface `StorageAdapter<T>` permet de remplacer facilement localStorage par une API REST:
- `getAll(): Promise<T[]>`
- `getById(id: string): Promise<T | null>`
- `create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>`
- `update(id: string, data: Partial<T>): Promise<T>`
- `delete(id: string): Promise<void>`

### Stores Pinia
Chaque store expose:
- `items`: liste des entités
- `loading`, `error`: états de chargement
- `fetchAll()`, `fetchById()`, `create()`, `update()`, `remove()`
- Getters: `sortedByDate`, `getById`

## Données de test

Pour charger les données de démonstration:
1. Aller sur le Dashboard (page d'accueil)
2. Cliquer sur "Charger les données de démo"

## Déploiement

Le projet est configuré pour Vercel avec:
- Build command: `npm run build`
- Output directory: `.output`
