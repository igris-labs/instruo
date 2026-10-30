<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";

const origin = ref("https://app.example.com");
const methods = ref("GET, POST, OPTIONS");
const headers = ref("Content-Type, Authorization");
const credentials = ref(false);
const maxAge = ref(600);
const error = computed(() => {
  if (credentials.value && (!origin.value || origin.value.trim() === "*"))
    return "Credentialed requests require an explicit origin, not a wildcard.";
  if (/[\r\n]/.test(origin.value + methods.value + headers.value))
    return "Header values cannot contain line breaks.";
  if (origin.value && origin.value !== "*") {
    try {
      if (new URL(origin.value).origin !== origin.value || !/^https?:/.test(origin.value))
        return "Use one http/https origin without a path or trailing slash.";
    } catch {
      return "Enter a valid origin.";
    }
  }
  if (
    !methods.value
      .split(/\s*,\s*/)
      .every((method) =>
        ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(method),
      )
  )
    return "Use comma-separated HTTP method names.";
  if (!Number.isInteger(maxAge.value) || maxAge.value < 0 || maxAge.value > 86400)
    return "Use a cache duration from 0–86,400 seconds.";
  return "";
});
const { copyText } = useCopyToClipboard();
const output = computed(() =>
  error.value
    ? ""
    : [
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
  <ToolWorkspace>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Check CORS policy"
      :description="error"
    />
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <div class="grid gap-4">
        <Field
          label="Allowed origin"
          description="Avoid * when credentials are enabled."
          ><Input
            v-model="origin"
            class="w-full font-mono"
          ></Input></Field
        ><Field label="Allowed methods"
          ><Input
            v-model="methods"
            class="w-full font-mono"
          ></Input></Field
        ><Field label="Allowed headers"
          ><Input
            v-model="headers"
            class="w-full font-mono"
          ></Input></Field
        ><Field label="Preflight cache (seconds)"
          ><NumberField
            v-model="maxAge"
            :step-snapping="false"
            :min="0"
            class="w-full"
          ></NumberField></Field
        ><Checkbox
          v-model="credentials"
          label="Allow credentials"
        ></Checkbox>
      </div>
      <div class="grid content-start gap-3">
        <Field
          v-slot="{ controlProps }"
          label="Response headers"
          ><Textarea
            language="http"
            v-bind="controlProps"
            :model-value="output"
            :rows="12"
            readonly
            class="w-full font-mono"
          ></Textarea></Field
        ><Button
          class="w-fit"
          color="secondary"
          variant="outline"
          :disabled="!output"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy headers</Button
        >
        <p class="text-muted-foreground text-xs">
          CORS is enforced by browsers; configure headers on your server or edge runtime.
        </p>
      </div>
    </div>
  </ToolWorkspace>
</template>
