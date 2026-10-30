<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { useToolTask } from "~/features/tools/useToolTask";
const input = ref("");
const { output, error, busy, run } = useToolTask([input]);
const { copyText } = useCopyToClipboard();
function inspect() {
  return run(async () => {
    const source = input.value;
    if (source.length > 1_000_000) throw new Error("Use a PEM document smaller than 1 MB.");
    const blocks = [...source.matchAll(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g)];
    if (!blocks.length) throw new Error("No complete PEM block found.");
    if (blocks.length > 30) throw new Error("Inspect up to 30 PEM blocks at a time.");
    const results = [];
    for (const block of blocks) {
      const bytes = Uint8Array.from(atob(block[2]!.replace(/\s/g, "")), (char) =>
        char.charCodeAt(0),
      );
      if (!bytes.length) throw new Error("The PEM block is empty.");
      const sha256 = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (byte) => byte.toString(16).padStart(2, "0"),
      ).join("");
      let certificate = {};
      if (block[1] === "CERTIFICATE") {
        await import("reflect-metadata");
        const { X509Certificate } = await import("@peculiar/x509");
        const cert = new X509Certificate(block[0]);
        const now = Date.now();
        certificate = {
          subject: cert.subject,
          issuer: cert.issuer,
          serialNumber: cert.serialNumber,
          notBefore: cert.notBefore.toISOString(),
          notAfter: cert.notAfter.toISOString(),
          validity:
            now < cert.notBefore.getTime()
              ? "Not yet valid"
              : now > cert.notAfter.getTime()
                ? "Expired"
                : "Within validity dates",
          daysUntilExpiry: Math.ceil((cert.notAfter.getTime() - now) / 86400000),
        };
      }
      results.push({ type: block[1], bytes: bytes.length, sha256, ...certificate });
    }
    return JSON.stringify(results, null, 2);
  });
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="PEM document"
        description="Paste one certificate or a PEM chain."
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :rows="16"
          class="w-full font-mono"
          placeholder="-----BEGIN CERTIFICATE-----" /></Field
      ><Field
        v-slot="{ controlProps }"
        label="Inspection result"
        ><Textarea
          v-bind="controlProps"
          :model-value="output"
          language="json"
          :rows="16"
          readonly
          class="w-full"
          placeholder="Certificate details and fingerprints appear here."
      /></Field>
    </div>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Could not inspect PEM"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      Validity dates are not certificate-chain, hostname, revocation or trust verification.
      Private-key material is sensitive; no keys or certificates are uploaded.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy inspection</Button
      ><Button
        :disabled="busy || !input"
        @click="inspect"
        >{{ busy ? "Inspecting…" : "Inspect PEM" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
