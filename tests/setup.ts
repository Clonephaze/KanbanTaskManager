import { vi, beforeEach } from 'vitest'

// Provide dummy Supabase env vars so the @nuxtjs/supabase module doesn't throw
// during Nuxt environment bootstrap.
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_KEY = 'test-anon-key'

// ---------------------------------------------------------------------------
// localStorage mock
// Individual tests should not share state, so we clear between each test.
// ---------------------------------------------------------------------------
const _store: Record<string, string> = {}

const localStorageMock: Storage = {
  getItem: (key) => _store[key] ?? null,
  setItem: (key, val) => { _store[key] = val },
  removeItem: (key) => { delete _store[key] },
  clear: () => { Object.keys(_store).forEach(k => delete _store[k]) },
  get length() { return Object.keys(_store).length },
  key: (i) => Object.keys(_store)[i] ?? null,
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})
