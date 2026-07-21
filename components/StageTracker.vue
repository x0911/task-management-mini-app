<script setup lang="ts">
import { computed } from "vue";
import { TASK_STATUSES, STATUS_LABELS } from "~/types/task";
import type { TaskStatus } from "~/types/task";

const props = withDefaults(
  defineProps<{ status: TaskStatus; compact?: boolean }>(),
  { compact: false },
);

const activeIndex = computed(() => TASK_STATUSES.indexOf(props.status));

const segmentColor: Record<TaskStatus, string> = {
  pending: "bg-ink-400",
  "in-progress": "bg-amber-400",
  done: "bg-moss-400",
};
</script>

<template>
  <div
    class="flex items-center gap-1.5"
    role="img"
    :aria-label="`Workflow stage: ${STATUS_LABELS[status]}`"
  >
    <div
      v-for="(stage, index) in TASK_STATUSES"
      :key="stage"
      class="h-1.5 rounded-full transition-colors duration-300"
      :class="[
        compact ? 'w-5' : 'w-8',
        index <= activeIndex ? segmentColor[status] : 'bg-ink-100',
      ]"
    />
  </div>
</template>
