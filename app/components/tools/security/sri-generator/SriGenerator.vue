<script setup lang="ts">
type Algorithm = "SHA-256" | "SHA-384" | "SHA-512";
const content = ref("console.log('hello');");
const algorithm = ref<Algorithm>("SHA-384");
const output = ref("");
const status = ref("");
const { copyText } = useCopyToClipboard();
const algorithms = ["SHA-256", "SHA-384", "SHA-512"];

function base64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}
async function generate() {
  try {
    const digest = await crypto.subtle.digest(
      algorithm.value,
      new TextEncoder().encode(content.value),
    );
    output.value = `${algorithm.value.toLowerCase().replace("sha-", "sha")}-${base64(new Uint8Array(digest))}`;
    status.value = "Integrity value generated locally.";
  } catch {
    output.value = "";
    status.value = "Web Crypto is unavailable in this browser.";
  }
}
</script>

<template>
  <ToolWorkbench
    description="Generate Subresource Integrity values for scripts and styles without uploading content."
  >
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <UiField label="Algorithm">
          <UiSelect
            v-model="algorithm"
            :items="algorithms"
            class="w-full"
          />
        </UiField>
        <UiField
          v-slot="{ controlProps }"
          label="Resource content"
        >
          <UiTextarea
            v-bind="controlProps"
            v-model="content"
            :rows="8"
            class="w-full font-mono"
          />
        </UiField>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton
          label="Generate hash"
          icon="i-tabler-hash"
          @click="generate"
        />
        <UiButton
          label="Copy integrity"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
      <UiField label="integrity value">
        <UiInput
          v-model="output"
          readonly
          class="w-full font-mono"
          placeholder="sha384-…"
        />
      </UiField>
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
