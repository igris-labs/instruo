<script setup lang="ts">
import type { ToastProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Toast as AkazaToast } from "akaza-ui";
import { computed } from "vue";
import { Button } from "../button";
import { Icon } from "../icon";
import { toastUi } from "./index";

defineOptions({ inheritAttrs: false });

const {
  size,
  variant,
  class: customClass,
  ui: customUi,
  stack = true,
  pauseOnHover = true,
  pauseOnFocus = true,
  pauseOnWindowBlur = true,
  ...forwardedProps
} = defineProps<
  ToastProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => ({
  ...forwardedProps,
  stack,
  pauseOnHover,
  pauseOnFocus,
  pauseOnWindowBlur,
}));

const ui = computed(() => toastUi(size, variant, customClass, customUi));

function tone(type: string) {
  if (type === "success")
    return { icon: "i-tabler-circle-check", class: "bg-success/10 text-success", label: "Success" };
  if (type === "error" || type === "alert")
    return { icon: "i-tabler-circle-x", class: "bg-error/10 text-error", label: "Error" };
  if (type === "warning")
    return { icon: "i-tabler-flag", class: "bg-warning/10 text-warning", label: "Warning" };
  return { icon: "i-tabler-circle-dot", class: "bg-info/10 text-info", label: "Information" };
}
</script>

<template>
  <AkazaToast
    v-bind="{ ...akazaProps, ...$attrs }"
    :ui="ui"
  >
    <template #toast="{ toast, type, close, performAction }">
      <slot
        name="toast"
        :toast="toast"
        :type="type"
        :close="close"
        :perform-action="performAction"
      >
        <div class="flex items-start gap-2.5 px-3 py-2.5">
          <span
            class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md"
            :class="[tone(type).class]"
          >
            <Icon
              :name="tone(type).icon"
              class="size-4"
            />
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <span class="sr-only">{{ tone(type).label }}: </span>
            <p
              v-if="toast.title"
              class="text-foreground-highlighted leading-4 font-medium"
            >
              {{ toast.title }}
            </p>
            <p
              v-if="toast.description"
              class="text-foreground-muted mt-0.5 leading-4 wrap-break-word"
            >
              {{ toast.description }}
            </p>
            <Button
              v-if="toast.action"
              :label="toast.action.label"
              variant="ghost"
              size="xs"
              class="mt-1"
              :aria-label="toast.action.altText"
              @click="performAction"
            />
          </div>
          <Button
            icon="i-tabler-x"
            aria-label="Dismiss notification"
            variant="ghost"
            size="xs"
            class="text-foreground-muted -mt-1 -mr-1 shrink-0"
            @click="close('close-button')"
          />
        </div>
      </slot>
    </template>
  </AkazaToast>
</template>
