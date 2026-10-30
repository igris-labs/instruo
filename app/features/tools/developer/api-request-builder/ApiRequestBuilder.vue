<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

type ExportFormat = "curl" | "fetch" | "axios" | "httpie";

const method = ref("GET");
const url = ref("https://api.example.com/users");
const query = ref("page=1\nlimit=20");
const headers = ref("Accept: application/json");
const body = ref("");
const format = ref<ExportFormat>("curl");
const { copyText } = useCopyToClipboard();

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const methodStyles: Record<string, string> = {
  GET: "bg-success/10 text-success border-success/20",
  HEAD: "bg-success/10 text-success border-success/20",
  POST: "bg-info/10 text-info border-info/20",
  PUT: "bg-warning/10 text-warning border-warning/20",
  PATCH: "bg-warning/10 text-warning border-warning/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  OPTIONS: "bg-muted text-muted-foreground border-input",
};
const acceptsBody = computed(() => !["GET", "HEAD"].includes(method.value));
const formats = [
  { label: "cURL", value: "curl" },
  { label: "Fetch", value: "fetch" },
  { label: "Axios", value: "axios" },
  { label: "HTTPie", value: "httpie" },
];

function entries(value: string, separator: string): [string, string][] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(separator);
      return index < 0
        ? ([line, ""] as [string, string])
        : ([line.slice(0, index).trim(), line.slice(index + 1).trim()] as [string, string]);
    });
}

const requestUrl = computed(() => {
  try {
    const parsed = new URL(url.value || "https://example.com");
    for (const [key, value] of entries(query.value, "=")) {
      if (key) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    return url.value;
  }
});

const headerEntries = computed(() => entries(headers.value, ":").filter(([key]) => key));
function quote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

const command = computed(() => {
  const headerFlags = headerEntries.value
    .map(([key, value]) => `-H ${quote(`${key}: ${value}`)}`)
    .join(" ");
  const data = body.value.trim() && acceptsBody.value ? ` --data ${quote(body.value.trim())}` : "";
  const request = method.value === "HEAD" ? "curl --head" : `curl -X ${method.value}`;
  return `${request} ${quote(requestUrl.value)}${headerFlags ? ` ${headerFlags}` : ""}${data}`;
});

const fetchCode = computed(() => {
  const headerObject = Object.fromEntries(headerEntries.value);
  const options = [
    `  method: ${JSON.stringify(method.value)}`,
    `  headers: ${JSON.stringify(headerObject, null, 2).replace(/\n/g, "\n  ")}`,
  ];
  if (body.value.trim() && acceptsBody.value)
    options.push(`  body: ${JSON.stringify(body.value.trim())}`);
  return `fetch(${JSON.stringify(requestUrl.value)}, {\n${options.join(",\n")}\n});`;
});

const axiosCode = computed(() => {
  const config = [
    `  method: ${JSON.stringify(method.value.toLowerCase())}`,
    `  url: ${JSON.stringify(requestUrl.value)}`,
  ];
  if (headerEntries.value.length)
    config.push(
      `  headers: ${JSON.stringify(Object.fromEntries(headerEntries.value), null, 2).replace(/\n/g, "\n  ")}`,
    );
  if (body.value.trim() && acceptsBody.value)
    config.push(`  data: ${JSON.stringify(body.value.trim())}`);
  return `axios.request({\n${config.join(",\n")}\n});`;
});

const httpieCode = computed(() => {
  const headerFlags = headerEntries.value.map(([key, value]) => `${key}:${quote(value)}`).join(" ");
  const data = body.value.trim() && acceptsBody.value ? ` --raw=${quote(body.value.trim())}` : "";
  return `http ${method.value} ${quote(requestUrl.value)}${headerFlags ? ` ${headerFlags}` : ""}${data}`;
});

const output = computed(
  () =>
    ({
      curl: command.value,
      fetch: fetchCode.value,
      axios: axiosCode.value,
      httpie: httpieCode.value,
    })[format.value],
);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-[9rem_minmax(0,1fr)]">
        <Field label="Method"
          ><Select
            v-model="method"
            class="w-full"
            :options="selectOptions(methods)"
            :ui="{ trigger: methodStyles[method] }"
          ></Select></Field
        ><Field label="Request URL"
          ><Input
            v-model="url"
            class="w-full font-mono"
            placeholder="https://api.example.com/users"
          ></Input
        ></Field>
      </div>
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Query parameters"
          description="One key=value pair per line."
          ><Textarea
            v-bind="controlProps"
            v-model="query"
            language="ini"
            :rows="6"
            class="w-full font-mono"
            placeholder="page=1"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Headers"
          description="One Header: value pair per line."
          ><Textarea
            v-bind="controlProps"
            v-model="headers"
            language="http"
            :rows="6"
            class="w-full font-mono"
            placeholder="Accept: application/json"
          ></Textarea
        ></Field>
      </div>
      <Field
        v-slot="{ controlProps }"
        label="Body"
        description="GET and HEAD do not use a request body. Your draft is kept when changing methods."
        ><Textarea
          v-bind="controlProps"
          v-model="body"
          :disabled="!acceptsBody"
          language="json"
          :rows="6"
          class="w-full font-mono"
          placeholder="Paste a JSON request body"
        ></Textarea
      ></Field>
      <div class="grid gap-5">
        <Field
          label="Export as"
          class="w-full sm:w-48"
          ><Select
            v-model="format"
            class="w-full"
            :options="selectOptions(formats)"
          ></Select
        ></Field>
        <Field
          v-slot="{ controlProps }"
          label="Generated request"
          ><Textarea
            :language="format === 'fetch' || format === 'axios' ? 'js' : 'bash'"
            v-bind="controlProps"
            :model-value="output"
            :rows="5"
            readonly
            class="w-full font-mono"
          ></Textarea
        ></Field>
        <ToolActions
          ><Button
            color="secondary"
            variant="outline"
            @click="copyText(output)"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy</Button
          ></ToolActions
        >
      </div>
    </div>
  </ToolWorkspace>
</template>
