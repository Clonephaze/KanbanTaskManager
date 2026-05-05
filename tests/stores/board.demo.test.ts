/**
 * board store — demo mode unit tests
 *
 * All paths that touch Supabase are guarded by `if (isDemoMode.value)`.
 * By mocking useSupabaseUser to return ref(null), isDemoMode is always true
 * and every action takes the in-memory branch — no network required.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Demo mode = no authenticated user
mockNuxtImport('useSupabaseUser', () => () => ref(null))
// Client is never called in demo mode, but the composable must exist
mockNuxtImport('useSupabaseClient', () => () => ({}))

import { useBoardStore } from '~/stores/board'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a fresh store seeded from data.json */
function seedStore() {
  const store = useBoardStore()
  store.loadDemoBoards()
  return store
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('boardStore — demo mode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Seeding ──────────────────────────────────────────────────────────────

  describe('loadDemoBoards()', () => {
    it('loads all boards from data.json', () => {
      const store = seedStore()
      expect(store.boards).toHaveLength(3)
      expect(store.boards[0]!.name).toBe('Platform Launch')
      expect(store.boards[1]!.name).toBe('Marketing Plan')
      expect(store.boards[2]!.name).toBe('Roadmap')
    })

    it('sets the first board as active', () => {
      const store = seedStore()
      expect(store.activeBoardId).toBe(store.boards[0]!.id)
      expect(store.activeBoard?.name).toBe('Platform Launch')
    })

    it('assigns unique UUID ids to every board, column, task, and subtask', () => {
      const store = seedStore()
      const allIds: string[] = []
      for (const board of store.boards) {
        allIds.push(board.id)
        for (const col of board.columns) {
          allIds.push(col.id)
          for (const task of col.tasks) {
            allIds.push(task.id)
            for (const sub of task.subtasks) allIds.push(sub.id)
          }
        }
      }
      const unique = new Set(allIds)
      expect(unique.size).toBe(allIds.length)
    })

    it('maps task status to column name', () => {
      const store = seedStore()
      const board = store.boards[0]!
      for (const col of board.columns) {
        for (const task of col.tasks) {
          expect(task.status).toBe(col.name)
        }
      }
    })

    it('maps subtask isCompleted → is_completed', () => {
      const store = seedStore()
      // First task of Platform Launch has the first subtask completed
      const firstTask = store.boards[0]!.columns[0]!.tasks[0]!
      expect(firstTask.subtasks[0]!.is_completed).toBe(true)
      expect(firstTask.subtasks[1]!.is_completed).toBe(false)
    })

    it('isDemoMode is true when user is null', () => {
      const store = seedStore()
      expect(store.isDemoMode).toBe(true)
    })
  })

  // ── Board CRUD ────────────────────────────────────────────────────────────

  describe('addBoard()', () => {
    it('adds a new board to the list', async () => {
      const store = seedStore()
      const before = store.boards.length
      await store.addBoard('New Board', ['Col A', 'Col B'])
      expect(store.boards).toHaveLength(before + 1)
    })

    it('new board becomes the active board', async () => {
      const store = seedStore()
      await store.addBoard('Sprint 1', ['Backlog', 'In Progress', 'Done'])
      expect(store.activeBoard?.name).toBe('Sprint 1')
    })

    it('creates columns with correct names', async () => {
      const store = seedStore()
      await store.addBoard('Test Board', ['Alpha', 'Beta', 'Gamma'])
      const board = store.boards.find(b => b.name === 'Test Board')!
      expect(board.columns.map(c => c.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
    })

    it('ignores blank column name entries', async () => {
      const store = seedStore()
      await store.addBoard('Sparse Board', ['  ', 'Real Column', ''])
      const board = store.boards.find(b => b.name === 'Sparse Board')!
      expect(board.columns).toHaveLength(1)
      expect(board.columns[0]!.name).toBe('Real Column')
    })

    it('sets accent_color when provided', async () => {
      const store = seedStore()
      await store.addBoard('Colored', ['Col'], '#ff6600')
      const board = store.boards.find(b => b.name === 'Colored')!
      expect(board.accent_color).toBe('#ff6600')
    })

    it('sets wip_limits on columns when provided', async () => {
      const store = seedStore()
      await store.addBoard('WIP Board', ['A', 'B'], undefined, [3, 5])
      const board = store.boards.find(b => b.name === 'WIP Board')!
      expect(board.columns[0]!.wip_limit).toBe(3)
      expect(board.columns[1]!.wip_limit).toBe(5)
    })
  })

  describe('updateBoard()', () => {
    it('renames the active board', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      await store.updateBoard('Renamed Board', ['Todo', 'Doing', 'Done'])
      expect(store.activeBoard?.name).toBe('Renamed Board')
    })

    it('preserves tasks in columns that are kept', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const todoTaskCount = store.activeBoard!.columns[0]!.tasks.length
      await store.updateBoard('Platform Launch', ['Todo', 'Doing', 'Done'])
      expect(store.activeBoard!.columns[0]!.tasks).toHaveLength(todoTaskCount)
    })

    it('removes tasks from deleted columns', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      // Remove "Doing" column — its tasks should be dropped
      await store.updateBoard('Platform Launch', ['Todo', 'Done'])
      const colNames = store.activeBoard!.columns.map(c => c.name)
      expect(colNames).not.toContain('Doing')
      expect(store.activeBoard!.columns).toHaveLength(2)
    })

    it('adds new columns with empty task arrays', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      await store.updateBoard('Platform Launch', ['Todo', 'Doing', 'Done', 'Archived'])
      const archived = store.activeBoard!.columns.find(c => c.name === 'Archived')!
      expect(archived).toBeDefined()
      expect(archived.tasks).toEqual([])
    })
  })

  describe('deleteBoard()', () => {
    it('removes the active board', async () => {
      const store = seedStore()
      const deletedId = store.boards[0]!.id
      store.setActiveBoard(deletedId)
      await store.deleteBoard()
      expect(store.boards.find(b => b.id === deletedId)).toBeUndefined()
    })

    it('activates the next available board after deletion', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      await store.deleteBoard()
      expect(store.activeBoardId).toBe(store.boards[0]!.id)
    })

    it('sets activeBoardId to null when all boards are deleted', async () => {
      const store = seedStore()
      // Delete all 3 boards
      for (let i = 0; i < 3; i++) {
        store.setActiveBoard(store.boards[0]!.id)
        await store.deleteBoard()
      }
      expect(store.activeBoardId).toBeNull()
    })
  })

  // ── Task CRUD ─────────────────────────────────────────────────────────────

  describe('addTask()', () => {
    it('appends a task to the matching column', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const before = store.activeBoard!.columns[0]!.tasks.length

      await store.addTask({
        title: 'New Task',
        description: 'desc',
        status: 'Todo',
        priority: 'low',
        subtasks: [],
      })

      expect(store.activeBoard!.columns[0]!.tasks).toHaveLength(before + 1)
      expect(store.activeBoard!.columns[0]!.tasks.at(-1)!.title).toBe('New Task')
    })

    it('creates subtasks correctly', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)

      await store.addTask({
        title: 'Task with Subs',
        description: '',
        status: 'Todo',
        subtasks: [{ title: 'Sub 1' }, { title: 'Sub 2' }],
      })

      const task = store.activeBoard!.columns[0]!.tasks.at(-1)!
      expect(task.subtasks).toHaveLength(2)
      expect(task.subtasks[0]!.title).toBe('Sub 1')
      expect(task.subtasks[0]!.is_completed).toBe(false)
    })

    it('sets task status to the column name', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)

      await store.addTask({ title: 'Doing Task', description: '', status: 'Doing', subtasks: [] })
      const task = store.activeBoard!.columns[1]!.tasks.at(-1)!
      expect(task.status).toBe('Doing')
    })

    it('does nothing when status does not match any column', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const totalBefore = store.activeBoard!.columns.reduce((s, c) => s + c.tasks.length, 0)

      await store.addTask({ title: 'Ghost Task', description: '', status: 'Nonexistent', subtasks: [] })

      const totalAfter = store.activeBoard!.columns.reduce((s, c) => s + c.tasks.length, 0)
      expect(totalAfter).toBe(totalBefore)
    })
  })

  describe('updateTask()', () => {
    it('updates title and description in place (same column)', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const original = store.activeBoard!.columns[0]!.tasks[0]!
      const updatedTask = { ...original, title: 'Renamed Task', description: 'New desc' }

      await store.updateTask(original.title, original.status, updatedTask)

      const found = store.activeBoard!.columns[0]!.tasks.find(t => t.title === 'Renamed Task')
      expect(found).toBeDefined()
      expect(found!.description).toBe('New desc')
    })

    it('moves task to a new column when status changes', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const original = store.activeBoard!.columns[0]!.tasks[0]!
      const updatedTask = { ...original, status: 'Done' }

      await store.updateTask(original.title, 'Todo', updatedTask)

      // Should no longer be in Todo
      const inTodo = store.activeBoard!.columns[0]!.tasks.find(t => t.id === original.id)
      expect(inTodo).toBeUndefined()
      // Should now be in Done
      const doneCol = store.activeBoard!.columns.find(c => c.name === 'Done')!
      const inDone = doneCol.tasks.find(t => t.id === original.id)
      expect(inDone).toBeDefined()
      expect(inDone!.status).toBe('Done')
    })
  })

  describe('deleteTask()', () => {
    it('removes the task from its column', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const col = store.activeBoard!.columns[0]!
      const task = col.tasks[0]!
      const before = col.tasks.length

      await store.deleteTask(col.name, task.title)

      expect(col.tasks).toHaveLength(before - 1)
      expect(col.tasks.find(t => t.id === task.id)).toBeUndefined()
    })
  })

  describe('moveTask()', () => {
    it('moves a task from one column to another', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const src = store.activeBoard!.columns[0]!   // Todo
      const dest = store.activeBoard!.columns[2]!  // Done
      const task = src.tasks[0]!
      const srcBefore = src.tasks.length
      const destBefore = dest.tasks.length

      await store.moveTask(task.title, 'Todo', 'Done')

      expect(src.tasks).toHaveLength(srcBefore - 1)
      expect(dest.tasks).toHaveLength(destBefore + 1)
    })

    it('updates the task\'s status to the destination column name', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const task = store.activeBoard!.columns[0]!.tasks[0]!

      await store.moveTask(task.title, 'Todo', 'Done')

      const moved = store.activeBoard!.columns[2]!.tasks.find(t => t.id === task.id)
      expect(moved?.status).toBe('Done')
    })

    it('does nothing when task title is not found', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const totalBefore = store.activeBoard!.columns.reduce((s, c) => s + c.tasks.length, 0)

      await store.moveTask('Nonexistent Task', 'Todo', 'Done')

      const totalAfter = store.activeBoard!.columns.reduce((s, c) => s + c.tasks.length, 0)
      expect(totalAfter).toBe(totalBefore)
    })
  })

  describe('toggleSubtask()', () => {
    it('flips is_completed from false to true', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const task = store.activeBoard!.columns[0]!.tasks[0]!
      const subtask = task.subtasks.find(s => !s.is_completed)!

      await store.toggleSubtask('Todo', task.title, subtask.title)

      expect(subtask.is_completed).toBe(true)
    })

    it('flips is_completed from true to false', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const task = store.activeBoard!.columns[0]!.tasks[0]!
      const subtask = task.subtasks.find(s => s.is_completed)!

      await store.toggleSubtask('Todo', task.title, subtask.title)

      expect(subtask.is_completed).toBe(false)
    })
  })

  // ── Computed ──────────────────────────────────────────────────────────────

  describe('activeBoard computed', () => {
    it('returns the board matching activeBoardId', () => {
      const store = seedStore()
      const second = store.boards[1]!
      store.setActiveBoard(second.id)
      expect(store.activeBoard?.id).toBe(second.id)
      expect(store.activeBoard?.name).toBe('Marketing Plan')
    })

    it('returns undefined when activeBoardId is null', () => {
      const store = seedStore()
      store.activeBoardId = null
      expect(store.activeBoard).toBeUndefined()
    })
  })

  // ── syncColumnTasks ───────────────────────────────────────────────────────

  describe('syncColumnTasks()', () => {
    it('reorders tasks within a column by the provided id order', async () => {
      const store = seedStore()
      store.setActiveBoard(store.boards[0]!.id)
      const col = store.activeBoard!.columns[0]!
      const originalOrder = col.tasks.map(t => t.id)
      const reversed = [...originalOrder].reverse()

      await store.syncColumnTasks(col.id, reversed)

      const newOrder = col.tasks.map(t => t.id)
      expect(newOrder).toEqual(reversed)
    })
  })
})
