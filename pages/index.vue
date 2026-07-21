<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTasksStore } from "~/stores/tasks";
import type { Task, TaskInput } from "~/types/task";

useHead({ title: "Task Manager · All tasks" });

const store = useTasksStore();
const {
  filteredTasks,
  taskCounts,
  statusFilter,
  loading,
  mutating,
  error,
  loaded,
} = storeToRefs(store);

onMounted(() => {
  if (!loaded.value) store.fetchTasks();
});

const isAddOpen = ref(false);
const deleteTarget = ref<Task | null>(null);
const formError = ref<string | null>(null);

function openAddForm() {
  formError.value = null;
  isAddOpen.value = true;
}

async function handleCreate(payload: TaskInput) {
  formError.value = null;
  try {
    await store.createTask(payload);
    isAddOpen.value = false;
  } catch {
    formError.value = store.error;
  }
}

function requestDelete(task: Task) {
  deleteTarget.value = task;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  await store.deleteTask(deleteTarget.value.id);
  deleteTarget.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div
      class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-ink-900">
          Tasks
        </h1>
        <p class="mt-1 text-sm text-ink-500">
          {{ taskCounts.all }} total · {{ taskCounts["in-progress"] }} in
          progress · {{ taskCounts.done }} done
        </p>
      </div>
      <button
        type="button"
        class="btn-primary self-start sm:self-auto"
        @click="openAddForm"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          />
        </svg>
        Add task
      </button>
    </div>

    <TaskFilters
      :status-filter="statusFilter"
      :counts="taskCounts"
      @update:status-filter="store.setStatusFilter"
      @search="store.setSearchTerm"
    />

    <ErrorAlert v-if="error" :message="error" @retry="store.fetchTasks" />

    <LoadingSpinner v-if="loading && !loaded" label="Loading tasks…" />

    <EmptyState
      v-else-if="loaded && filteredTasks.length === 0 && taskCounts.all === 0"
      title="No tasks yet"
      message="Create your first task to start tracking work."
      show-action
      @action="openAddForm"
    />

    <EmptyState
      v-else-if="loaded && filteredTasks.length === 0"
      title="No matching tasks"
      message="Try a different search term or clear the status filter."
    />

    <TaskList v-else :tasks="filteredTasks" @delete="requestDelete" />

    <BaseModal v-model="isAddOpen" title="Add task">
      <p
        v-if="formError"
        class="mb-4 rounded-lg bg-clay-50 px-3 py-2 text-sm font-medium text-clay-600"
      >
        {{ formError }}
      </p>
      <TaskForm
        submit-label="Create task"
        :busy="mutating"
        @submit="handleCreate"
        @cancel="isAddOpen = false"
      />
    </BaseModal>

    <ConfirmDialog
      :model-value="Boolean(deleteTarget)"
      title="Delete task"
      :message="`Are you sure you want to delete “${deleteTarget?.title ?? ''}”? This action cannot be undone.`"
      confirm-label="Delete"
      danger
      :busy="mutating"
      @update:model-value="
        (val) => {
          if (!val) deleteTarget = null;
        }
      "
      @confirm="confirmDelete"
    />
  </div>
</template>
