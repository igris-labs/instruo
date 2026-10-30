<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

const input = ref("");
const { copyText } = useCopyToClipboard();

const result = computed(() => {
  if (!input.value.trim()) return { url: null, error: "" };
  try {
    return { url: new URL(input.value.trim()), error: "" };
  } catch {
    return { url: null, error: "Enter a complete URL, including its protocol." };
  }
});

const fields = computed(() => {
  const url = result.value.url;
  if (!url) return [];
  return [
    ["Protocol", url.protocol],
    ["Origin", url.origin],
    ["Host", url.host],
    ["Path", url.pathname],
    ["Query", url.search || "None"],
    ["Hash", url.hash || "None"],
  ];
});

const output = computed(() =>
  fields.value.map(([label, value]) => `${label}: ${value}`).join("\n"),
);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <Field
        label="URL"
        description="Include https://, http://, or another supported protocol."
        :error="result.error || undefined"
        ><Input
          v-model="input"
          class="w-full"
          placeholder="https://example.com/path?query=1#section"
        ></Input
      ></Field>
      <dl
        v-if="fields.length"
        class="border-border/70 grid overflow-hidden rounded-lg border-t border-l @[30rem]:grid-cols-2"
      >
        <div
          v-for="[label, value] in fields"
          :key="label"
          class="border-border/70 grid gap-2 border-r border-b p-4"
        >
          <dt class="text-muted-foreground font-mono text-xs">{{ label }}</dt>
          <dd class="text-highlighted font-mono text-sm break-all">{{ value }}</dd>
        </div>
      </dl>
      <p
        v-else
        class="text-muted-foreground border-border/70 rounded-lg border p-5 text-sm"
      >
        Parsed URL parts will appear here.
      </p>
      <ToolActions>
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
          />Copy parts</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
