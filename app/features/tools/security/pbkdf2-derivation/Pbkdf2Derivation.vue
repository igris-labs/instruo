<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { useToolTask } from "~/features/tools/useToolTask";
type Hash = "SHA-256" | "SHA-384" | "SHA-512";
const password = ref("");
const salt = ref("");
const iterations = ref(100_000);
const hash = ref<Hash>("SHA-256");
const hashes = ["SHA-256", "SHA-384", "SHA-512"];
const { output, error, busy, run } = useToolTask([password, salt, iterations, hash]);
const status = computed(
  () =>
    error.value ||
    (output.value
      ? "Derived 256-bit key locally. Salt is UTF-8 text; iterations are used exactly as entered."
      : ""),
);
const { copyText } = useCopyToClipboard();
function randomSalt() {
  salt.value = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
onMounted(randomSalt);
function derive() {
  return run(async () => {
    const pass = password.value;
    const saltText = salt.value;
    const count = iterations.value;
    const selected = hash.value;
    if (!pass || !saltText) throw new Error("Enter a password and salt.");
    if (!Number.isInteger(count) || count < 1 || count > 1_000_000)
      throw new Error("Use 1–1,000,000 whole iterations.");
    const base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(pass),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(saltText),
        iterations: count,
        hash: selected,
      },
      base,
      256,
    );
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
  });
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[48rem]:grid-cols-2">
        <Field label="Password"
          ><Input
            v-model="password"
            type="password"
            class="w-full"
          ></Input></Field
        ><Field
          label="Salt"
          description="Use a unique, non-secret salt in production."
          ><Input
            v-model="salt"
            class="w-full font-mono"
          ></Input
        ></Field>
      </div>
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="Iterations"
          ><NumberField
            v-model="iterations"
            :step-snapping="false"
            :min="1"
            :max="1000000"
            class="w-full"
          ></NumberField></Field
        ><Field label="Hash"
          ><Select
            v-model="hash"
            class="w-full"
            :options="selectOptions(hashes)"
          ></Select
        ></Field>
      </div>

      <Field
        v-slot="{ controlProps }"
        label="Derived key (hex)"
        ><Textarea
          v-bind="controlProps"
          v-model="output"
          :rows="4"
          readonly
          class="w-full font-mono"
        ></Textarea
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
      /><ToolActions
        ><Button
          color="secondary"
          variant="outline"
          @click="randomSalt"
          >New random salt</Button
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
          />Copy hex</Button
        >
        <Button
          :disabled="busy"
          @click="derive"
          ><Icon
            name="tabler:lock"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Derive key</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
