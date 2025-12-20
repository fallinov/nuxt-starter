# Nuxt CRUD Starter

Un starter Nuxt réutilisable démontrant une architecture CRUD générique via une application de gestion de tâches (Tasks + Projects).

## Stack technique

| Outil      | Version    | Usage                   |
|------------|------------|-------------------------|
| Nuxt       | 3.x        | Framework               |
| Nuxt UI    | 2.x        | Composants UI           |
| Pinia      | 2.x        | State management        |
| Zod        | latest     | Validation des données  |
| Vitest     | latest     | Tests unitaires         |
| TypeScript | strict     | Typage                  |
| pnpm       | latest     | Gestionnaire de paquets |

## Installation

```bash
# Cloner le repository
git clone <url>
cd nuxt-crud-starter

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`.

## Scripts disponibles

```bash
pnpm dev        # Serveur de développement
pnpm build      # Build de production
pnpm preview    # Prévisualisation du build
pnpm test       # Lancer les tests en mode watch
pnpm test:run   # Lancer les tests une fois
```

## Structure du projet

```
├── app/
│   ├── components/
│   │   ├── projects/       # Composants projets (List, Card, Form)
│   │   ├── tasks/          # Composants tâches (List, Card, Form, Filters)
│   │   └── ui/             # Composants UI réutilisables
│   ├── composables/        # Composables Vue (useConfirm, useNotification)
│   ├── layouts/            # Layouts Nuxt
│   ├── pages/              # Pages et routing
│   ├── services/
│   │   └── storage/        # Abstraction du stockage
│   ├── stores/             # Stores Pinia
│   └── types/              # Types TypeScript et schémas Zod
├── tests/                  # Tests unitaires
├── seeds/                  # Données de démonstration
├── nuxt.config.ts
└── vitest.config.ts
```

## Architecture de stockage

Le projet utilise une couche d'abstraction pour le stockage, permettant de changer facilement de backend.

### Flux de données

```
UI (pages/components)
        ↓
   Stores Pinia (source de vérité)
        ↓
   StorageService (interface abstraite)
        ↓
   LocalStorageAdapter (implémentation)
```

### Interface StorageService

```typescript
interface StorageService<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: Omit<T, 'id' | 'createdAt'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  deleteByField(field: keyof T, value: unknown): Promise<void>
  clear(): Promise<void>
  setAll(items: T[]): Promise<void>
}
```

## Remplacer LocalStorage par une API

Pour connecter l'application à une API REST :

1. Créer un nouvel adapter dans `app/services/storage/` :

```typescript
// app/services/storage/apiAdapter.ts
export class ApiAdapter<T> implements StorageService<T> {
  constructor(private endpoint: string) {}

  async getAll(): Promise<T[]> {
    const response = await fetch(this.endpoint)
    return response.json()
  }

  async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // ... implémenter les autres méthodes
}
```

2. Modifier `app/services/storage/index.ts` :

```typescript
import { ApiAdapter } from './apiAdapter'

export function createStorageService<T>(key: string): StorageService<T> {
  const baseUrl = 'https://api.example.com'
  return new ApiAdapter<T>(`${baseUrl}/${key}`)
}
```

## Conventions

### Nommage

| Élément          | Convention                                  | Exemple           |
|------------------|---------------------------------------------|-------------------|
| Composants       | PascalCase                                  | `TaskCard.vue`    |
| Composables      | camelCase + préfixe `use`                   | `useConfirm.ts`   |
| Stores           | camelCase + préfixe `use` + suffixe `Store` | `useTasksStore`   |
| Types/Interfaces | PascalCase                                  | `Task`, `Project` |
| Fichiers TS      | camelCase                                   | `localStorage.ts` |
| Constantes       | SCREAMING_SNAKE_CASE                        | `STORAGE_KEYS`    |

### Commits

Utiliser les commits conventionnels :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Refactoring

## Tests

```bash
# Lancer tous les tests
pnpm test:run

# Lancer les tests en mode watch
pnpm test

# Tests avec couverture
pnpm test:run --coverage
```

## Fonctionnalités

### Projets
- Liste des projets
- Création de projet
- Suppression avec cascade (supprime les tâches associées)

### Tâches
- Liste des tâches avec filtres (projet, priorité, recherche)
- Création de tâche
- Modification de tâche
- Suppression de tâche
- Priorités : basse, moyenne, haute
- Date d'échéance

### UI
- Mode sombre/clair
- Responsive (mobile/desktop)
- Notifications toast
- Modales de confirmation
- États vides avec appel à l'action

## Données de démonstration

Un bouton "Charger données démo" est disponible sur le dashboard lorsque l'application est vide.

## Licence

MIT
