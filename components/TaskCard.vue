<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "~/types/task";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ delete: [task: Task] }>();

const dueDateLabel = computed(() =>
  new Date(props.task.dueDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
);

const isOverdue = computed(
  () =>
    props.task.status !== "done" &&
    new Date(props.task.dueDate).getTime() < Date.now(),
);
</script>

<template>
  <article
    class="group flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-shadow duration-150 hover:shadow-popover"
  >
    <div class="flex items-start justify-between gap-3">
      <NuxtLink
        :to="`/tasks/${task.id}`"
        class="text-base font-semibold leading-snug text-ink-900 hover:text-ink-700 line-clamp-2"
      >
        {{ task.title }}
      </NuxtLink>
      <StatusBadge :status="task.status" class="flex-shrink-0" />
    </div>

    <p
      v-if="task.description"
      class="line-clamp-2 text-sm leading-relaxed text-ink-500"
    >
      {{ task.description }}
    </p>

    <div class="mt-1 flex items-center justify-between">
      <StageTracker :status="task.status" compact />
      <span
        class="text-xs font-medium"
        :class="isOverdue ? 'text-clay-500' : 'text-ink-400'"
      >
        Due {{ dueDateLabel }}
      </span>
    </div>

    <div class="mt-2 flex items-center gap-2 border-t border-ink-50 pt-3">
      <NuxtLink
        :to="`/tasks/${task.id}`"
        class="btn-secondary flex-1 !py-2 text-sm"
        >Edit</NuxtLink
      >
      <button
        type="button"
        class="btn-ghost !py-2 text-sm text-clay-500 hover:bg-clay-50"
        data-testid="delete-task-button"
        @click="emit('delete', task)"
      >
        Delete
      </button>
    </div>
  </article>
</template>
