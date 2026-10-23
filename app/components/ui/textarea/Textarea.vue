<script setup lang="ts">
import type { TextareaVariants } from ".";
import { useTextareaAutosize } from "@vueuse/core";
import { computed } from "vue";
import { textareaVariants } from ".";
import { cn } from "../../../lib/utils";

interface Props {
  autoresize?: boolean;
  rows?: number;
  maxrows?: number;
  size?: TextareaVariants["size"];
  variant?: TextareaVariants["variant"];
  class?: string;
}

const props = defineProps<Props>();
const model = defineModel<string>({ default: "" });
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");
if (props.autoresize) {
  useTextareaAutosize({
    element: textarea,
    input: model,
    maxHeight: props.maxrows ? props.maxrows * 24 : undefined,
  });
}

const classes = computed(() =>
  cn(textareaVariants({ size: props.size, variant: props.variant }), props.class),
);
</script>

<template>
  <textarea
    ref="textarea"
    v-model="model"
    :rows="props.rows ?? 3"
    :class="classes"
  />
</template>
