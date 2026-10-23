<script setup lang="ts">
const kind = ref("escape");
const input = ref("");
const output = computed(() =>
  kind.value === "escape"
    ? input.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    : kind.value === "email"
      ? "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      : "https?:\\/\\/(?:www\\.)?[^\\s]+$",
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench description="Escape literal text or copy useful starter patterns for matching.">
    <div class="grid gap-5">
      <UiSelect
        v-model="kind"
        :items="[
          { label: 'Escape literal', value: 'escape' },
          { label: 'Email starter', value: 'email' },
          { label: 'URL starter', value: 'url' },
        ]"
        class="w-full sm:max-w-xs"
      /><UiInput
        v-model="input"
        placeholder="Text to escape"
      /><UiInput
        :model-value="output"
        readonly
        class="font-mono"
      />
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy pattern"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
