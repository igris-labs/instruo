<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { useToolTask } from "~/features/tools/useToolTask";
type Algorithm = "SHA-256" | "SHA-384" | "SHA-512";
const secret = ref("");
const message = ref("");
const expected = ref("");
const algorithm = ref<Algorithm>("SHA-256");
const algorithms = ["SHA-256", "SHA-384", "SHA-512"];
const { output, error, busy, run } = useToolTask([secret, message, expected, algorithm]);
const result = computed(() =>
  output.value
    ? (JSON.parse(output.value) as { signature: string; verified: boolean | null })
    : null,
);
const signature = computed(() => result.value?.signature ?? "");
const status = computed(
  () =>
    error.value ||
    (result.value
      ? result.value.verified === null
        ? "Signature generated."
        : result.value.verified
          ? "Signature matches."
          : "Signature does not match."
      : ""),
);
const { copyText } = useCopyToClipboard();
function generate() {
  return run(async () => {
    const text = message.value;
    const keyText = secret.value;
    const target = expected.value.trim();
    const hash = algorithm.value;
    if (!keyText) throw new Error("Enter a shared secret.");
    if (text.length > 1_000_000)
      throw new Error("Use a message smaller than 1 million characters.");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(keyText),
      { name: "HMAC", hash },
      false,
      ["sign", "verify"],
    );
    const bytes = new TextEncoder().encode(text);
    const signature = btoa(
      String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, bytes))),
    );
    let verified: boolean | null = null;
    if (target) {
      try {
        verified = await crypto.subtle.verify(
          "HMAC",
          key,
          Uint8Array.from(atob(target), (c) => c.charCodeAt(0)),
          bytes,
        );
      } catch {
        verified = false;
      }
    }
    return JSON.stringify({ signature, verified });
  });
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-[12rem_minmax(0,1fr)]">
        <Field label="Hash algorithm"
          ><Select
            v-model="algorithm"
            class="w-full"
            :options="selectOptions(algorithms)"
          ></Select></Field
        ><Field label="Secret"
          ><Input
            v-model="secret"
            type="password"
            class="w-full font-mono"
            placeholder="Shared secret"
          ></Input
        ></Field>
      </div>
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Message"
          ><Textarea
            v-bind="controlProps"
            v-model="message"
            :rows="8"
            class="w-full font-mono"
            placeholder="Message to sign"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Expected signature"
          description="Optional. Paste a Base64 signature to verify."
          ><Textarea
            v-bind="controlProps"
            v-model="expected"
            :rows="8"
            class="w-full font-mono"
            placeholder="Paste expected Base64 signature"
          ></Textarea
        ></Field>
      </div>

      <Field label="Base64 signature"
        ><Input
          v-model="signature"
          readonly
          class="w-full font-mono"
          placeholder="Signature appears here"
        ></Input
      ></Field>
      <p
        v-if="status"
        class="text-muted-foreground text-sm"
        role="status"
      >
        {{ status }}
      </p>
      <StatusMessage
        v-if="error"
        tone="error"
        title="Operation failed"
        :description="error"
      /><ToolActions>
        <Button
          :disabled="!signature"
          color="secondary"
          variant="outline"
          @click="copyText(signature)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy signature</Button
        >
        <Button
          :disabled="busy"
          @click="generate"
          ><Icon
            name="tabler:key"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Generate / verify</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
