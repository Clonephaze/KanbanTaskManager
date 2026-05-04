// Single source of truth for all data shapes.
// These mirror data.json — import from here, never redefine inline.

export interface Subtask {
  title: string
  isCompleted: boolean
}

export interface Task {
  title: string
  description: string
  status: string       // Must match a Column.name within the same board
  subtasks: Subtask[]
}

export interface Column {
  name: string
  tasks: Task[]
}

export interface Board {
  name: string
  columns: Column[]
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
