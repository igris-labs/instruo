<script setup lang="ts">
import type { DocumentLanguage } from "./format";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { useCodeFormatter } from "./useCodeFormatter";
const props = withDefaults(
  defineProps<{
    language: DocumentLanguage;
    sourceLabel: string;
    outputLabel: string;
    copyLabel: string;
    initial?: string;
    minify?: boolean;
  }>(),
  { initial: "", minify: false },
);
const { input, mode, indent, dialect, output, error, busy, bytes } = useCodeFormatter(
  props.language,
  props.initial,
  props.minify ? "minify" : "format",
);
const { copyText } = useCopyToClipboard();
const examples = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><desc>A square icon</desc><rect x="4" y="4" width="16" height="16" fill="#000000"/></svg>',
  docker: 'from node:22\nWORKDIR /app\nrun echo "https://example.com/a;b"',
  nginx: 'server { listen 80; server_name example.com; location / { return 200 "Hello; world"; } }',
  javascript:
    // eslint-disable-next-line no-template-curly-in-string -- Literal source code for the example editor.
    'const endpoint = "https://example.com/api";\nexport function greet(name) { return `Hello, ${name}!`; }',
  html: "<main><h1>Hello</h1><p>Readable <strong>HTML</strong>.</p><pre>  keep spacing  </pre></main>",
  css: '.card { color: #333333; padding: calc(1rem + 2px); content: "a ; b"; }',
  graphql: "query User($id: ID!) { user(id: $id) { id name email } }",
  sql: "select id, name from users where active = true and name != 'from here' order by name;",
  xml: '<?xml version="1.0"?><catalog><item id="1">A &amp; B</item><empty /></catalog>',
};
const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
let fileVersion = 0;
const fileError = ref("");
const readingFile = ref(false);
watch(
  input,
  () => {
    ++fileVersion;
    readingFile.value = false;
    fileError.value = "";
  },
  { flush: "sync" },
);
onBeforeUnmount(() => ++fileVersion);
async function openFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file) return;
  const version = ++fileVersion;
  fileError.value = "";
  readingFile.value = false;
  if (file.size > 2_000_000) {
    fileError.value = "Choose a document smaller than 2 MB.";
    return;
  }
  readingFile.value = true;
  try {
    const text = await file.text();
    if (version === fileVersion) input.value = text;
  } catch {
    if (version === fileVersion) {
      fileError.value = "Could not read this file.";
    }
  } finally {
    if (version === fileVersion) readingFile.value = false;
  }
}
function download() {
  if (!output.value || busy.value || error.value || fileError.value || readingFile.value) return;
  downloadBlob(
    new Blob([output.value], { type: "text/plain;charset=utf-8" }),
    props.language === "docker"
      ? "Dockerfile"
      : props.language === "nginx"
        ? "nginx.conf"
        : `${mode.value === "minify" ? "minified" : "formatted"}.${
            props.language === "javascript" ? "js" : props.language
          }`,
  );
}
</script>
<template>
  <ToolWorkspace>
    <div class="flex flex-wrap items-end gap-4">
      <Field
        v-if="['javascript', 'html', 'css'].includes(language)"
        label="Operation"
        class="w-full sm:w-44"
        ><Select
          v-model="mode"
          class="w-full"
          :options="[
            { label: 'Format', value: 'format' },
            { label: 'Minify', value: 'minify' },
          ]"
      /></Field>
      <Field
        v-if="mode === 'format' && language !== 'docker'"
        label="Indent"
        class="w-full sm:w-32"
        ><Select
          v-model="indent"
          class="w-full"
          :options="['2', '4', '8'].map((value) => ({ value, label: `${value} spaces` }))"
      /></Field>
      <Field
        v-if="language === 'sql'"
        label="SQL dialect"
        class="w-full sm:w-44"
        ><Select
          v-model="dialect"
          class="w-full"
          :options="[
            { value: 'sql', label: 'Standard SQL' },
            { value: 'postgresql', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'sqlite', label: 'SQLite' },
            { value: 'tsql', label: 'SQL Server' },
            { value: 'bigquery', label: 'BigQuery' },
          ]"
      /></Field>
      <div class="flex flex-wrap gap-2 sm:ml-auto">
        <Button
          color="secondary"
          variant="outline"
          @click="input = examples[language]"
          >Load example</Button
        ><Button
          color="secondary"
          variant="outline"
          @click="fileInput?.click()"
          >Open file</Button
        ><input
          ref="fileInput"
          type="file"
          class="sr-only"
          tabindex="-1"
          aria-label="Source document file"
          accept=".txt,.js,.mjs,.html,.htm,.css,.graphql,.gql,.sql,.xml,.svg,.conf,Dockerfile"
          @change="openFile"
        />
      </div>
    </div>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        :label="sourceLabel"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :language="language === 'javascript' ? 'js' : language"
          :rows="12"
          class="w-full"
          :placeholder="`Paste ${language} here…`"
          spellcheck="false"
      /></Field>
      <Field
        v-slot="{ controlProps }"
        :label="outputLabel"
        ><Textarea
          v-bind="controlProps"
          :model-value="fileError || readingFile ? '' : output"
          :language="language === 'javascript' ? 'js' : language"
          :rows="12"
          class="w-full"
          readonly
          :placeholder="
            busy
              ? 'Processing locally…'
              : error
                ? 'Fix the source to see a result.'
                : 'Output appears here.'
          "
      /></Field>
    </div>
    <StatusMessage
      v-if="error || fileError"
      tone="error"
      title="Check your document"
      :description="fileError || error"
    />
    <div class="flex flex-wrap items-center justify-between gap-4">
      <p
        class="text-muted-foreground text-xs tabular-nums"
        role="status"
      >
        {{
          readingFile
            ? "Reading file…"
            : busy
              ? "Processing locally…"
              : error || fileError
                ? "No output exported while the source has errors."
                : `${bytes.input.toLocaleString()} input bytes · ${bytes.output.toLocaleString()} output bytes`
        }}
      </p>
      <p
        v-if="mode === 'minify' && output && bytes.input"
        class="text-success text-xs tabular-nums"
      >
        {{ Math.max(0, Math.round((1 - bytes.output / bytes.input) * 100)) }}% smaller
      </p>
    </div>
    <ToolActions
      ><Button
        color="secondary"
        variant="ghost"
        :disabled="!input"
        @click="input = ''"
        >Clear</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output || busy || !!error || !!fileError || readingFile"
        @click="download"
        >Download</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output || busy || !!error || !!fileError || readingFile"
        @click="copyText(output)"
        ><Icon
          name="tabler:copy"
          class="mr-1.5"
        />{{ copyLabel }}</Button
      ></ToolActions
    >
    <p class="text-muted-foreground text-xs">
      Runs locally without executing your code. Formatting is not a security audit or proof that
      code will run correctly.
    </p>
  </ToolWorkspace>
</template>
