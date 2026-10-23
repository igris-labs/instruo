<script setup lang="ts">
import { formatMarkup } from "~/utils/browser-tools";
const input = ref("");
const mode = ref<"format" | "minify">("format");
const output = computed(() => formatMarkup(input.value, mode.value === "minify"));
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench
    description="Format readable HTML or remove unnecessary whitespace before shipping it."
  >
    <div class="grid gap-5">
      <UiSelect
        v-model="mode"
        :items="['format', 'minify']"
        class="w-full sm:max-w-xs"
      />
      <div class="grid gap-5 lg:grid-cols-2">
        <UiTextarea
          v-model="input"
          :rows="16"
          placeholder="Paste HTML…"
        /><UiTextarea
          :model-value="output"
          :rows="16"
          readonly
          placeholder="Formatted HTML appears here."
        />
      </div>
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy HTML"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
