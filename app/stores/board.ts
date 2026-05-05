import { defineStore } from 'pinia'
import type { Board, Column, Task, Subtask } from '~/types'
import type { Database } from '~/types/database'
import demoData from '~/data/data.json'

export const useBoardStore = defineStore('board', () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const isDemoMode = computed(() => !user.value)

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const boards = ref<Board[]>([])
  const activeBoardId = ref<string | null>(null)
  const loading = ref(false)   // full board fetch
  const saving = ref(false)    // any mutation in flight
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const activeBoard = computed<Board | undefined>(() =>
    boards.value.find(b => b.id === activeBoardId.value),
  )

  // Wraps any async Supabase mutation with saving state
  async function withSaving<T>(fn: () => Promise<T>): Promise<T> {
    saving.value = true
    try { return await fn() }
    finally { saving.value = false }
  }

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
  // Demo mode: load static data.json into memory (no Supabase)
  // ---------------------------------------------------------------------------
  function loadDemoBoards() {
    const raw = demoData as any
    let boardPos = 0
    boards.value = raw.boards.map((b: any) => {
      let colPos = 0
      return {
        id: crypto.randomUUID(),
        name: b.name,
        accent_color: b.accentColor ?? undefined,
        position: boardPos++,
        columns: (b.columns ?? []).map((c: any) => {
          let taskPos = 0
          return {
            id: crypto.randomUUID(),
            name: c.name,
            wip_limit: c.wipLimit ?? 0,
            position: colPos++,
            tasks: (c.tasks ?? []).map((t: any) => {
              let subtaskPos = 0
              return {
                id: crypto.randomUUID(),
                title: t.title,
                description: t.description ?? '',
                status: c.name,
                priority: t.priority ?? undefined,
                due_date: t.dueDate ?? undefined,
                position: taskPos++,
                subtasks: (t.subtasks ?? []).map((s: any) => ({
                  id: crypto.randomUUID(),
                  title: s.title,
                  is_completed: s.isCompleted ?? false,
                  position: subtaskPos++,
                })),
              }
            }),
          }
        }),
      } as Board
    })
    activeBoardId.value = boards.value[0]?.id ?? null
  }

  // ---------------------------------------------------------------------------
  // Board actions
  // ---------------------------------------------------------------------------
  function setActiveBoard(id: string) {
    activeBoardId.value = id
  }

  async function addBoard(name: string, columnNames: string[], accent_color?: string, wipLimits?: number[]) {
    if (isDemoMode.value) {
      const newBoard: Board = {
        id: crypto.randomUUID(),
        name,
        accent_color,
        position: boards.value.length,
        columns: columnNames.filter(n => n.trim()).map((n, i) => ({
          id: crypto.randomUUID(),
          name: n,
          wip_limit: wipLimits?.[i] ?? 0,
          position: i,
          tasks: [],
        })),
      }
      boards.value.push(newBoard)
      activeBoardId.value = newBoard.id
      return
    }

    await withSaving(async () => {
      const user_id = user.value?.id ?? user.value?.sub
      if (!user_id) { error.value = 'Not authenticated'; return }

      const position = boards.value.length
      const { data: board, error: err } = await supabase
        .from('boards')
        .insert({ name, accent_color, position, user_id })
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
    })
  }

  async function updateBoard(name: string, columnNames: string[], accent_color?: string, wipLimits?: number[]) {
    const board = activeBoard.value
    if (!board) return

    if (isDemoMode.value) {
      const incoming = columnNames.filter(n => n.trim())
      board.name = name
      board.accent_color = accent_color
      board.columns = incoming.map((n, i) => {
        const existing = board.columns.find(c => c.name === n)
        return existing
          ? { ...existing, wip_limit: wipLimits?.[i] ?? existing.wip_limit, position: i }
          : { id: crypto.randomUUID(), name: n, wip_limit: wipLimits?.[i] ?? 0, position: i, tasks: [] }
      })
      return
    }

    await withSaving(async () => {
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
    })
  }

  async function deleteBoard() {
    const board = activeBoard.value
    if (!board) return

    if (isDemoMode.value) {
      boards.value = boards.value.filter(b => b.id !== board.id)
      activeBoardId.value = boards.value[0]?.id ?? null
      return
    }

    await withSaving(async () => {
      await supabase.from('boards').delete().eq('id', board.id)
      await loadBoards()
      activeBoardId.value = boards.value[0]?.id ?? null
    })
  }

  // ---------------------------------------------------------------------------
  // Task actions
  // ---------------------------------------------------------------------------
  async function addTask(task: Omit<Task, 'id' | 'subtasks' | 'position'> & { subtasks: Omit<Subtask, 'id' | 'position'>[] }) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === task.status)
    if (!column) return

    if (isDemoMode.value) {
      column.tasks.push({
        id: crypto.randomUUID(),
        title: task.title,
        description: task.description,
        status: column.name,
        priority: task.priority,
        due_date: task.due_date,
        position: column.tasks.length,
        subtasks: task.subtasks.map((s, i) => ({
          id: crypto.randomUUID(),
          title: s.title,
          is_completed: false,
          position: i,
        })),
      })
      return
    }

    await withSaving(async () => {
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
    })
  }

  async function updateTask(originalTitle: string, originalStatus: string, updated: Task) {
    const board = activeBoard.value
    if (!board) return

    const srcCol = board.columns.find(c => c.name === originalStatus)
    const task = srcCol?.tasks.find(t => t.title === originalTitle)
    if (!task) return

    const destCol = board.columns.find(c => c.name === updated.status)
    if (!destCol) return

    if (isDemoMode.value) {
      if (srcCol !== destCol) {
        srcCol!.tasks = srcCol!.tasks.filter(t => t.id !== task.id)
        destCol.tasks.push({ ...task, ...updated, id: task.id, position: destCol.tasks.length })
      } else {
        Object.assign(task, updated)
      }
      return
    }

    await withSaving(async () => {
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
    })
  }

  async function deleteTask(columnName: string, taskTitle: string) {
    const board = activeBoard.value
    if (!board) return
    const column = board.columns.find(c => c.name === columnName)
    const task = column?.tasks.find(t => t.title === taskTitle)
    if (!task) return

    if (isDemoMode.value) {
      column!.tasks = column!.tasks.filter(t => t.id !== task.id)
      return
    }

    await withSaving(async () => {
      await supabase.from('tasks').delete().eq('id', task.id)
      await loadBoards()
    })
  }

  async function moveTask(taskTitle: string, fromColumn: string, toColumn: string) {
    const board = activeBoard.value
    if (!board) return
    const src = board.columns.find(c => c.name === fromColumn)
    const dest = board.columns.find(c => c.name === toColumn)
    const task = src?.tasks.find(t => t.title === taskTitle)
    if (!src || !dest || !task) return

    if (isDemoMode.value) {
      src.tasks = src.tasks.filter(t => t.id !== task.id)
      dest.tasks.push({ ...task, status: toColumn, position: dest.tasks.length })
      return
    }

    await withSaving(async () => {
      await supabase.from('tasks').update({
        column_id: dest.id,
        position: dest.tasks.length,
      }).eq('id', task.id)

      await loadBoards()
    })
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

    if (isDemoMode.value) return

    await supabase.from('subtasks')
      .update({ is_completed: subtask.is_completed })
      .eq('id', subtask.id)
  }

  // Called by BoardColumn after drag-and-drop reorders tasks
  async function syncColumnTasks(columnId: string, taskIds: string[]) {
    if (isDemoMode.value) {
      const board = activeBoard.value
      if (!board) return
      const column = board.columns.find(c => c.id === columnId)
      if (!column) return
      const reordered = taskIds.map((id, position) => {
        const task = column.tasks.find(t => t.id === id)!
        return { ...task, position }
      })
      column.tasks = reordered
      return
    }

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
    saving,
    error,
    isDemoMode,
    loadBoards,
    loadDemoBoards,
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
