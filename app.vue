<template>
  <div class="min-h-screen bg-ink-50">
    <header class="border-b border-ink-100 bg-white/80 backdrop-blur">
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-white"
            >T</span
          >
          <span class="text-base font-semibold tracking-tight text-ink-900"
            >Task Manager</span
          >
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <NuxtPage />
    </main>
  </div>
</template>
