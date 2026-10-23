<script setup lang="ts">
const origin = ref("https://app.example.com");
const methods = ref("GET, POST, OPTIONS");
const headers = ref("Content-Type, Authorization");
const credentials = ref(false);
const maxAge = ref(600);
const { copyText } = useCopyToClipboard();
const output = computed(() =>
  [
    `Access-Control-Allow-Origin: ${origin.value || "*"}`,
    `Access-Control-Allow-Methods: ${methods.value}`,
    `Access-Control-Allow-Headers: ${headers.value}`,
    credentials.value ? "Access-Control-Allow-Credentials: true" : "",
    `Access-Control-Max-Age: ${Math.max(0, Math.floor(maxAge.value || 0))}`,
  ]
    .filter(Boolean)
    .join("\n"),
);
</script>

<template>
  <ToolWorkbench
    description="Build explicit CORS response headers for browser APIs and preflight requests."
  >
    <div class="grid gap-5 lg:grid-cols-2">
      <div class="grid gap-4">
        <UiField
          label="Allowed origin"
          description="Avoid * when credentials are enabled."
          ><UiInput
            v-model="origin"
            class="w-full font-mono"
        /></UiField>
        <UiField label="Allowed methods"
          ><UiInput
            v-model="methods"
            class="w-full font-mono"
        /></UiField>
        <UiField label="Allowed headers"
          ><UiInput
            v-model="headers"
            class="w-full font-mono"
        /></UiField>
        <UiField label="Preflight cache (seconds)"
          ><UiNumberField
            v-model="maxAge"
            :step-snapping="false"
            :min="0"
            class="w-full"
        /></UiField>
        <UiCheckbox
          v-model="credentials"
          label="Allow credentials"
        />
      </div>
      <div class="grid content-start gap-3">
        <UiField
          v-slot="{ controlProps }"
          label="Response headers"
          ><UiTextarea
            v-bind="controlProps"
            :model-value="output"
            :rows="12"
            readonly
            class="w-full font-mono"
        /></UiField>
        <UiButton
          label="Copy headers"
          icon="i-tabler-copy"
          color="neutral"
          variant="soft"
          class="w-fit"
          @click="copyText(output)"
        />
        <p class="text-foreground-muted text-xs">
          CORS is enforced by browsers; configure headers on your server or edge runtime.
        </p>
      </div>
    </div>
  </ToolWorkbench>
</template>
