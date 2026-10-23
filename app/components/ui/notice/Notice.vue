<script setup lang="ts">
const props = defineProps<{
  title?: string;
  description?: string;
  icon?: string;
  tone?: string;
}>();
const toneClasses = computed(
  () =>
    ({
      error: "border-error/20 bg-error/5 text-error",
      warning: "border-warning/20 bg-warning/5 text-warning",
      success: "border-success/20 bg-success/5 text-success",
      info: "border-info/20 bg-info/5 text-info",
    })[props.tone ?? ""] ?? "border-outline bg-muted/40 text-foreground",
);
</script>
<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    class="flex items-start gap-3 rounded-lg border p-3 text-sm"
    :class="toneClasses"
  >
    <UiIcon
      v-if="icon"
      :name="icon"
      class="mt-0.5 shrink-0"
    />
    <div class="min-w-0">
      <p
        v-if="title"
        class="font-medium"
      >
        {{ title }}
      </p>
      <p
        v-if="description"
        class="mt-1 leading-6"
      >
        {{ description }}
      </p>
      <slot />
    </div>
  </div>
</template>
