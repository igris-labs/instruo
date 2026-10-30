<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useJsonPath } from "./useJsonPath";
const { input, path, withPaths, output, error, count, busy, run } = useJsonPath();
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap items-end gap-4">
      <Field
        v-slot="{ controlProps }"
        label="JSONPath"
        class="min-w-0 grow"
        description="Properties, recursive descent, wildcards, slices and filters."
      >
        <Input
          v-bind="controlProps"
          v-model="path"
          class="w-full font-mono"
          placeholder="$.users[*].name"
          @keydown.enter="run"
        />
      </Field>
      <Checkbox
        v-model="withPaths"
        label="Include matching paths"
      />
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="query in [
          '$.users[*].name',
          '$..name',
          '$.users[?@.active == true]',
          '$.users[0:1]',
        ]"
        :key="query"
        color="secondary"
        variant="ghost"
        class="font-mono"
        @click="
          path = query;
          run();
        "
        >{{ query }}</Button
      >
    </div>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="JSON document"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          language="json"
          :rows="14"
          class="w-full"
      /></Field>
      <Field
        v-slot="{ controlProps }"
        label="Result"
        ><Textarea
          v-bind="controlProps"
          :model-value="output"
          language="json"
          :rows="14"
          readonly
          class="w-full"
          :placeholder="busy ? 'Running locally…' : 'Run the query to see matching values.'"
      /></Field>
    </div>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Invalid query"
      :description="error"
    />
    <p
      v-else
      role="status"
      class="text-muted-foreground text-xs tabular-nums"
    >
      {{
        busy
          ? "Running locally…"
          : output
            ? `${count} matches · results are always an array.`
            : "Query or document changed. Run again to update the result."
      }}
    </p>
    <ToolActions>
      <Button
        color="secondary"
        variant="outline"
        :disabled="!output || busy"
        @click="copyText(output)"
        ><Icon
          name="tabler:copy"
          class="mr-1.5"
        />Copy result</Button
      >
      <Button
        :disabled="!input || !path || busy"
        @click="run"
        ><Icon
          name="tabler:player-play-filled"
          class="mr-1.5"
        />{{ busy ? "Running…" : "Run query" }}</Button
      >
    </ToolActions>
    <p class="text-muted-foreground text-xs">
      Queries are parsed, not executed as JavaScript. 1 MB input limit, 10,000 result limit, with
      slow queries stopped after four seconds.
    </p>
  </ToolWorkspace>
</template>
