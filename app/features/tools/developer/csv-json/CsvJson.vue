<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useCsvJson } from "./useCsvJson";
const { input, delimiter, headers, typed, result, busy } = useCsvJson();
const { copyText } = useCopyToClipboard();
const example = 'name,notes\nAda,"First line\nSecond line"';
function download() {
  if (result.value.output)
    downloadBlob(new Blob([result.value.output], { type: "application/json" }), "converted.json");
}
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap items-end gap-4">
      <Field
        label="Delimiter"
        class="w-full sm:w-48"
        ><Select
          v-model="delimiter"
          class="w-full"
          :options="[
            { value: 'auto', label: 'Auto detect' },
            { value: ',', label: 'Comma' },
            { value: ';', label: 'Semicolon' },
            { value: '\t', label: 'Tab' },
            { value: '|', label: 'Pipe' },
          ]"
      /></Field>
      <Checkbox
        v-model="headers"
        label="First row contains headers"
      />
      <Checkbox
        v-model="typed"
        label="Convert numbers and booleans"
      />
      <Button
        color="secondary"
        variant="outline"
        class="sm:ml-auto"
        @click="input = example"
        >Load example</Button
      >
    </div>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="CSV input"
        description="Quoted delimiters, escaped quotes and multi-line values are supported. Up to 1 MB."
      >
        <Textarea
          v-bind="controlProps"
          v-model="input"
          language="csv"
          :rows="14"
          class="w-full"
          placeholder="name,score"
        />
      </Field>
      <Field
        v-slot="{ controlProps }"
        label="JSON output"
      >
        <Textarea
          v-bind="controlProps"
          :model-value="result.output"
          language="json"
          readonly
          :rows="14"
          class="w-full"
          placeholder="Converted rows appear here."
        />
      </Field>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check your CSV"
      :description="result.error"
    />
    <p
      v-else
      role="status"
      class="text-muted-foreground text-xs tabular-nums"
    >
      {{
        busy
          ? "Parsing locally…"
          : `${result.rows} rows · ${result.columns} columns. Values stay strings unless conversion is enabled.`
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
        @click="download"
        >Download JSON</Button
      >
      <Button
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="copyText(result.output)"
        ><Icon
          name="tabler:copy"
          class="mr-1.5"
        />Copy JSON</Button
      >
    </ToolActions>
  </ToolWorkspace>
</template>
