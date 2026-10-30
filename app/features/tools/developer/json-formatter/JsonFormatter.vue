<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

import { Select } from "~/components/ui/select";

const props = withDefaults(
  defineProps<{ mode: "format" | "minify"; initialValue?: string; rows?: number }>(),
  { initialValue: "", rows: 14 },
);
const indent = ref("2");
const input = ref(props.initialValue);
const placeholder = '{"project":"instruo","open":true}';
const { copyText } = useCopyToClipboard();

const result = computed(() => {
  if (!input.value.trim()) return { output: "", error: "" };

  try {
    if (input.value.length > 2_000_000)
      throw new Error("Use JSON smaller than 2 million characters.");
    return {
      output: JSON.stringify(
        JSON.parse(input.value),
        null,
        props.mode === "format" ? (indent.value === "tab" ? "\t" : Number(indent.value)) : 0,
      ),
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
  <ToolWorkspace>
    <div class="grid gap-6">
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="JSON input"
          :error="errorMessage || undefined"
          ><Textarea
            v-bind="controlProps"
            v-model="input"
            language="json"
            :placeholder="placeholder"
            :rows="rows"
            class="w-full font-mono leading-6"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Valid JSON output"
          ><Textarea
            language="json"
            v-bind="controlProps"
            :model-value="output"
            readonly
            placeholder="Valid output appears here."
            :rows="rows"
            class="w-full font-mono leading-6"
          ></Textarea
        ></Field>
      </div>
      <Field
        v-if="mode === 'format'"
        label="Indentation"
        class="max-w-48"
        ><Select
          v-model="indent"
          :options="[
            { label: '2 spaces', value: '2' },
            { label: '4 spaces', value: '4' },
            { label: 'Tab', value: 'tab' },
          ]"
      /></Field>
      <p class="text-muted-foreground text-xs">
        Uses JavaScript JSON parsing: numbers outside safe integer precision may be rounded.
        Duplicate object keys retain the last value.
      </p>
      <ToolActions>
        <Button
          color="secondary"
          variant="ghost"
          :disabled="!input"
          @click="input = ''"
          ><Icon
            name="tabler:rotate"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Clear</Button
        >
        <Button
          :disabled="!output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy output</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
