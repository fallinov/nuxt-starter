<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)

const signUp = async () => {
  if (!email.value || !password.value || !passwordConfirm.value) {
    toast.add({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', color: 'error' })
    return
  }

  if (password.value !== passwordConfirm.value) {
    toast.add({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', color: 'error' })
    return
  }

  if (password.value.length < 6) {
    toast.add({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères.', color: 'error' })
    return
  }

  isLoading.value = true

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/confirm`
    }
  })

  isLoading.value = false

  if (error) {
    toast.add({ title: 'Erreur', description: error.message, color: 'error' })
  } else {
    toast.add({
      title: 'Compte créé',
      description: 'Vérifiez votre email pour confirmer votre inscription.',
      color: 'success',
      duration: 10000
    })
    navigateTo('/login')
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
          <h1 class="text-2xl font-bold">Créer un compte</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Inscrivez-vous pour commencer</p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="signUp">
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
            placeholder="Minimum 6 caractères"
            icon="i-lucide-lock"
            size="lg"
          />
        </UFormField>

        <UFormField label="Confirmer le mot de passe">
          <UInput
            v-model="passwordConfirm"
            type="password"
            placeholder="Confirmez votre mot de passe"
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
          Créer mon compte
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary font-medium hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
