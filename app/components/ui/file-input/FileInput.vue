<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  modelValue?: File | null;
  accept?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [file: File | null] }>();
const dropZone = useTemplateRef<HTMLElement>("dropZone");
const error = ref("");
function select(file: File | null) {
  if (props.disabled || !file) return;
  const accepted =
    !props.accept ||
    props.accept.split(",").some((value) => {
      const rule = value.trim().toLowerCase();
      return rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith("/*")
          ? file.type.startsWith(rule.slice(0, -1))
          : file.type === rule;
    });
  if (!accepted) {
    error.value = "Choose a supported file type.";
    return;
  }
  error.value = "";
  emit("update:modelValue", file);
}
const { isOverDropZone } = useDropZone(dropZone, {
  multiple: false,
  onDrop: (files) => select(files?.[0] ?? null),
});
function change(event: Event) {
  const input = event.target as HTMLInputElement;
  select(input.files?.[0] ?? null);
  input.value = "";
}
</script>
<template>
  <div ref="dropZone">
    <label
      class="border-outline bg-muted/30 focus-within:outline-info flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center focus-within:outline-2"
      :class="{
        'border-info bg-info/5': isOverDropZone,
        'cursor-not-allowed opacity-55': disabled,
      }"
    >
      <input
        v-bind="$attrs"
        type="file"
        :accept="accept"
        :disabled="disabled"
        :aria-label="label || 'Choose a file'"
        class="sr-only"
        @change="change"
      />
      <UiIcon
        name="i-tabler-upload"
        class="text-foreground-muted size-5"
      />
      <span class="text-sm font-medium">{{ label || "Choose a file" }}</span>
      <span
        v-if="modelValue"
        class="text-foreground-muted max-w-full truncate text-xs"
        >{{ modelValue.name }}</span
      >
      <span
        v-else
        class="text-foreground-muted text-xs"
        >{{ description || "Drop a file here or browse this device." }}</span
      >
    </label>
    <UiButton
      v-if="modelValue"
      variant="ghost"
      icon="i-tabler-x"
      :label="`Remove ${modelValue.name}`"
      :disabled="disabled"
      class="mt-2"
      @click="emit('update:modelValue', null)"
    />
    <p
      v-if="error"
      role="alert"
      class="text-error mt-2 text-xs"
    >
      {{ error }}
    </p>
  </div>
</template>
