<template>
  <div class="auth-page">
    <div class="auth-card">
      <img :src="logoLight" alt="Kanban" height="26" class="auth-card__logo" />

      <h1 class="auth-card__title">{{ isLogin ? 'Sign in' : 'Create account' }}</h1>

      <form class="auth-card__form" @submit.prevent="onSubmit">
        <BaseInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="emailError" />
        <BaseInput v-model="password" label="Password" type="password" placeholder="••••••••" :error="passwordError" />

        <p v-if="authError" class="auth-card__error">{{ authError }}</p>

        <BaseButton variant="primary-l" full type="submit" :disabled="pending">
          {{ pending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account' }}
        </BaseButton>
      </form>

      <p class="auth-card__switch">
        {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
        <button class="auth-card__switch-btn" type="button" @click="isLogin = !isLogin">
          {{ isLogin ? 'Sign up' : 'Sign in' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoLight from '~/assets/icons/logo-light.svg'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const authError = ref('')
const pending = ref(false)

async function onSubmit() {
  emailError.value = email.value.trim() ? '' : 'Required'
  passwordError.value = password.value ? '' : 'Required'
  if (emailError.value || passwordError.value) return

  pending.value = true
  authError.value = ''

  const { error } = isLogin.value
    ? await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    : await supabase.auth.signUp({ email: email.value, password: password.value })

  pending.value = false

  if (error) {
    authError.value = error.message
    return
  }

  await navigateTo('/')
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/mixins' as *;

.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 24px 16px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border-radius: var(--radius-modal);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__logo {
    height: 26px;
    width: auto;
    // The logo-light SVG is white — put it on the primary colour background
    background: var(--color-primary);
    padding: 10px 16px;
    border-radius: var(--radius-card);
  }

  &__title {
    @include type('heading-xl');
    color: var(--color-text-primary);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__error {
    @include type('body-m');
    color: var(--color-danger);
  }

  &__switch {
    @include type('body-m');
    color: var(--color-text-secondary);
    text-align: center;
  }

  &__switch-btn {
    color: var(--color-primary);
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    text-decoration: underline;

    &:hover {
      color: var(--color-primary-hover);
    }
  }
}
</style>
