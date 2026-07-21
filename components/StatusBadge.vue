<script setup lang="ts">
import { computed } from "vue";
import { STATUS_LABELS } from "~/types/task";
import type { TaskStatus } from "~/types/task";

const props = defineProps<{ status: TaskStatus }>();

const styles: Record<TaskStatus, string> = {
  pending: "bg-ink-100 text-ink-600",
  "in-progress": "bg-amber-50 text-amber-600",
  done: "bg-moss-50 text-moss-600",
};

const dotStyles: Record<TaskStatus, string> = {
  pending: "bg-ink-400",
  "in-progress": "bg-amber-400",
  done: "bg-moss-400",
};

const label = computed(() => STATUS_LABELS[props.status]);
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="styles[status]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="dotStyles[status]" />
    {{ label }}
  </span>
</template>
