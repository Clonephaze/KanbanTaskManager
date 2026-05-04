// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo-mobile.svg' },
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  supabase: {
    types: './app/types/database.ts',
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [],
    },
  },

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
