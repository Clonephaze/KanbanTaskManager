// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // GitHub Pages serves from /repo-name/ - pick up via env var set in the workflow.
  // Falls back to '/' for local dev.
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  // Register ui/ components without the 'Ui' path prefix so <BaseButton>,
  // <BaseInput>, etc. work. The generic '~/components' scan still handles
  // board/, modal/, task/ with their correct prefixed names.
  components: {
    dirs: [
      { path: '~/components/ui', prefix: '' },
      '~/components',
    ],
  },

  css: ['~/assets/styles/main.scss'],

  typescript: {
    strict: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
})
