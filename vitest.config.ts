import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  // Force client-side context so composables guarded by import.meta.client work.
  define: {
    'import.meta.client': true,
    'import.meta.server': false,
  },
  test: {
    globals: true,
    environment: 'nuxt',
    // Provide dummy Supabase values so @nuxtjs/supabase plugin can boot without
    // throwing. Tests never hit the network — store tests mock useSupabaseUser
    // and useSupabaseClient; component tests use createTestingPinia.
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_KEY: 'test-anon-key-for-vitest',
      NUXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NUXT_PUBLIC_SUPABASE_KEY: 'test-anon-key-for-vitest',
    },
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/stores/**', 'app/composables/**'],
      reporter: ['text', 'html'],
      thresholds: { lines: 70 },
    },
  },
})
