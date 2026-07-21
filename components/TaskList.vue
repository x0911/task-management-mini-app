<script setup lang="ts">
import type { Task } from "~/types/task";

defineProps<{ tasks: Task[] }>();
const emit = defineEmits<{ delete: [task: Task] }>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      role="listitem"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
