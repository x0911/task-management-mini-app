<script setup lang="ts">
import { useTaskForm } from "~/composables/useTaskForm";
import { TASK_STATUSES, STATUS_LABELS } from "~/types/task";
import type { TaskInput } from "~/types/task";

const props = withDefaults(
  defineProps<{
    initial?: Partial<TaskInput>;
    submitLabel?: string;
    busy?: boolean;
    requireFutureDueDate?: boolean;
  }>(),
  { submitLabel: "Save task", busy: false, requireFutureDueDate: true },
);

const emit = defineEmits<{ submit: [payload: TaskInput]; cancel: [] }>();

const { form, errors, validate, toPayload } = useTaskForm(props.initial, {
  requireFutureDueDate: props.requireFutureDueDate,
});

const todayIso = new Date().toISOString().slice(0, 10);

function onSubmit() {
  if (!validate()) return;
  emit("submit", toPayload());
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="onSubmit">
    <div>
      <label for="task-title" class="field-label"
        >Title <span class="text-clay-500">*</span></label
      >
      <input
        id="task-title"
        v-model="form.title"
        type="text"
        maxlength="140"
        class="field-input"
        :class="{ 'field-input-error': errors.title }"
        placeholder="e.g. Prepare sprint demo"
        :aria-invalid="Boolean(errors.title)"
        aria-describedby="task-title-error"
      />
      <p v-if="errors.title" id="task-title-error" class="field-error">
        {{ errors.title }}
      </p>
    </div>

    <div>
      <label for="task-description" class="field-label">Description</label>
      <textarea
        id="task-description"
        v-model="form.description"
        rows="3"
        maxlength="2000"
        class="field-input resize-none"
        placeholder="Add extra context or checklist items…"
      />
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label for="task-status" class="field-label">Status</label>
        <div class="select-wrapper">
          <select id="task-status" v-model="form.status" class="field-input">
            <option
              v-for="status in TASK_STATUSES"
              :key="status"
              :value="status"
            >
              {{ STATUS_LABELS[status] }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label for="task-due-date" class="field-label"
          >Due date <span class="text-clay-500">*</span></label
        >
        <input
          id="task-due-date"
          v-model="form.dueDate"
          type="date"
          class="field-input"
          :class="{ 'field-input-error': errors.dueDate }"
          :min="requireFutureDueDate ? todayIso : undefined"
          :aria-invalid="Boolean(errors.dueDate)"
          aria-describedby="task-due-date-error"
        />
        <p v-if="errors.dueDate" id="task-due-date-error" class="field-error">
          {{ errors.dueDate }}
        </p>
      </div>
    </div>

    <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        class="btn-secondary"
        :disabled="busy"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="busy"
        data-testid="task-form-submit"
      >
        <svg
          v-if="busy"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>
