<script setup lang="ts">
type Hash = "SHA-256" | "SHA-384" | "SHA-512";
const password = ref("");
const salt = ref("instruo-demo-salt");
const iterations = ref(100_000);
const hash = ref<Hash>("SHA-256");
const output = ref("");
const status = ref("");
const { copyText } = useCopyToClipboard();
const hashes = ["SHA-256", "SHA-384", "SHA-512"];
function hex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function derive() {
  try {
    const base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password.value),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt.value) as unknown as BufferSource,
        iterations: Math.min(1_000_000, Math.max(1, Math.floor(iterations.value))),
        hash: hash.value,
      },
      base,
      256,
    );
    output.value = hex(new Uint8Array(bits));
    status.value = "Derived 256-bit key locally.";
  } catch {
    output.value = "";
    status.value = "Could not derive key. Check values and browser support.";
  }
}
</script>

<template>
  <ToolWorkbench
    description="Derive a deterministic key from a password and salt with PBKDF2 in Web Crypto."
  >
    <div class="grid gap-5">
      <div class="grid gap-4 lg:grid-cols-2">
        <UiField label="Password"
          ><UiInput
            v-model="password"
            type="password"
            class="w-full"
        /></UiField>
        <UiField
          label="Salt"
          description="Use a unique, non-secret salt in production."
          ><UiInput
            v-model="salt"
            class="w-full font-mono"
        /></UiField>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiField label="Iterations"
          ><UiNumberField
            v-model="iterations"
            :step-snapping="false"
            :min="1"
            :max="1000000"
            class="w-full"
        /></UiField>
        <UiField label="Hash"
          ><UiSelect
            v-model="hash"
            :items="hashes"
            class="w-full"
        /></UiField>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton
          label="Derive key"
          icon="i-tabler-lock"
          @click="derive"
        /><UiButton
          label="Copy hex"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
      <UiField
        v-slot="{ controlProps }"
        label="Derived key (hex)"
        ><UiTextarea
          v-bind="controlProps"
          v-model="output"
          :rows="4"
          readonly
          class="w-full font-mono"
      /></UiField>
      <p
        v-if="status"
        class="text-foreground-muted text-sm"
        role="status"
      >
        {{ status }}
      </p>
    </div>
  </ToolWorkbench>
</template>
