<script setup lang="ts">
withDefaults(defineProps<{ message: string; retryable?: boolean }>(), {
  retryable: true,
});
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl border border-clay-400/30 bg-clay-50 px-4 py-3.5"
    role="alert"
  >
    <svg
      class="mt-0.5 h-5 w-5 flex-shrink-0 text-clay-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.59c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987l6.516-11.59zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clip-rule="evenodd"
      />
    </svg>
    <div class="flex-1">
      <p class="text-sm font-medium text-clay-600">{{ message }}</p>
    </div>
    <button
      v-if="retryable"
      type="button"
      class="text-sm font-semibold text-clay-600 underline decoration-clay-400/50 underline-offset-2 hover:text-clay-700"
      @click="emit('retry')"
    >
      Retry
    </button>
  </div>
</template>
