export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          is_default: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_default?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_default?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          label: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high'
          project_id: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          project_id: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          project_id?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
