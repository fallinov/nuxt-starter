# Nuxt CRUD Starter

Un starter Nuxt réutilisable démontrant une architecture CRUD générique via une application de gestion de tâches (Tasks + Projects).

## Stack technique

| Outil      | Version    | Usage                          |
|------------|------------|--------------------------------|
| Nuxt       | 4.x        | Framework                      |
| Nuxt UI    | 4.x        | Composants UI                  |
| Supabase   | latest     | Backend (Auth, DB, Realtime)   |
| Pinia      | 2.x        | State management               |
| Zod        | latest     | Validation des données         |
| Vitest     | latest     | Tests unitaires                |
| TypeScript | strict     | Typage                         |
| pnpm       | latest     | Gestionnaire de paquets        |

## Installation

```bash
# Cloner le repository
git clone <url>
cd nuxt-crud-starter

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos credentials Supabase

# Lancer le serveur de développement
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`.

### Variables d'environnement

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Initialisation de la base de données

Le schéma SQL se trouve dans **[`supabase/schema.sql`](./supabase/schema.sql)**.

1. Créer un projet sur [Supabase](https://supabase.com)
2. Ouvrir le SQL Editor (Dashboard > SQL Editor)
3. Copier/coller le contenu de `supabase/schema.sql` et exécuter
4. Activer Realtime pour les tables `projects` et `tasks` (Dashboard > Database > Replication)

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
│   │   ├── tasks/          # Composants tâches (List, Item, Form, Filters, DateSheet)
│   │   └── ui/             # Composants UI réutilisables
│   ├── composables/        # Composables Vue (useConfirm, useNotification, useRealtimeSync)
│   ├── layouts/            # Layouts Nuxt
│   ├── pages/              # Pages (index, projects, tasks, login, signup, confirm)
│   ├── services/
│   │   └── storage/        # Abstraction du stockage (SupabaseAdapter, LocalStorageAdapter)
│   ├── stores/             # Stores Pinia
│   └── types/              # Types TypeScript et schémas Zod
├── tests/                  # Tests unitaires
├── supabase/
│   └── schema.sql          # Schéma SQL de la base de données
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
   SupabaseAdapter (implémentation actuelle)
        ↓
   Supabase (PostgreSQL + Realtime)
```

> **Note :** Un `LocalStorageAdapter` est également disponible pour le développement offline ou les tests.

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

## Authentification

L'application utilise Supabase Auth pour l'authentification :

- **`/login`** - Connexion par email/mot de passe
- **`/signup`** - Inscription avec confirmation par email
- **`/confirm`** - Page de redirection après confirmation

Les données sont automatiquement isolées par utilisateur (filtrage par `user_id`).

### Configuration Supabase Auth

```typescript
// nuxt.config.ts
supabase: {
  redirect: true,
  redirectOptions: {
    login: '/login',
    callback: '/confirm',
    exclude: ['/login', '/signup', '/confirm']
  }
}
```

## Synchronisation temps réel

Le composable `useRealtimeSync` permet la synchronisation automatique entre clients :

```typescript
const { subscribe, unsubscribe } = useRealtimeSync()

// S'abonner aux changements (INSERT, UPDATE, DELETE)
await subscribe()

// Se désabonner
unsubscribe()
```

Les modifications faites par un utilisateur sont immédiatement visibles sur tous ses appareils connectés.

## Personnalisation du backend

Pour utiliser un autre backend, créer un nouvel adapter implémentant `StorageAdapter<T>` dans `app/services/storage/` et modifier la factory dans `index.ts`.

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

### Dashboard
- Statistiques cliquables (projets, tâches, haute priorité, en retard)
- Sections de tâches : En retard, Aujourd'hui, Pas de date
- Bouton flottant pour créer une tâche
- Accès rapide aux projets récents

### Projets
- Liste des projets
- Création de projet
- Suppression avec cascade (supprime les tâches associées)

### Tâches
- Liste des tâches avec filtres (projet, priorité, recherche)
- Création/modification/suppression de tâche
- Priorités : basse, moyenne, haute
- Date d'échéance (optionnelle)
- Complétion avec toast d'annulation (style Todoist)
- Tâches terminées affichées en fin de liste

### UX Mobile
- Interface optimisée pour mobile (marges réduites, texte plus grand)
- Swipe vers la gauche pour reprogrammer une tâche
- Bottom sheet avec presets de dates (Aujourd'hui, Demain, Week-end, etc.)
- Touch targets agrandis pour faciliter l'interaction
- Bouton flottant d'ajout de tâche

### UI
- Mode sombre/clair
- Responsive (mobile/desktop)
- Notifications toast avec actions
- Modales de confirmation
- États vides avec appel à l'action

## Licence

MIT
