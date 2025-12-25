-- ============================================
-- Migration: Create projects and tasks tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_default ON projects(is_default) WHERE is_default = TRUE;

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on both tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PUBLIC ACCESS (No Auth)
-- ============================================
-- Ces politiques permettent un accès public complet.
-- Pour une application avec authentification, remplacez par les politiques commentées ci-dessous.

-- Projects: accès public complet
CREATE POLICY "Allow public read on projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on projects"
  ON projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on projects"
  ON projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on projects"
  ON projects FOR DELETE
  TO anon, authenticated
  USING (true);

-- Tasks: accès public complet
CREATE POLICY "Allow public read on tasks"
  ON tasks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on tasks"
  ON tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on tasks"
  ON tasks FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on tasks"
  ON tasks FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- RLS POLICIES - AUTHENTICATED ACCESS (Optional)
-- ============================================
-- Décommentez ces politiques et supprimez les politiques publiques ci-dessus
-- si vous souhaitez restreindre l'accès aux utilisateurs authentifiés uniquement.
--
-- Pour activer l'authentification par utilisateur, ajoutez une colonne user_id:
-- ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- Puis utilisez ces politiques:
--
-- CREATE POLICY "Users can read own projects"
--   ON projects FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert own projects"
--   ON projects FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can update own projects"
--   ON projects FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own projects"
--   ON projects FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);
--
-- (Idem pour tasks)
