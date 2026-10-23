<script setup lang="ts">
type Algorithm = "SHA-256" | "SHA-384" | "SHA-512";
const secret = ref("");
const message = ref("");
const expected = ref("");
const algorithm = ref<Algorithm>("SHA-256");
const signature = ref("");
const status = ref("");
const { copyText } = useCopyToClipboard();
const algorithms = ["SHA-256", "SHA-384", "SHA-512"];

function base64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}
async function generate() {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret.value),
      { name: "HMAC", hash: algorithm.value },
      false,
      ["sign"],
    );
    const result = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message.value));
    signature.value = base64(new Uint8Array(result));
    status.value = expected.value.trim()
      ? expected.value.trim() === signature.value
        ? "Signature matches."
        : "Signature does not match."
      : "Signature generated.";
  } catch {
    signature.value = "";
    status.value = "Enter a secret and message, then try again.";
  }
}
</script>

<template>
  <ToolWorkbench
    description="Create or verify HMAC signatures locally with the browser Web Crypto API."
  >
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <UiField label="Hash algorithm"
          ><UiSelect
            v-model="algorithm"
            :items="algorithms"
            class="w-full"
        /></UiField>
        <UiField label="Secret"
          ><UiInput
            v-model="secret"
            type="password"
            class="w-full font-mono"
            placeholder="Shared secret"
        /></UiField>
      </div>
      <div class="grid gap-5 lg:grid-cols-2">
        <UiField
          v-slot="{ controlProps }"
          label="Message"
          ><UiTextarea
            v-bind="controlProps"
            v-model="message"
            :rows="8"
            class="w-full font-mono"
            placeholder="Message to sign"
        /></UiField>
        <UiField
          v-slot="{ controlProps }"
          label="Expected signature"
          description="Optional. Paste a Base64 signature to verify."
          ><UiTextarea
            v-bind="controlProps"
            v-model="expected"
            :rows="8"
            class="w-full font-mono"
            placeholder="Paste expected Base64 signature"
        /></UiField>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton
          label="Generate / verify"
          icon="i-tabler-key"
          @click="generate"
        /><UiButton
          label="Copy signature"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          :disabled="!signature"
          @click="copyText(signature)"
        />
      </div>
      <UiField label="Base64 signature"
        ><UiInput
          v-model="signature"
          readonly
          class="w-full font-mono"
          placeholder="Signature appears here"
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
