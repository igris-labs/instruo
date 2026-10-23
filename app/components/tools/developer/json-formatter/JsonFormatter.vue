<script setup lang="ts">
const props = withDefaults(
  defineProps<{ mode: "format" | "minify"; initialValue?: string; rows?: number }>(),
  { initialValue: "", rows: 14 },
);

const input = ref(props.initialValue);
const placeholder = '{"project":"instruo","open":true}';
const { copyText } = useCopyToClipboard();

const result = computed(() => {
  if (!input.value.trim()) return { output: "", error: "" };

  try {
    return {
      output: JSON.stringify(JSON.parse(input.value), null, props.mode === "format" ? 2 : 0),
      error: "",
    };
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "JSON is invalid.",
    };
  }
});

const output = computed(() => result.value.output);
const errorMessage = computed(() => result.value.error);
</script>

<template>
  <ToolWorkbench
    :description="`JSON ${mode === 'format' ? 'formatting' : 'minification'} runs as you type.`"
  >
    <div class="grid gap-6">
      <div class="grid gap-5 lg:grid-cols-2">
        <UiField
          v-slot="{ controlProps }"
          label="JSON input"
          :error="errorMessage || undefined"
        >
          <UiTextarea
            v-bind="controlProps"
            v-model="input"
            :placeholder="placeholder"
            :rows="rows"
            class="w-full font-mono leading-6"
          />
        </UiField>
        <UiField
          v-slot="{ controlProps }"
          label="Valid JSON output"
        >
          <UiTextarea
            v-bind="controlProps"
            :model-value="output"
            readonly
            placeholder="Valid output appears here."
            :rows="rows"
            class="w-full font-mono leading-6"
          />
        </UiField>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        <UiButton
          color="neutral"
          variant="ghost"
          label="Clear"
          icon="i-tabler-rotate"
          :disabled="!input"
          @click="input = ''"
        />
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy output"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
