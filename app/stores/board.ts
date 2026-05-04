import { defineStore } from 'pinia'
import type { Board, Column, Task, Subtask } from '~/types'
import type { Database } from '~/types/database'

export const useBoardStore = defineStore('board', () => {
  const supabase = useSupabaseClient<Database>()

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const boards = ref<Board[]>([])
  const activeBoardId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const activeBoard = computed<Board | undefined>(() =>
    boards.value.find(b => b.id === activeBoardId.value),
  )

  // ---------------------------------------------------------------------------
  // Load all boards (+ nested columns/tasks/subtasks) for the current user
  // ---------------------------------------------------------------------------
  async function loadBoards() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('boards')
        .select(`
          id, name, accent_color, position,
          columns (
            id, name, wip_limit, position,
            tasks (
              id, title, description, priority, due_date, position,
              subtasks ( id, title, is_completed, position )
            )
          )
        `)
        .order('position', { ascending: true })
        .order('position', { referencedTable: 'columns', ascending: true })
        .order('position', { referencedTable: 'columns.tasks', ascending: true })
        .order('position', { referencedTable: 'columns.tasks.subtasks', ascending: true })

      if (err) throw err

      boards.value = (data ?? []).map(b => ({
        ...b,
        accent_color: b.accent_color ?? undefined,
        columns: (b.columns ?? []).map(c => ({
          ...c,
          tasks: (c.tasks ?? []).map(t => ({
            ...t,
            status: c.name,
            priority: (t.priority as Task['priority']) ?? undefined,
            due_date: t.due_date ?? undefined,
            subtasks: (t.subtasks ?? []),
          })),
        })),
      })) as Board[]

      if (!activeBoardId.value && boards.value.length > 0) {
        activeBoardId.value = boards.value[0]!.id
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load boards'
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Board actions
  // ---------------------------------------------------------------------------
  function setActiveBoard(id: string) {
    activeBoardId.value = id
  }

  async function addBoard(name: string, columnNames: string[], accent_color?: string, wipLimits?: number[]) {
    const position = boards.value.length
    const { data: board, error: err } = await supabase
      .from('boards')
      .insert({ name, accent_color, position })
      .select('id')
      .single()

    if (err || !board) { error.value = err?.message ?? 'Failed to create board'; return }

    const cols = columnNames.filter(n => n.trim()).map((n, i) => ({
      board_id: board.id,
      name: n,
      wip_limit: wipLimits?.[i] ?? 0,
      position: i,
    }))

    if (cols.length) {
      const { error: colErr } = await supabase.from('columns').insert(cols)
      if (colErr) { error.value = colErr.message; return }
    }

    await loadBoards()
    activeBoardId.value = board.id
  }

  async function updateBoard(name: string, columnNames: string[], accent_color?: string, wipLimits?: number[]) {
    const board = activeBoard.value
    if (!board) return

    await supabase
      .from('boards')
      .update({ name, accent_color })
      .eq('id', board.id)

    const existing = board.columns
    const incoming = columnNames.filter(n => n.trim())

    const toDelete = existing.filter(c => !incoming.includes(c.name)).map(c => c.id)
    if (toDelete.length) {
      await supabase.from('columns').delete().in('id', toDelete)
    }

    const toInsert = incoming
      .filter(n => !existing.find(c => c.name === n))
      .map(n => ({ board_id: board.id, name: n, wip_limit: wipLimits?.[incoming.indexOf(n)] ?? 0, position: incoming.indexOf(n) }))

    if (toInsert.length) {
      await supabase.from('columns').insert(toInsert)
    }

    for (const col of existing) {
      const idx = incoming.indexOf(col.name)
      if (idx !== -1) {
        await supabase.from('columns')
          .update({ wip_limit: wipLimits?.[idx] ?? col.wip_limit, position: idx })
          .eq('id', col.id)
      }
    }

    await loadBoards()
  }

  async function deleteBoard() {
    const board = activeBoard.value
    if (!board) return
    await supabase.from('boards').delete().eq('id', board.id)
    await loadBoards()
    activeBoardId.value = boards.value[0]?.id ?? null
  }

  // ---------------------------------------------------------------------------
  // Task actions
  // ---------------------------------------------------------------------------
  async function addTask(task: Omit<Task, 'id' | 'subtasks' | 'position'> & { subtasks: Omit<Subtask, 'id' | 'position'>[] }) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === task.status)
    if (!column) return

    const { data: inserted, error: err } = await supabase
      .from('tasks')
      .insert({
        column_id: column.id,
        title: task.title,
        description: task.description,
        priority: task.priority ?? null,
        due_date: task.due_date ?? null,
        position: column.tasks.length,
      })
      .select('id')
      .single()

    if (err || !inserted) { error.value = err?.message ?? 'Failed to add task'; return }

    if (task.subtasks.length) {
      await supabase.from('subtasks').insert(
        task.subtasks.map((s, i) => ({ task_id: inserted.id, title: s.title, is_completed: false, position: i })),
      )
    }

    await loadBoards()
  }

  async function updateTask(originalTitle: string, originalStatus: string, updated: Task) {
    const board = activeBoard.value
    if (!board) return

    const srcCol = board.columns.find(c => c.name === originalStatus)
    const task = srcCol?.tasks.find(t => t.title === originalTitle)
    if (!task) return

    const destCol = board.columns.find(c => c.name === updated.status)
    if (!destCol) return

    await supabase.from('tasks').update({
      title: updated.title,
      description: updated.description,
      priority: updated.priority ?? null,
      due_date: updated.due_date ?? null,
      column_id: destCol.id,
    }).eq('id', task.id)

    const existingSubtasks = task.subtasks
    const incoming = updated.subtasks

    const toDelete = existingSubtasks.filter(s => !incoming.find(i => i.title === s.title)).map(s => s.id)
    if (toDelete.length) await supabase.from('subtasks').delete().in('id', toDelete)

    const toInsert = incoming.filter(s => !existingSubtasks.find(e => e.title === s.title))
    if (toInsert.length) {
      await supabase.from('subtasks').insert(
        toInsert.map((s, i) => ({ task_id: task.id, title: s.title, is_completed: s.is_completed, position: existingSubtasks.length + i })),
      )
    }

    await loadBoards()
  }

  async function deleteTask(columnName: string, taskTitle: string) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === columnName)
    const task = column?.tasks.find(t => t.title === taskTitle)
    if (!task) return
    await supabase.from('tasks').delete().eq('id', task.id)
    await loadBoards()
  }

  async function moveTask(taskTitle: string, fromColumn: string, toColumn: string) {
    const board = activeBoard.value
    if (!board) return
    const src = board.columns.find(c => c.name === fromColumn)
    const dest = board.columns.find(c => c.name === toColumn)
    const task = src?.tasks.find(t => t.title === taskTitle)
    if (!src || !dest || !task) return

    await supabase.from('tasks').update({
      column_id: dest.id,
      position: dest.tasks.length,
    }).eq('id', task.id)

    await loadBoards()
  }

  async function toggleSubtask(columnName: string, taskTitle: string, subtaskTitle: string) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === columnName)
    const task = column?.tasks.find(t => t.title === taskTitle)
    const subtask = task?.subtasks.find(s => s.title === subtaskTitle)
    if (!subtask) return

    // Optimistic update for instant UI response
    subtask.is_completed = !subtask.is_completed

    await supabase.from('subtasks')
      .update({ is_completed: subtask.is_completed })
      .eq('id', subtask.id)
  }

  // Called by BoardColumn after drag-and-drop reorders tasks
  async function syncColumnTasks(columnId: string, taskIds: string[]) {
    await Promise.all(
      taskIds.map((id, position) =>
        supabase.from('tasks').update({ column_id: columnId, position }).eq('id', id),
      ),
    )
  }

  return {
    boards,
    activeBoardId,
    activeBoard,
    loading,
    error,
    loadBoards,
    setActiveBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleSubtask,
    syncColumnTasks,
  }
})
