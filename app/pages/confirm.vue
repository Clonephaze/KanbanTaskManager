<template>
  <div class="confirm-page">
    <p>Confirming your account…</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
// @nuxtjs/supabase handles the token exchange automatically via the confirm route.
// This page just provides a landing target; the module redirects to / on success.
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}
</style>
