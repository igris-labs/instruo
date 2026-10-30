<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useCsvJson } from "../csv-json/useCsvJson";
const { input, headers, result, busy } = useCsvJson();
headers.value = false;
input.value = "Name\tRole\nAda\tEngineer";
const alignment = ref("left");
const output = computed(() => {
  if (!result.value.output) return "";
  const rows = JSON.parse(result.value.output) as string[][];
  if (!rows.length) return "";
  const escape = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\|/g, "\\|")
      .replace(/\r?\n/g, "<br>");
  const row = (items: string[]) => `| ${items.map(escape).join(" | ")} |`;
  const delimiter =
    alignment.value === "center" ? ":---:" : alignment.value === "right" ? "---:" : ":---";
  return [
    row(rows[0]!),
    `| ${rows[0]!.map(() => delimiter).join(" | ")} |`,
    ...rows.slice(1).map(row),
  ].join("\n");
});
const { copyText } = useCopyToClipboard();
function download() {
  if (output.value) downloadBlob(new Blob([output.value], { type: "text/markdown" }), "table.md");
}
</script>
<template>
  <ToolWorkspace
    ><Field
      label="Column alignment"
      class="w-full sm:max-w-xs"
      ><Select
        v-model="alignment"
        class="w-full"
        :options="[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]"
    /></Field>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Table data"
        description="Paste tab-separated spreadsheet cells or CSV. First row becomes the header."
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          language="text"
          :rows="10"
          class="h-64 w-full" /></Field
      ><Field
        v-slot="{ controlProps }"
        label="Markdown table"
        ><Textarea
          v-bind="controlProps"
          :model-value="output"
          readonly
          language="md"
          :rows="10"
          class="h-64 w-full"
      /></Field>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check table data"
      :description="result.error"
    />
    <p
      v-if="busy"
      role="status"
      class="text-muted-foreground text-sm"
    >
      Parsing table data…
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="download"
        >Download Markdown</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy table</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
