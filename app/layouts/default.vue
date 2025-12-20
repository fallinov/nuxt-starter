<script setup lang="ts">
const navigation = [
  { label: 'Dashboard', to: '/', icon: 'i-heroicons-home' },
  { label: 'Projets', to: '/projects', icon: 'i-heroicons-folder' },
  { label: 'Tâches', to: '/tasks', icon: 'i-heroicons-clipboard-document-list' }
]

const colorMode = useColorMode()

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-primary" />
              <span class="font-bold text-lg hidden sm:inline">CRUD Starter</span>
            </NuxtLink>
            
            <nav class="flex items-center gap-1">
              <NuxtLink
                v-for="item in navigation"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              >
                <UIcon :name="item.icon" class="w-5 h-5" />
                <span class="hidden sm:inline">{{ item.label }}</span>
              </NuxtLink>
            </nav>
          </div>

          <UButton
            :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            color="gray"
            variant="ghost"
            aria-label="Basculer le mode sombre"
            @click="toggleDarkMode"
          />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <ConfirmModal />
    <NotificationToast />
  </div>
</template>
