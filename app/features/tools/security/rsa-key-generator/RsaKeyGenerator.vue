<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { useToolTask } from "~/features/tools/useToolTask";
const bits = ref("2048");
const { output, error, busy: loading, run } = useToolTask([bits]);
const { copyText } = useCopyToClipboard();
function pem(label: string, value: ArrayBuffer) {
  const body = Array.from(new Uint8Array(value), (byte) => String.fromCharCode(byte)).join("");
  return `-----BEGIN ${label}-----\n${
    btoa(body)
      .match(/.{1,64}/g)
      ?.join("\n") ?? ""
  }\n-----END ${label}-----`;
}
function generate() {
  return run(async () => {
    const size = Number(bits.value);
    if (![2048, 3072, 4096].includes(size)) throw new Error("Choose a supported RSA size.");
    const pair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: size,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );
    return `${pem("PUBLIC KEY", await crypto.subtle.exportKey("spki", pair.publicKey))}\n\n${pem(
      "PRIVATE KEY",
      await crypto.subtle.exportKey("pkcs8", pair.privateKey),
    )}`;
  });
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="RSA key size"
        ><Select
          v-model="bits"
          class="w-full sm:max-w-xs"
          :options="
            [2048, 3072, 4096].map((size) => ({
              value: String(size),
              label: `${String(size)} bits`,
            }))
          "
      /></Field>
      <p class="text-muted-foreground text-xs">
        RSA-OAEP with SHA-256 for encryption. Exported keys are unencrypted; keep the private key
        secret. No keys are saved.
      </p>
      <Field
        v-slot="{ controlProps }"
        label="Generated PEM key pair"
        ><Textarea
          v-bind="controlProps"
          v-model="output"
          :rows="20"
          readonly
          class="w-full font-mono text-xs"
          placeholder="PEM keys appear here."
        ></Textarea
      ></Field>
      <StatusMessage
        v-if="error"
        tone="error"
        title="Operation failed"
        :description="error"
      /><ToolActions>
        <Button
          :disabled="!output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          >Copy keys</Button
        >
        <Button
          :loading="loading"
          :disabled="loading"
          @click="generate"
          ><Icon
            name="tabler:key"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Generate key pair</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
