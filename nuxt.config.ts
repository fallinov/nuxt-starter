// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  css: ['~/assets/main.css'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  icon: {
    serverBundle: 'local'
  },

  pinia: {
    storesDirs: ['./app/stores/**']
  },

  vite: {
    plugins: [
      ...(tailwindcss() as any[])
    ]
  }
})
