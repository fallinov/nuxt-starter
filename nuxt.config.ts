// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  ui: {
    icons: ['heroicons']
  },

  pinia: {
    storesDirs: ['./app/stores/**']
  },

  future: {
    compatibilityVersion: 4
  }
})
