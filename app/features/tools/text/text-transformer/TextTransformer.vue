<script setup lang="ts">
import type { TransformerMode } from "./useTextTransformer";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { RadioGroup } from "~/components/ui/radio-group";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useTextTransformer } from "./useTextTransformer";
const props = defineProps<{ mode: TransformerMode }>();
const { input, operation, insensitive, trim, descending, keepEmpty, unicode, result } =
  useTextTransformer(props.mode);
const { copyText } = useCopyToClipboard();
const options = {
  case: [
    { label: "lowercase", value: "lowercase" },
    { label: "UPPERCASE", value: "uppercase" },
    { label: "Sentence case", value: "sentence" },
    { label: "Title Case", value: "title" },
    { label: "camelCase", value: "camel" },
    { label: "snake_case", value: "snake" },
    { label: "kebab-case", value: "kebab" },
  ],
  sort: [
    { label: "Alphabetical", value: "alphabetical" },
    { label: "By length", value: "length" },
    { label: "Numerical", value: "numerical" },
  ],
  reverse: [
    { label: "Characters", value: "reverse" },
    { label: "Word order", value: "words" },
    { label: "Line order", value: "lines" },
  ],
  slug: [
    { label: "Hyphens", value: "slug" },
    { label: "Underscores", value: "underscore" },
  ],
  whitespace: [
    { label: "Clean all whitespace", value: "whitespace" },
    { label: "Trim each line", value: "trim-lines" },
    { label: "Remove empty lines", value: "empty-lines" },
    { label: "Normalize line endings (LF)", value: "line-endings" },
  ],
  dedupe: [],
};
function download() {
  if (result.value.output)
    downloadBlob(
      new Blob([result.value.output], { type: "text/plain;charset=utf-8" }),
      "transformed.txt",
    );
}
</script>
<template>
  <ToolWorkspace>
    <RadioGroup
      v-if="mode === 'case' || mode === 'sort'"
      v-model="operation"
      :options="options[mode]"
      orientation="horizontal"
      aria-label="Transformation"
      :ui="{ root: 'flex-wrap' }"
    />
    <Field
      v-else-if="options[mode].length"
      label="Transformation"
      class="w-full sm:max-w-xs"
      ><Select
        v-model="operation"
        class="w-full"
        :options="options[mode]"
    /></Field>
    <div
      v-if="['dedupe', 'sort', 'slug'].includes(mode)"
      class="flex flex-wrap gap-4"
    >
      <Checkbox
        v-if="mode !== 'slug'"
        v-model="insensitive"
        label="Ignore letter case"
      />
      <Checkbox
        v-if="mode === 'dedupe'"
        v-model="trim"
        label="Ignore surrounding whitespace"
      />
      <Checkbox
        v-if="mode === 'sort'"
        v-model="descending"
        label="Descending order"
      />
      <Checkbox
        v-if="mode === 'sort'"
        v-model="keepEmpty"
        label="Keep empty lines"
      />
      <Checkbox
        v-if="mode === 'slug'"
        v-model="unicode"
        label="Keep Unicode characters"
      />
    </div>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Input"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          placeholder="Type or paste text…"
          :rows="12"
          class="w-full"
      /></Field>
      <Field
        v-slot="{ controlProps }"
        label="Output"
        ><Textarea
          v-bind="controlProps"
          :model-value="result.output"
          readonly
          placeholder="Transformed text appears here."
          :rows="12"
          class="w-full"
      /></Field>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check your text"
      :description="result.error"
    />
    <p
      v-else
      role="status"
      class="text-muted-foreground text-xs tabular-nums"
    >
      {{
        result.note ||
        `${input.length.toLocaleString()} input characters · ${result.output.length.toLocaleString()} output characters`
      }}
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
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="input = result.output"
        >Use output as input</Button
      >
      <Button
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="download"
        >Download</Button
      >
      <Button
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="copyText(result.output)"
        ><Icon
          name="tabler:copy"
          class="mr-1.5"
        />Copy output</Button
      >
    </ToolActions>
  </ToolWorkspace>
</template>
