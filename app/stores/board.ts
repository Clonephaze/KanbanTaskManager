import { defineStore } from 'pinia'
import type { Board, Column, Task, Subtask } from '~/types'
import seedData from '~/data/data.json'

const STORAGE_KEY = 'kanban-boards'

export const useBoardStore = defineStore('board', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const boards = ref<Board[]>([])
  const activeBoardIndex = ref(0)

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const activeBoard = computed<Board | undefined>(() => boards.value[activeBoardIndex.value])

  // ---------------------------------------------------------------------------
  // Init - seed from localStorage, fall back to data.json
  // ---------------------------------------------------------------------------
  function init() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { boards: Board[]; activeBoardIndex: number }
        boards.value = parsed.boards
        activeBoardIndex.value = parsed.activeBoardIndex ?? 0
        return
      } catch {
        // Corrupted data - fall through to seed
      }
    }
    boards.value = (seedData as { boards: Board[] }).boards
    activeBoardIndex.value = 0
  }

  // ---------------------------------------------------------------------------
  // Persist - called after every mutation
  // ---------------------------------------------------------------------------
  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      boards: boards.value,
      activeBoardIndex: activeBoardIndex.value,
    }))
  }

  // ---------------------------------------------------------------------------
  // Board actions
  // ---------------------------------------------------------------------------
  function setActiveBoard(index: number) {
    activeBoardIndex.value = index
    persist()
  }

  function addBoard(name: string, columnNames: string[], accentColor?: string, wipLimits?: number[]) {
    const newBoard: Board = {
      name,
      columns: columnNames.filter(n => n.trim()).map((n, i) => ({ name: n, tasks: [], wipLimit: wipLimits?.[i] ?? 0 })),
      accentColor,
    }
    boards.value.push(newBoard)
    activeBoardIndex.value = boards.value.length - 1
    persist()
  }

  function updateBoard(name: string, columnNames: string[], accentColor?: string, wipLimits?: number[]) {
    const board = activeBoard.value
    if (!board) return

    board.name = name
    if (accentColor !== undefined) board.accentColor = accentColor

    // Preserve existing tasks when column names match; drop removed columns
    const updatedColumns: Column[] = columnNames
      .filter(n => n.trim())
      .map((n, i) => {
        const existing = board.columns.find(c => c.name === n)
        const wip = wipLimits?.[i] ?? existing?.wipLimit ?? 0
        return existing ? { ...existing, wipLimit: wip } : { name: n, tasks: [], wipLimit: wip }
      })

    board.columns = updatedColumns
    persist()
  }

  function deleteBoard() {
    boards.value.splice(activeBoardIndex.value, 1)
    activeBoardIndex.value = Math.max(0, activeBoardIndex.value - 1)
    persist()
  }

  // ---------------------------------------------------------------------------
  // Task actions
  // ---------------------------------------------------------------------------
  function addTask(task: Omit<Task, 'subtasks'> & { subtasks: Subtask[] }) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === task.status)
    if (!column) return
    column.tasks.push({ ...task })
    persist()
  }

  function updateTask(originalTitle: string, originalStatus: string, updated: Task) {
    const board = activeBoard.value
    if (!board) return

    // Remove from original column
    const srcColumn = board.columns.find(c => c.name === originalStatus)
    if (srcColumn) {
      const idx = srcColumn.tasks.findIndex(t => t.title === originalTitle)
      if (idx !== -1) srcColumn.tasks.splice(idx, 1)
    }

    // Add to destination column
    const destColumn = board.columns.find(c => c.name === updated.status)
    if (destColumn) {
      destColumn.tasks.push({ ...updated })
    }

    persist()
  }

  function deleteTask(columnName: string, taskTitle: string) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === columnName)
    if (!column) return
    const idx = column.tasks.findIndex(t => t.title === taskTitle)
    if (idx !== -1) column.tasks.splice(idx, 1)
    persist()
  }

  function moveTask(taskTitle: string, fromColumn: string, toColumn: string) {
    const board = activeBoard.value
    if (!board) return

    const src = board.columns.find(c => c.name === fromColumn)
    const dest = board.columns.find(c => c.name === toColumn)
    if (!src || !dest) return

    const idx = src.tasks.findIndex(t => t.title === taskTitle)
    if (idx === -1) return

    const task = src.tasks.splice(idx, 1)[0]
    if (!task) return
    task.status = toColumn
    dest.tasks.push(task)
    persist()
  }

  function toggleSubtask(columnName: string, taskTitle: string, subtaskTitle: string) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === columnName)
    if (!column) return
    const task = column.tasks.find(t => t.title === taskTitle)
    if (!task) return
    const subtask = task.subtasks.find(s => s.title === subtaskTitle)
    if (!subtask) return
    subtask.isCompleted = !subtask.isCompleted
    persist()
  }

  return {
    // State
    boards,
    activeBoardIndex,
    // Computed
    activeBoard,
    // Actions
    init,
    setActiveBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleSubtask,
  }
})
