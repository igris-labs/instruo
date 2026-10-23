<script setup lang="ts">
const publicKey = ref("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBdemoexamplekey comment");
const fingerprint = ref("");
const keyType = ref("");
const status = ref("");
const { copyText } = useCopyToClipboard();
function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
async function calculate() {
  try {
    const parts = publicKey.value.trim().split(/\s+/);
    if (parts.length < 2) throw new Error("Paste an OpenSSH public key.");
    const bytes = Uint8Array.from(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/")), (char) =>
      char.charCodeAt(0),
    );
    const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource);
    keyType.value = parts[0]!;
    fingerprint.value = `SHA256:${base64Url(new Uint8Array(digest))}`;
    status.value = "SHA-256 fingerprint calculated locally.";
  } catch (error) {
    fingerprint.value = "";
    keyType.value = "";
    status.value = error instanceof Error ? error.message : "Could not parse public key.";
  }
}
</script>

<template>
  <ToolWorkbench
    description="Calculate an OpenSSH public-key SHA-256 fingerprint without sending the key anywhere."
  >
    <div class="grid gap-5">
      <UiField
        v-slot="{ controlProps }"
        label="OpenSSH public key"
        description="Format: ssh-ed25519 AAAA… optional-comment"
        ><UiTextarea
          v-bind="controlProps"
          v-model="publicKey"
          :rows="5"
          class="w-full font-mono"
      /></UiField>
      <div class="flex flex-wrap gap-2">
        <UiButton
          label="Calculate fingerprint"
          icon="i-tabler-fingerprint"
          @click="calculate"
        /><UiButton
          label="Copy fingerprint"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          :disabled="!fingerprint"
          @click="copyText(fingerprint)"
        />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiField label="Key type"
          ><UiInput
            v-model="keyType"
            readonly /></UiField
        ><UiField label="SHA-256 fingerprint"
          ><UiInput
            v-model="fingerprint"
            readonly
            class="font-mono"
        /></UiField>
      </div>
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
