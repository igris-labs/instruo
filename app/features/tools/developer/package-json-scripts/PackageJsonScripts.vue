<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

interface ScriptRow {
  name: string;
  command: string;
}
const scripts = ref<ScriptRow[]>([
  { name: "dev", command: "nuxt dev" },
  { name: "build", command: "nuxt build" },
]);
const packageName = ref("my-app");
const { copyText } = useCopyToClipboard();
const error = computed(() => {
  const names = scripts.value.map((r) => r.name.trim()).filter(Boolean);
  return new Set(names).size !== names.length ? "Script names must be unique." : "";
});
const output = computed(() =>
  error.value
    ? ""
    : JSON.stringify(
        {
          name: packageName.value || "my-app",
          scripts: Object.fromEntries(
            scripts.value
              .filter((row) => row.name.trim())
              .map((row) => [row.name.trim(), row.command]),
          ),
        },
        null,
        2,
      ),
);
function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
const commands = computed(() =>
  error.value
    ? ""
    : scripts.value
        .filter((row) => row.name.trim())
        .map((row) => `pnpm run ${shellQuote(row.name.trim())}`)
        .join("\n"),
);
function add() {
  if (scripts.value.length >= 100) return;
  scripts.value.push({ name: "", command: "" });
}
function remove(index: number) {
  scripts.value.splice(index, 1);
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="Package name"
        ><Input
          v-model="packageName"
          class="w-full max-w-xl"
          placeholder="my-app"
        ></Input
      ></Field>
      <div class="grid gap-3">
        <div
          class="text-muted-foreground grid grid-cols-[minmax(8rem,0.35fr)_minmax(0,1fr)_2.5rem] gap-3 text-xs font-medium"
        >
          <span>Script</span><span>Command</span><span class="sr-only">Remove</span>
        </div>
        <div
          v-for="(script, index) in scripts"
          :key="index"
          class="grid grid-cols-[minmax(8rem,0.35fr)_minmax(0,1fr)_2.5rem] items-center gap-3"
        >
          <Input
            v-model="script.name"
            :aria-label="`Script ${index + 1} name`"
            class="w-full"
            placeholder="test"
          ></Input
          ><Input
            v-model="script.command"
            :aria-label="`Script ${index + 1} command`"
            class="w-full font-mono"
            placeholder="vitest run"
          ></Input
          ><Button
            color="destructive"
            variant="ghost"
            aria-label="Remove script"
            @click="remove(index)"
            ><Icon
              name="tabler:trash"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
          /></Button>
        </div>
        <Button
          color="secondary"
          variant="outline"
          class="w-fit"
          @click="add"
          ><Icon
            name="tabler:plus"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Add script</Button
        >
      </div>
      <div class="grid gap-3 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="package.json preview"
          :error="error || undefined"
          ><Textarea
            language="json"
            v-bind="controlProps"
            :model-value="output"
            :rows="12"
            readonly
            class="w-full font-mono"
          ></Textarea
        ></Field>
        <div class="grid content-start gap-3">
          <Field
            v-slot="{ controlProps }"
            label="Run commands"
            ><Textarea
              language="bash"
              v-bind="controlProps"
              :model-value="commands"
              :rows="12"
              readonly
              class="w-full font-mono"
            ></Textarea></Field
          ><Button
            class="w-fit justify-self-end"
            :disabled="!output"
            color="secondary"
            variant="outline"
            @click="copyText(output)"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy JSON</Button
          >
        </div>
      </div>
    </div>
  </ToolWorkspace>
</template>
