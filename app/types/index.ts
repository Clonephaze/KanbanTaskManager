// Single source of truth for all data shapes.
// These mirror data.json - import from here, never redefine inline.

export interface Subtask {
  title: string
  isCompleted: boolean
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  title: string
  description: string
  status: string       // Must match a Column.name within the same board
  subtasks: Subtask[]
  priority?: Priority
  dueDate?: string     // ISO date string e.g. '2025-06-30'
}

export interface Column {
  name: string
  tasks: Task[]
  wipLimit?: number    // max tasks allowed (0 = no limit)
}

export interface Column {
  name: string
  tasks: Task[]
}

export interface Board {
  name: string
  columns: Column[]
  accentColor?: string  // hex - drives column dots + active board highlight
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
