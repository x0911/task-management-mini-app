<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Loading" });
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 py-16 text-ink-500"
    role="status"
  >
    <svg
      class="h-8 w-8 animate-spin text-ink-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        class="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span class="text-sm font-medium">{{ label }}</span>
  </div>
</template>
