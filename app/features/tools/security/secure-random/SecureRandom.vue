<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";
import { useToolTask } from "~/features/tools/useToolTask";
import { secureToken } from "./random";
const length = ref(24);
const alphabet = ref("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789");
const { output, error, busy, run } = useToolTask([length, alphabet]);
const { copyText } = useCopyToClipboard();
function generate() {
  return run(() => secureToken(alphabet.value, length.value));
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-5 @[30rem]:grid-cols-[12rem_minmax(0,1fr)]">
      <Field
        label="Length"
        description="1–512 Unicode characters."
        ><NumberField
          v-model="length"
          :min="1"
          :max="512"
          class="w-full" /></Field
      ><Field
        label="Alphabet"
        description="2–256 unique characters. Duplicate characters are removed before sampling."
        ><Input
          v-model="alphabet"
          class="w-full"
      /></Field>
    </div>
    <Field
      v-slot="{ controlProps }"
      label="Generated token"
      ><Textarea
        v-bind="controlProps"
        :model-value="output"
        :rows="6"
        readonly
        class="w-full font-mono"
        placeholder="Generate a token to see it here." /></Field
    ><StatusMessage
      v-if="error"
      tone="error"
      title="Check settings"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      Cryptographically random, unbiased sampling. Tokens stay in memory and are not saved.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy token</Button
      ><Button
        :disabled="busy"
        @click="generate"
        >Generate</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
