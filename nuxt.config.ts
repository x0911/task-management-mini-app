export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  devtools: { enabled: false },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'Task Manager',
      meta: [
        { name: 'description', content: 'A fast, focused task management mini app.' },
        { name: 'theme-color', content: '#122540' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  experimental: {
    payloadExtraction: false
  },

  nitro: {
    esbuild: {
      options: { target: 'esnext' }
    }
  }
})
