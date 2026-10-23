<script setup lang="ts">
const input = ref("");
const { copyText } = useCopyToClipboard();
const output = computed(() =>
  input.value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .trim(),
);
</script>

<template>
  <ToolWorkbench description="Remove comments and unnecessary whitespace from CSS locally.">
    <div class="grid gap-6 lg:grid-cols-2">
      <UiField
        v-slot="{ controlProps }"
        label="CSS input"
      >
        <UiTextarea
          v-bind="controlProps"
          v-model="input"
          autoresize
          :rows="14"
          class="w-full font-mono"
          placeholder=".card { color: black; }"
        /> </UiField
      ><UiField
        v-slot="{ controlProps }"
        label="Minified CSS"
      >
        <UiTextarea
          v-bind="controlProps"
          :model-value="output"
          readonly
          :rows="14"
          class="w-full font-mono"
          placeholder="Minified CSS appears here."
        />
      </UiField>
    </div>
    <div class="mt-5 flex justify-end">
      <UiButton
        color="neutral"
        variant="soft"
        label="Copy CSS"
        icon="i-tabler-copy"
        :disabled="!output"
        @click="copyText(output)"
      />
    </div>
  </ToolWorkbench>
</template>
