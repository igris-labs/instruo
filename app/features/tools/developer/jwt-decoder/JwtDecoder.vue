<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

const input = ref("");
const result = computed(() => {
  if (!input.value.trim()) return { header: "", payload: "", error: "" };
  if (input.value.length > 200_000)
    return { header: "", payload: "", error: "Token exceeds 200,000 characters." };
  const parts = input.value.trim().split(".");
  if (parts.length !== 3)
    return { header: "", payload: "", error: "JWT must have three dot-separated parts." };
  try {
    return { header: prettyDecode(parts[0]!), payload: prettyDecode(parts[1]!), error: "" };
  } catch {
    return { header: "", payload: "", error: "Header or payload is not valid Base64URL JSON." };
  }
});
function prettyDecode(value: string) {
  const bytes = Uint8Array.from(
    atob(
      value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "="),
    ),
    (char) => char.charCodeAt(0),
  );
  const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Expected a JSON object.");
  return JSON.stringify(parsed, null, 2);
}
const { copyText: copy } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <StatusMessage
        tone="warning"
        title="Decoded, not verified"
        description="Anyone can edit JWT claims. Decoding does not verify the signature, issuer, audience, or whether the token can be trusted."
      />
      <Field
        v-slot="{ controlProps }"
        label="JWT"
        description="Never paste a production token into a shared or untrusted device."
        :error="result.error || undefined"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :rows="6"
          class="w-full font-mono"
          placeholder="eyJhbGciOi..."
        ></Textarea
      ></Field>
      <div class="grid gap-4 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Header"
          ><Textarea
            language="json"
            v-bind="controlProps"
            :model-value="result.header"
            readonly
            :rows="8"
            class="w-full font-mono"
            placeholder="Decoded header appears here."
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Payload"
          ><Textarea
            language="json"
            v-bind="controlProps"
            :model-value="result.payload"
            readonly
            :rows="8"
            class="w-full font-mono"
            placeholder="Decoded payload appears here."
          ></Textarea
        ></Field>
      </div>
      <ToolActions
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!result.payload"
          @click="copy(result.payload)"
          >{{ "Copy payload" }}</Button
        ></ToolActions
      >
    </div>
  </ToolWorkspace>
</template>
