<script setup lang="ts">
const user = useSupabaseUser()

watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/')
  }
}, { immediate: true })

definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <UCard class="w-full max-w-md text-center">
      <div class="py-8">
        <UIcon name="i-lucide-loader-circle" class="size-12 animate-spin text-primary mx-auto mb-4" />
        <h1 class="text-xl font-semibold">Confirmation en cours...</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          Veuillez patienter pendant la validation de votre compte.
        </p>
      </div>
    </UCard>
  </div>
</template>
