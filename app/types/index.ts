// Single source of truth for all data shapes.
// These match the Supabase table columns exactly (snake_case).

export interface Subtask {
  id: string
  title: string
  is_completed: boolean
  position: number
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  status: string         // Mirrors Column.name for the current column
  subtasks: Subtask[]
  priority?: Priority
  due_date?: string      // ISO date string e.g. '2025-06-30'
  position: number
}

export interface Column {
  id: string
  name: string
  tasks: Task[]
  wip_limit: number
  position: number
}

export interface Board {
  id: string
  name: string
  columns: Column[]
  accent_color?: string  // hex - drives column dots + active board highlight
  position: number
}

// Modal types
export type ModalType =
  | 'addTask'
  | 'editTask'
  | 'viewTask'
  | 'addBoard'
  | 'editBoard'
  | 'deleteBoard'
  | 'deleteTask'

export interface ActiveModal {
  type: ModalType
  payload?: unknown
}
