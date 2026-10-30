<script setup lang="ts">
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { inputVariants } from "../ui/input";
const props = defineProps<{
  modelValue?: File | null;
  accept?: string;
  label?: string;
  description?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [file: File | null] }>();
const input = useTemplateRef<HTMLInputElement>("input");
function choose(event: Event) {
  const element = event.target as HTMLInputElement;
  emit("update:modelValue", element.files?.[0] ?? null);
  element.value = "";
}
function drop(event: DragEvent) {
  const file = event.dataTransfer?.files[0];
  if (file) emit("update:modelValue", file);
}
watch(
  () => props.modelValue,
  (file) => {
    if (!file && input.value) input.value.value = "";
  },
);
</script>
<template>
  <Field
    :label="label ?? 'Choose a file'"
    :description="description"
    @dragover.prevent
    @drop.prevent="drop"
  >
    <input
      ref="input"
      type="file"
      :accept="accept"
      :aria-label="label ?? 'Choose a file'"
      class="file:bg-background file:text-foreground h-auto w-full p-3 file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:px-3 file:py-1"
      :class="[inputVariants({ size: 'sm', variant: 'soft' }).root()]"
      @change="choose"
    />
    <div
      v-if="modelValue"
      class="flex min-w-0 items-center justify-between gap-3"
    >
      <span class="text-muted-foreground truncate text-xs">{{ modelValue.name }}</span
      ><Button
        variant="ghost"
        color="secondary"
        @click="emit('update:modelValue', null)"
        >Remove file</Button
      >
    </div>
  </Field>
</template>
