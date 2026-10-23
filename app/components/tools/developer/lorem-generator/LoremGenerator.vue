<script setup lang="ts">
const count = ref(3);
const { copyText } = useCopyToClipboard();
const sentences = [
  "Small tools keep work moving.",
  "Good interfaces make busy tasks feel clear.",
  "Useful defaults remove needless friction.",
  "A focused browser tab can solve a surprising amount.",
  "Simple output is easier to trust and reuse.",
  "Local utilities respect your time and data.",
];
const output = computed(() =>
  Array.from(
    { length: Math.max(1, Math.min(12, count.value || 1)) },
    (_, index) => sentences[index % sentences.length],
  ).join(" "),
);
</script>

<template>
  <ToolWorkbench description="Generate short placeholder copy locally for drafts and prototypes.">
    <div class="mx-auto grid max-w-xl gap-6">
      <UiField label="Sentence count">
        <UiNumberField
          v-model="count"
          :step-snapping="false"
          :min="1"
          :max="12"
          class="w-full"
        />
      </UiField>
      <p class="border-outline/70 text-foreground-muted rounded-lg border p-5 text-base leading-8">
        {{ output }}
      </p>
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy text"
          icon="i-tabler-copy"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
