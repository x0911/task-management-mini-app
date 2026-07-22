<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTasksStore } from "~/stores/tasks";
import type { Task, TaskInput } from "~/types/task";

const route = useRoute();
const router = useRouter();
const store = useTasksStore();

const id = computed(() => route.params.id as string);

const task = ref<Task | null>(null);
const loading = ref(true);
const notFound = ref(false);
const loadError = ref<string | null>(null);
const saveError = ref<string | null>(null);
const isDeleteOpen = ref(false);

useHead({
  title: computed(() =>
    task.value ? `${task.value.title} · Task Manager` : "Task · Task Manager",
  ),
});

async function loadTask() {
  loading.value = true;
  notFound.value = false;
  loadError.value = null;

  const cached = store.getById(id.value);
  if (cached) {
    task.value = cached;
    loading.value = false;
    return;
  }

  try {
    task.value = await $fetch<Task>(`/api/tasks/${id.value}`);
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.response?.status === 404) {
      notFound.value = true;
    } else {
      loadError.value = "Failed to load this task.";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadTask);

async function handleUpdate(payload: TaskInput) {
  if (!task.value) return;
  saveError.value = null;
  try {
    task.value = await store.updateTask(task.value.id, payload);
    router.push("/");
  } catch {
    saveError.value = store.error;
  }
}

async function confirmDelete() {
  if (!task.value) return;
  await store.deleteTask(task.value.id);
  router.push("/");
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <NuxtLink
      to="/"
      class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
          clip-rule="evenodd"
        />
      </svg>
      Back to all tasks
    </NuxtLink>

    <LoadingSpinner v-if="loading" label="Loading task…" />

    <EmptyState
      v-else-if="notFound"
      title="Task not found"
      message="This task may have been deleted already."
    />

    <ErrorAlert v-else-if="loadError" :message="loadError" @retry="loadTask" />

    <div
      v-else-if="task"
      class="flex flex-col gap-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-ink-500">
            Editing task
          </p>
          <h1 class="mt-1 text-xl font-semibold text-ink-900">
            {{ task.title }}
          </h1>
        </div>
        <StageTracker :status="task.status" />
      </div>

      <p
        v-if="saveError"
        class="rounded-lg bg-clay-50 px-3 py-2 text-sm font-medium text-clay-600"
      >
        {{ saveError }}
      </p>

      <TaskForm
        :initial="task"
        :require-future-due-date="false"
        submit-label="Save changes"
        :busy="store.mutating"
        @submit="handleUpdate"
        @cancel="router.push('/')"
      />

      <div class="border-t border-ink-100 pt-5">
        <button
          type="button"
          class="btn-ghost text-sm text-clay-600 hover:bg-clay-50"
          @click="isDeleteOpen = true"
        >
          Delete this task
        </button>
      </div>
    </div>

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Delete task"
      :message="`Are you sure you want to delete “${task?.title ?? ''}”? This action cannot be undone.`"
      confirm-label="Delete"
      danger
      :busy="store.mutating"
      @confirm="confirmDelete"
    />
  </div>
</template>
