<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useToolTask } from "~/features/tools/useToolTask";
import { fingerprint as calculateFingerprint } from "./fingerprint";
const publicKey = ref("");
const { output, error, busy, run } = useToolTask([publicKey]);
const keyType = computed(() => (output.value ? publicKey.value.trim().split(/\s+/)[0] : ""));
const { copyText } = useCopyToClipboard();
function calculate() {
  return run(async () => (await calculateFingerprint(publicKey.value)).fingerprint);
}
</script>
<template>
  <ToolWorkspace
    ><Field
      v-slot="{ controlProps }"
      label="OpenSSH public key"
      description="Ed25519, RSA or NIST ECDSA public key. Never paste a private key."
      ><Textarea
        v-bind="controlProps"
        v-model="publicKey"
        :rows="7"
        class="w-full font-mono"
        placeholder="ssh-ed25519 AAAA… optional-comment"
    /></Field>
    <div class="grid gap-4 @[30rem]:grid-cols-[12rem_minmax(0,1fr)]">
      <Field label="Key type"
        ><Input
          :model-value="keyType"
          readonly
          class="w-full" /></Field
      ><Field label="SHA-256 fingerprint"
        ><Input
          :model-value="output"
          readonly
          class="w-full font-mono"
      /></Field>
    </div>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Check public key"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      Compare this fingerprint with a trusted source. A matching fingerprint alone does not
      establish who owns the key.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy fingerprint</Button
      ><Button
        :disabled="busy || !publicKey"
        @click="calculate"
        >{{ busy ? "Calculating…" : "Calculate fingerprint" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
