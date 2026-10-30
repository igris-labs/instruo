<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { downloadBlob } from "~/utils/browser-tools";
import { useSchemaStudio } from "./useSchemaStudio";
const { source, schema, required, closed, status, tone, busy, generate, validate } =
  useSchemaStudio();
const { copyText } = useCopyToClipboard();
function download() {
  if (schema.value)
    downloadBlob(new Blob([schema.value], { type: "application/schema+json" }), "schema.json");
}
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap gap-4">
      <Checkbox
        v-model="required"
        label="Require observed properties"
      />
      <Checkbox
        v-model="closed"
        label="Disallow extra properties"
      />
    </div>
    <p class="text-muted-foreground text-xs">
      Generation options apply the next time you generate. Validation uses JSON Schema 2020-12,
      including formats and local references. Remote references are not fetched.
    </p>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="JSON document"
        ><Textarea
          v-bind="controlProps"
          v-model="source"
          language="json"
          :rows="14"
          class="w-full"
      /></Field>
      <Field
        v-slot="{ controlProps }"
        label="JSON Schema"
        description="Edit generated rules before validating."
        ><Textarea
          v-bind="controlProps"
          v-model="schema"
          language="json"
          :rows="14"
          class="w-full"
      /></Field>
    </div>
    <ToolActions>
      <Button
        color="secondary"
        variant="outline"
        :disabled="!schema"
        @click="download"
        >Download schema</Button
      >
      <Button
        color="secondary"
        variant="outline"
        :disabled="!schema"
        @click="copyText(schema)"
        ><Icon
          name="tabler:copy"
          class="mr-1.5"
        />Copy schema</Button
      >
      <Button
        color="secondary"
        variant="outline"
        :disabled="!schema || !source || busy"
        @click="validate"
        ><Icon
          name="tabler:shield-check"
          class="mr-1.5"
        />{{ busy ? "Validating…" : "Validate JSON" }}</Button
      >
      <Button
        :disabled="!source || busy"
        @click="generate"
        ><Icon
          name="tabler:sparkles"
          class="mr-1.5"
        />Generate schema</Button
      >
    </ToolActions>
    <StatusMessage
      v-if="status"
      :tone="tone"
      :icon="
        tone === 'success'
          ? 'tabler:circle-check'
          : tone === 'error'
            ? 'tabler:alert-circle'
            : undefined
      "
      title="Schema status"
      :description="status"
    />
  </ToolWorkspace>
</template>
