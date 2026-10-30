<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useJsonYaml } from "./useJsonYaml";
const { input, direction, indent, result, swap } = useJsonYaml();
const { copyText } = useCopyToClipboard();
function download() {
  if (result.value.output)
    downloadBlob(
      new Blob([result.value.output], { type: "text/plain;charset=utf-8" }),
      direction.value === "json-yaml" ? "converted.yaml" : "converted.json",
    );
}
function example() {
  input.value =
    direction.value === "json-yaml"
      ? '{"name":"Ada","active":true,"tags":["math"]}'
      : "name: Ada\nactive: true\ntags:\n  - math";
}
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap items-end gap-4">
      <Field
        label="Conversion"
        class="w-full sm:w-52"
        ><Select
          v-model="direction"
          class="w-full"
          :options="[
            { label: 'JSON → YAML', value: 'json-yaml' },
            { label: 'YAML → JSON', value: 'yaml-json' },
          ]"
      /></Field>
      <Field
        label="Indent"
        class="w-full sm:w-32"
        ><Select
          v-model="indent"
          class="w-full"
          :options="['2', '4'].map((value) => ({ value, label: `${value} spaces` }))"
      /></Field>
      <Button
        class="sm:ml-auto"
        color="secondary"
        variant="outline"
        @click="example"
        >Load example</Button
      >
    </div>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        :label="direction === 'json-yaml' ? 'JSON input' : 'YAML input'"
      >
        <Textarea
          v-bind="controlProps"
          v-model="input"
          :language="direction === 'json-yaml' ? 'json' : 'yaml'"
          :rows="14"
          class="w-full"
          placeholder="Paste a document…"
        />
      </Field>
      <Field
        v-slot="{ controlProps }"
        :label="direction === 'json-yaml' ? 'YAML output' : 'JSON output'"
      >
        <Textarea
          v-bind="controlProps"
          :model-value="result.output"
          :language="direction === 'json-yaml' ? 'yaml' : 'json'"
          :rows="14"
          class="w-full"
          readonly
          placeholder="Converted output appears here."
        />
      </Field>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check your document"
      :description="result.error"
    />
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
        @click="swap"
        ><Icon
          name="tabler:arrows-exchange"
          class="mr-1.5"
        />Swap direction</Button
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
    <p class="text-muted-foreground text-xs">
      Up to 1 MB. Conversion preserves values, not YAML comments or formatting. Unsupported tags,
      duplicate keys and values JSON cannot represent are reported.
    </p>
  </ToolWorkspace>
</template>
