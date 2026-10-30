<script setup lang="ts">
import type { EncoderKind } from "./useEncoderDecoder";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { RadioGroup } from "~/components/ui/radio-group";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useEncoderDecoder } from "./useEncoderDecoder";
const props = defineProps<{ kind: EncoderKind }>();
const { input, operation, variant, result, swap } = useEncoderDecoder(props.kind);
const { copyText } = useCopyToClipboard();
const name = { base64: "Base64", binary: "binary", morse: "Morse code", url: "URL" }[props.kind];
function download() {
  if (result.value.output)
    downloadBlob(
      new Blob([result.value.output], { type: "text/plain;charset=utf-8" }),
      "converted.txt",
    );
}
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap items-end gap-4">
      <RadioGroup
        v-model="operation"
        :options="[
          { label: 'Encode', value: 'encode' },
          { label: 'Decode', value: 'decode' },
        ]"
        orientation="horizontal"
        aria-label="Operation"
      />
      <Field
        v-if="kind === 'base64' || kind === 'url'"
        :label="kind === 'base64' ? 'Alphabet' : 'URL mode'"
        class="w-full sm:ml-auto sm:w-64"
      >
        <Select
          v-model="variant"
          class="w-full"
          :options="
            kind === 'base64'
              ? [
                  { label: 'Standard Base64', value: 'standard' },
                  { label: 'Base64URL · no padding', value: 'url' },
                ]
              : [
                  { label: 'Component · escape reserved characters', value: 'standard' },
                  { label: 'Full URI · keep reserved characters', value: 'uri' },
                ]
          "
        />
      </Field>
    </div>
    <p class="text-muted-foreground text-xs">
      {{
        kind === "morse"
          ? "Latin letters, digits and standard punctuation. Spaces between letters, / between words. Unsupported characters are reported, never dropped."
          : kind === "url"
            ? "Component mode escapes &, =, / and ?. Full URI mode preserves URL separators; it does not convert + to a space."
            : "Text is encoded as UTF-8. Decoding reports invalid bytes instead of replacing characters."
      }}
    </p>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Input"
        :description="`Text or ${name} to ${operation}.`"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :rows="12"
          class="w-full"
          :placeholder="`Enter ${name} input…`"
      /></Field>
      <Field
        v-slot="{ controlProps }"
        label="Output"
        description="Read-only result."
        :error="result.error || undefined"
        ><Textarea
          v-bind="controlProps"
          :model-value="result.output"
          :rows="12"
          readonly
          class="w-full"
          :placeholder="result.error ? 'Fix the input to continue.' : 'Output appears here.'"
      /></Field>
    </div>
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
  </ToolWorkspace>
</template>
