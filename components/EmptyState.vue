<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; message: string; showAction?: boolean }>(),
  { showAction: false },
);
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center"
  >
    <svg
      class="h-10 w-10 text-ink-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <h3 class="text-base font-semibold text-ink-800">{{ title }}</h3>
    <p class="max-w-sm text-sm text-ink-500">{{ message }}</p>
    <button
      v-if="showAction"
      type="button"
      class="btn-primary mt-1"
      @click="emit('action')"
    >
      Add your first task
    </button>
  </div>
</template>
