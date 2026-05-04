export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          name: string
          accent_color: string | null
          position: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          accent_color?: string | null
          position?: number
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          accent_color?: string | null
          position?: number
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      columns: {
        Row: {
          id: string
          board_id: string
          name: string
          wip_limit: number
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          wip_limit?: number
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          wip_limit?: number
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'columns_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          column_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          due_date: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          column_id: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          due_date?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          column_id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          due_date?: string | null
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_column_id_fkey'
            columns: ['column_id']
            isOneToOne: false
            referencedRelation: 'columns'
            referencedColumns: ['id']
          },
        ]
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          is_completed: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          is_completed?: boolean
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          is_completed?: boolean
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subtasks_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
