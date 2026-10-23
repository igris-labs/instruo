<script setup lang="ts">
const input = ref(`query User($id: ID!) { user(id: $id) { id name email } }`);
const indent = ref("2");
const { copyText } = useCopyToClipboard();
const formatted = computed(() => {
  const source = input.value
    .replace(/\s+/g, " ")
    .replace(/\s*([{}():!,])\s*/g, "$1")
    .trim();
  let depth = 0;
  let output = "";
  for (const char of source) {
    if (char === "{") {
      output += " {\n";
      depth += 1;
      output += " ".repeat(depth * Number(indent.value));
    } else if (char === "}") {
      depth -= 1;
      output = `${output.trimEnd()}\n${" ".repeat(depth * Number(indent.value))}}`;
    } else if (char === " ") output += `\n${" ".repeat(depth * Number(indent.value))}`;
    else output += char;
  }
  return output.replace(/\n +\n/g, "\n").trim();
});
const balanced = computed(
  () => (input.value.match(/\{/g)?.length ?? 0) === (input.value.match(/\}/g)?.length ?? 0),
);
</script>

<template>
  <ToolWorkbench
    description="Format GraphQL operations locally without sending queries to a server."
  >
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <UiField
          v-slot="{ controlProps }"
          label="GraphQL document"
        >
          <UiTextarea
            v-bind="controlProps"
            v-model="input"
            :rows="12"
            class="w-full font-mono"
          />
        </UiField>
        <UiField label="Indent">
          <UiSelect
            v-model="indent"
            :items="['2', '4']"
            class="w-full"
          />
        </UiField>
      </div>
      <UiNotice
        v-if="!balanced"
        tone="error"
        title="Unbalanced braces"
        description="Check opening and closing braces before copying."
      />
      <UiField
        v-slot="{ controlProps }"
        label="Formatted query"
      >
        <UiTextarea
          v-bind="controlProps"
          :model-value="formatted"
          :rows="14"
          readonly
          class="w-full font-mono"
        />
      </UiField>
      <div class="flex justify-end">
        <UiButton
          label="Copy query"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          @click="copyText(formatted)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
