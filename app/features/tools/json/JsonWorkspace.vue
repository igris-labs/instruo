<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import Textarea from "../../../components/adapters/Textarea.vue";
import { Button } from "../../../components/ui/button";
import { Field } from "../../../components/ui/field";
import { Select } from "../../../components/ui/select";
import { transformJson } from "./logic";

const props = withDefaults(defineProps<{ demo?: boolean }>(), { demo: false });
const input = ref(props.demo ? '{"project":"Instruo","tools":["JSON","Images"],"ready":true}' : "");
const mode = ref<"format" | "minify">("format");
const result = computed(() => transformJson(input.value, mode.value));
const feedback = ref("");
const status = computed(() =>
  result.value.error ? "Invalid JSON" : result.value.output ? "Valid JSON" : "Paste JSON to begin",
);
watch([input, mode], () => {
  feedback.value = "";
});
async function copy() {
  try {
    await navigator.clipboard.writeText(result.value.output);
    feedback.value = "Copied to clipboard";
  } catch {
    feedback.value = "Copy unavailable. Select the output and copy it manually.";
  }
}
function download() {
  const blob = new Blob([result.value.output], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: "formatted.json",
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>
<template>
  <section
    data-tool-layout="workbench"
    class="border-border bg-card overflow-hidden rounded-lg border"
    aria-label="JSON workspace"
    data-ui
  >
    <div class="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div class="flex items-center gap-2 text-[13px]">
        <Icon
          name="tabler:braces"
          mode="svg"
          class="size-4"
        /><span class="font-medium">JSON</span
        ><span class="text-muted-foreground">→ readable data</span>
      </div>
      <Select
        v-model="mode"
        aria-label="Output style"
        :options="[
          { value: 'format', label: 'Formatted' },
          { value: 'minify', label: 'Minified' },
        ]"
        class="w-32"
      />
    </div>
    <div class="grid min-w-0 gap-5 p-4 md:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="JSON input"
        :error="result.error || undefined"
      >
        <Textarea
          v-bind="controlProps"
          v-model="input"
          language="json"
          :rows="demo ? 7 : 14"
          spellcheck="false"
          placeholder="Paste a JSON object or array…"
          :class="demo ? 'min-h-48' : 'min-h-80'"
        />
      </Field>
      <Field
        v-slot="{ controlProps }"
        label="JSON output"
      >
        <Textarea
          language="json"
          v-bind="controlProps"
          :model-value="result.output"
          readonly
          :rows="demo ? 7 : 14"
          placeholder="Your formatted JSON appears here."
          :class="demo ? 'min-h-48' : 'min-h-80'"
        />
      </Field>
    </div>
    <div class="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p
        role="status"
        class="text-muted-foreground max-w-full text-xs"
        :class="result.error && 'text-destructive'"
      >
        {{ feedback || status }}
      </p>
      <ToolActions>
        <Button
          color="secondary"
          variant="ghost"
          :disabled="!input"
          @click="input = ''"
          >Clear</Button
        >
        <Button
          v-if="!demo"
          color="secondary"
          variant="outline"
          :disabled="!result.output"
          @click="download"
          ><Icon
            name="tabler:download"
            mode="svg"
          />Download</Button
        >
        <Button
          color="secondary"
          variant="outline"
          :disabled="!result.output"
          @click="copy"
          ><Icon
            name="tabler:copy"
            mode="svg"
          />Copy JSON</Button
        >
      </ToolActions>
    </div>
  </section>
</template>
