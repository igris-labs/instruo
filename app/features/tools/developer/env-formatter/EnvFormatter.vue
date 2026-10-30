<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";

import { formatEnv } from "./formatEnv";
const input = ref(
  "APP_NAME = Instruo\n   API_URL = https://example.com\n# Keep comments    with your config\nDEBUG=true",
);
const redact = ref(true);
const result = computed(() => {
  try {
    return { value: formatEnv(input.value, redact.value), error: "" };
  } catch (e) {
    return { value: "", error: (e as Error).message };
  }
});
const formatted = computed(() => result.value.value);
const preview = computed(() => result.value.value);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label=".env input"
          :error="result.error || undefined"
          ><Textarea
            v-bind="controlProps"
            v-model="input"
            language="dotenv"
            :rows="14"
            class="w-full font-mono"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Formatted preview"
          ><Textarea
            language="dotenv"
            v-bind="controlProps"
            :model-value="preview"
            :rows="14"
            readonly
            class="w-full font-mono"
          ></Textarea
        ></Field>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          v-model="redact"
          label="Redact secret-looking values in preview"
        ></Checkbox
        ><Button
          :disabled="!formatted"
          color="secondary"
          variant="outline"
          @click="copyText(formatted)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />{{ redact ? "Copy redacted .env" : "Copy formatted .env" }}</Button
        >
      </div>
      <p class="text-muted-foreground text-sm">
        Copy uses the visible preview. Disable redaction only when you intend to copy original
        secrets. Redaction is heuristic; inspect before sharing. Formatting never writes to disk or
        sends your environment variables anywhere.
      </p>
    </div>
  </ToolWorkspace>
</template>
