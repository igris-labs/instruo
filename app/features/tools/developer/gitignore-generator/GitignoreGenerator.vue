<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";

import { downloadBlob } from "~/utils/browser-tools";
const custom = ref("");
const enabled = ref<Record<string, boolean>>({
  node: true,
  nuxt: true,
  vue: false,
  macos: true,
  vscode: true,
  env: true,
  docker: false,
});
const templates = [
  {
    key: "node",
    label: "Node.js",
    lines: ["node_modules/", "npm-debug.log*", "yarn-debug.log*", "dist/"],
  },
  { key: "nuxt", label: "Nuxt", lines: [".nuxt/", ".output/", ".nitro/"] },
  { key: "vue", label: "Vue", lines: ["*.local", "*.local.*"] },
  { key: "macos", label: "macOS", lines: [".DS_Store"] },
  { key: "vscode", label: "VS Code", lines: [".vscode/*", "!.vscode/extensions.json"] },
  { key: "env", label: "Environment", lines: [".env", ".env.*", "!.env.example"] },
  { key: "docker", label: "Docker", lines: ["docker-compose.override.yml", ".docker/"] },
] as const;
const output = computed(() => {
  const lines = templates.flatMap((template) =>
    enabled.value[template.key] ? template.lines : [],
  );
  return [...new Set([...lines, ...custom.value.split(/\r?\n/).filter(Boolean)])].join("\n");
});
const { copyText } = useCopyToClipboard();
function download() {
  downloadBlob(new Blob([output.value], { type: "text/plain" }), ".gitignore");
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5 @[48rem]:grid-cols-[minmax(14rem,0.35fr)_minmax(0,1fr)]">
      <div class="grid content-start gap-3">
        <p class="text-highlighted text-sm font-medium">Include templates</p>
        <Checkbox
          v-for="template in templates"
          :key="template.key"
          v-model="enabled[template.key]"
          :label="template.label"
        ></Checkbox>
      </div>
      <div class="grid gap-3">
        <Field
          v-slot="{ controlProps }"
          label="Custom patterns"
          ><Textarea
            v-bind="controlProps"
            v-model="custom"
            :rows="3"
            class="w-full"
            placeholder="One pattern per line"
        /></Field>
        <Field
          v-slot="{ controlProps }"
          label="Output"
          class="min-w-0"
          ><Textarea
            v-bind="controlProps"
            language="ini"
            :model-value="output"
            :rows="16"
            readonly
            class="w-full font-mono"
            placeholder="Choose a template."
          ></Textarea
        ></Field>
        <ToolActions
          ><Button
            color="secondary"
            variant="outline"
            :disabled="!output"
            @click="download"
            >Download .gitignore</Button
          >
          <Button
            :disabled="!output"
            color="secondary"
            variant="outline"
            @click="copyText(output)"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy .gitignore</Button
          >
        </ToolActions>
      </div>
    </div>
  </ToolWorkspace>
</template>
