<script setup lang="ts">
import { watch, onBeforeUnmount } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    size?: "sm" | "md" | "lg";
  }>(),
  { size: "md" },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function close() {
  emit("update:modelValue", false);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.modelValue) close();
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) document.addEventListener("keydown", onKeydown);
    else document.removeEventListener("keydown", onKeydown);
  },
);

onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

const widthClass = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 sm:p-6"
        role="presentation"
        @click.self="close"
      >
        <Transition appear enter-active-class="animate-scale-in">
          <div
            :class="widthClass[size]"
            class="w-full rounded-2xl bg-white shadow-popover animate-scale-in max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
          >
            <div
              class="flex items-center justify-between border-b border-ink-100 px-5 py-4 sm:px-6"
            >
              <h2 class="text-base font-semibold text-ink-900 sm:text-lg">
                {{ title }}
              </h2>
              <button
                type="button"
                class="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close dialog"
                @click="close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div class="overflow-y-auto px-5 py-5 sm:px-6">
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="flex justify-end gap-3 border-t border-ink-100 px-5 py-4 sm:px-6"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
