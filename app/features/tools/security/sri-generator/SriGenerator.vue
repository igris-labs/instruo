<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToolTask } from "~/features/tools/useToolTask";
const content = ref("console.log('hello');");
const algorithm = ref("SHA-384");
const mode = ref("text");
const url = ref("https://example.com/app.js");
const kind = ref("script");
const file = shallowRef<File | null>(null);
const { output, error, busy, run } = useToolTask([content, algorithm, mode, file]);
const { copyText } = useCopyToClipboard();
const upload = useTemplateRef<HTMLInputElement>("upload");
function pick(event: Event) {
  const target = event.target as HTMLInputElement;
  file.value = target.files?.[0] ?? null;
  target.value = "";
}
function escape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
const markup = computed(() => {
  if (!output.value || !url.value.trim()) return "";
  try {
    if (!["http:", "https:"].includes(new URL(url.value, "https://example.com").protocol))
      return "";
  } catch {
    return "";
  }
  return kind.value === "script"
    ? `<script src="${escape(url.value)}" integrity="${output.value}" crossorigin="anonymous"><` +
        `/script>`
    : `<link rel="stylesheet" href="${escape(url.value)}" integrity="${
        output.value
      }" crossorigin="anonymous">`;
});
function generate() {
  return run(async () => {
    const selected = file.value;
    const hash = algorithm.value;
    let bytes: Uint8Array;
    if (mode.value === "file") {
      if (!selected) throw new Error("Choose a local resource file.");
      if (selected.size > 25_000_000) throw new Error("Use a file smaller than 25 MB.");
      bytes = new Uint8Array(await selected.arrayBuffer());
    } else {
      bytes = new TextEncoder().encode(content.value);
      if (bytes.length > 25_000_000) throw new Error("Use content smaller than 25 MB.");
    }
    const digest = new Uint8Array(await crypto.subtle.digest(hash, bytes as BufferSource));
    return `${hash.toLowerCase().replace("sha-", "sha")}-${btoa(String.fromCharCode(...digest))}`;
  });
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-4 @[30rem]:grid-cols-2">
      <Field label="Input source"
        ><Select
          v-model="mode"
          class="w-full"
          :options="[
            { value: 'text', label: 'Pasted UTF-8 text' },
            { value: 'file', label: 'Local file · exact bytes' },
          ]" /></Field
      ><Field label="Algorithm"
        ><Select
          v-model="algorithm"
          class="w-full"
          :options="['SHA-256', 'SHA-384', 'SHA-512'].map((value) => ({ value, label: value }))"
      /></Field>
    </div>
    <Field
      v-if="mode === 'text'"
      v-slot="{ controlProps }"
      label="Resource content"
      ><Textarea
        v-bind="controlProps"
        v-model="content"
        :rows="8"
        class="w-full font-mono"
    /></Field>
    <div
      v-else
      class="bg-muted/30 flex flex-wrap items-center gap-4 rounded-lg p-5"
    >
      <Button
        color="secondary"
        variant="outline"
        @click="upload?.click()"
        >Choose local file</Button
      >
      <p class="text-muted-foreground text-sm">
        {{ file ? `${file.name} · ${file.size.toLocaleString()} bytes` : "No file selected" }}
      </p>
      <input
        ref="upload"
        class="sr-only"
        type="file"
        aria-label="Resource file"
        @change="pick"
      />
    </div>
    <Field label="integrity value"
      ><Input
        :model-value="output"
        readonly
        class="w-full font-mono"
    /></Field>
    <div class="grid gap-4 @[30rem]:grid-cols-[12rem_minmax(0,1fr)]">
      <Field label="Resource kind"
        ><Select
          v-model="kind"
          class="w-full"
          :options="[
            { value: 'script', label: 'Script' },
            { value: 'style', label: 'Stylesheet' },
          ]" /></Field
      ><Field
        label="Resource URL"
        description="Used for markup only. This tool never fetches it."
        ><Input
          v-model="url"
          class="w-full"
      /></Field>
    </div>
    <Field
      v-slot="{ controlProps }"
      label="HTML markup"
      ><Textarea
        v-bind="controlProps"
        :model-value="markup"
        readonly
        language="html"
        :rows="4"
        class="w-full" /></Field
    ><StatusMessage
      v-if="error"
      tone="error"
      title="Could not generate integrity"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      SRI must match the exact served bytes, including line endings. Cross-origin resources also
      need CORS permission from their host. Scan or verify deployed files before release.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!markup"
        @click="copyText(markup)"
        >Copy markup</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy integrity</Button
      ><Button
        :disabled="busy"
        @click="generate"
        >{{ busy ? "Hashing…" : "Generate hash" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
