<template>
  <div class="auth-page">
    <div class="auth-card">
      <img :src="logoDark" alt="Kanban" class="auth-card__logo" />

      <!-- Email-confirmed state -->
      <template v-if="emailSent">
        <h1 class="auth-card__title">Check your email</h1>
        <p class="auth-card__hint">
          We sent a confirmation link to <strong>{{ email }}</strong>. Click it to activate your account, then sign in.
        </p>
        <BaseButton variant="secondary" full @click="emailSent = false; isLogin = true">
          Back to Sign in
        </BaseButton>
      </template>

      <template v-else>
        <h1 class="auth-card__title">{{ isLogin ? 'Sign in' : 'Create account' }}</h1>

        <form class="auth-card__form" @submit.prevent="onSubmit">
          <BaseInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="emailError" />

          <!-- Password field with visibility toggle -->
          <div class="auth-card__password-group">
            <label class="auth-card__password-label">Password</label>
            <div :class="['auth-card__password-wrapper', { 'auth-card__password-wrapper--error': !!passwordError }]">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="auth-card__password-input"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="auth-card__password-toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span v-if="passwordError" class="auth-card__field-error">{{ passwordError }}</span>
          </div>

          <p v-if="authError" class="auth-card__error">{{ authError }}</p>

          <BaseButton variant="primary-l" full type="submit" :disabled="pending">
            {{ pending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account' }}
          </BaseButton>
        </form>

        <p class="auth-card__switch">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button class="auth-card__switch-btn" type="button" @click="isLogin = !isLogin; authError = ''">
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoDark from '~/assets/icons/logo-dark.svg'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const authError = ref('')
const pending = ref(false)
const emailSent = ref(false)

async function onSubmit() {
  emailError.value = email.value.trim() ? '' : 'Required'
  passwordError.value = password.value ? '' : 'Required'
  if (emailError.value || passwordError.value) return

  pending.value = true
  authError.value = ''

  if (isLogin.value) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    pending.value = false
    if (error) { authError.value = error.message; return }
    await navigateTo('/')
  } else {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    })
    pending.value = false
    if (error) { authError.value = error.message; return }
    emailSent.value = true
  }
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
    width: auto;
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

  &__hint {
    @include type('body-l');
    color: var(--color-text-secondary);
  }

  &__password-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__password-label {
    @include type('body-m');
    color: var(--color-text-secondary);
  }

  &__password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid var(--color-input-border-idle);
    border-radius: var(--radius-input);
    background: var(--color-surface);
    transition: border-color 0.15s ease;

    &:focus-within {
      border-color: var(--color-primary);
    }

    &--error {
      border-color: var(--color-danger);
    }
  }

  &__password-input {
    @include type('body-l');
    flex: 1;
    padding: 8px 16px;
    background: transparent;
    color: var(--color-text-primary);
    border: none;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: var(--color-text-secondary);
      opacity: 0.4;
    }
  }

  &__password-toggle {
    @include type('body-m');
    padding: 8px 12px;
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      color: var(--color-primary-hover);
    }
  }

  &__field-error {
    @include type('body-m');
    color: var(--color-danger);
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
