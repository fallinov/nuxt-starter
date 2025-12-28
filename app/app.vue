<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

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

const userMenuItems = computed(() => [
  [{
    label: user.value?.email || 'Utilisateur',
    icon: 'i-lucide-user',
    disabled: true
  }],
  [{
    label: 'Déconnexion',
    icon: 'i-lucide-log-out',
    onSelect: async () => {
      await supabase.auth.signOut()
      navigateTo('/login')
    }
  }]
])
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
        <div class="flex items-center gap-2">
          <UColorModeButton />
          <UDropdownMenu v-if="user" :items="userMenuItems" :content="{ align: 'end' }">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-user-circle"
              aria-label="Menu utilisateur"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UHeader>

    <UMain>
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
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
