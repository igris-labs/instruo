<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Directive =
  "default-src" | "script-src" | "style-src" | "img-src" | "font-src" | "connect-src" | "frame-src";
const directiveKeys: Directive[] = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "frame-src",
];
const directives = ref<Record<Directive, string>>({
  "default-src": "'self'",
  "script-src": "'self'",
  "style-src": "'self'",
  "img-src": "'self' data: https:",
  "font-src": "'self' https:",
  "connect-src": "'self'",
  "frame-src": "",
});
function placeholderFor(key: Directive) {
  return key === "frame-src" ? "'none'" : "'self'";
}
const header = computed(() =>
  Object.values(directives.value).some((value) => /[;\r\n]/.test(value))
    ? ""
    : directiveKeys
        .filter((key) => directives.value[key].trim())
        .map((key) => `${key} ${directives.value[key].trim()};`)
        .join(" "),
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <p
      v-if="!header"
      role="alert"
      class="text-destructive text-sm"
    >
      Source values cannot include semicolons or new lines. Enter space-separated CSP sources.
    </p>
    <div class="grid gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-4">
        <Field
          v-for="key in directiveKeys"
          :key="key"
          :label="key"
          ><Input
            v-model="directives[key]"
            class="w-full font-mono"
            :placeholder="placeholderFor(key)"
          ></Input
        ></Field>
      </div>
      <div class="grid content-start gap-3">
        <Field
          v-slot="{ controlProps }"
          label="HTTP header value"
          ><Textarea
            language="http"
            v-bind="controlProps"
            :model-value="header"
            :rows="14"
            readonly
            class="w-full font-mono"
          ></Textarea></Field
        ><Button
          class="w-fit"
          color="secondary"
          variant="outline"
          :disabled="!header"
          @click="copyText(header)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy policy</Button
        >
        <p class="text-muted-foreground text-xs">
          Test a policy in report-only mode before enforcing it in production.
        </p>
      </div>
    </div>
  </ToolWorkspace>
</template>
