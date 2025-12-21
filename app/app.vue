<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'Nuxt CRUD Starter'
const description = 'A production-ready starter template with Nuxt 4, Nuxt UI 4, and TypeScript. Demonstrates best practices for CRUD operations.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const navigation = [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-home' },
  { label: 'Projets', to: '/projects', icon: 'i-lucide-folder' },
  { label: 'Tâches', to: '/tasks', icon: 'i-lucide-clipboard-list' }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="size-6 text-primary" />
          <span class="font-bold text-lg">CRUD Starter</span>
        </NuxtLink>

        <UNavigationMenu :items="navigation" class="hidden sm:flex" />
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NuxtPage />
      </div>
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>

    <UiConfirmModal />
  </UApp>
</template>
