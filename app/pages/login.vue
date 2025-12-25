<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const signIn = async () => {
  if (!email.value || !password.value) {
    toast.add({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', color: 'error' })
    return
  }

  isLoading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  isLoading.value = false

  if (error) {
    toast.add({ title: 'Erreur', description: error.message, color: 'error' })
  }
}

// Redirect if already logged in
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
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Connexion</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Connectez-vous à votre compte</p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="signIn">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            icon="i-lucide-mail"
            size="lg"
            autofocus
          />
        </UFormField>

        <UFormField label="Mot de passe">
          <UInput
            v-model="password"
            type="password"
            placeholder="Votre mot de passe"
            icon="i-lucide-lock"
            size="lg"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Se connecter
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Pas encore de compte ?
          <NuxtLink to="/signup" class="text-primary font-medium hover:underline">
            Créer un compte
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
