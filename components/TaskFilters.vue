<script setup lang="ts">
import { ref, watch } from "vue";
import { TASK_STATUSES, STATUS_LABELS } from "~/types/task";
import type { TaskStatus } from "~/types/task";
import { useDebouncedValue } from "~/composables/useDebouncedValue";

defineProps<{
  statusFilter: TaskStatus | "all";
  counts: Record<TaskStatus | "all", number>;
}>();

const emit = defineEmits<{
  "update:statusFilter": [value: TaskStatus | "all"];
  search: [term: string];
}>();

const searchInput = ref("");
const debouncedSearch = useDebouncedValue(searchInput, 300);

watch(debouncedSearch, (term) => emit("search", term));

const filters: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  ...TASK_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];
</script>

<template>
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div
      class="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter tasks by status"
    >
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
        :class="
          statusFilter === filter.value
            ? 'bg-ink-900 text-white'
            : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-100'
        "
        :aria-pressed="statusFilter === filter.value"
        @click="emit('update:statusFilter', filter.value)"
      >
        {{ filter.label }}
        <span
          class="rounded-full px-1.5 text-xs"
          :class="
            statusFilter === filter.value
              ? 'bg-white/20'
              : 'bg-ink-100 text-ink-500'
          "
        >
          {{ counts[filter.value] }}
        </span>
      </button>
    </div>

    <div class="relative w-full sm:w-64">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clip-rule="evenodd"
        />
      </svg>
      <input
        v-model="searchInput"
        type="search"
        placeholder="Search by title…"
        class="field-input pl-9"
        aria-label="Search tasks by title"
      />
    </div>
  </div>
</template>
