<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
const count = ref(3);
const mode = ref("paragraphs");
const offset = ref(0);
const sentences = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
];
const limit = computed(() =>
  mode.value === "words" ? 10000 : mode.value === "sentences" ? 200 : 50,
);
watch(mode, () => (count.value = Math.min(count.value, limit.value)));
const output = computed(() => {
  const length = Math.min(limit.value, Math.max(1, Math.floor(count.value || 1)));
  const sentence = (i: number) => sentences[(i + offset.value) % sentences.length]!;
  if (mode.value === "words") {
    const words = sentences.join(" ").split(/\s+/);
    return Array.from({ length }, (_, index) => words[(index + offset.value) % words.length]).join(
      " ",
    );
  }
  return Array.from({ length }, (_, index) =>
    mode.value === "sentences"
      ? sentence(index)
      : Array.from({ length: 5 }, (_, part) => sentence(index + part)).join(" "),
  ).join(mode.value === "paragraphs" ? "\n\n" : " ");
});
const { copyText } = useCopyToClipboard();
function download() {
  downloadBlob(new Blob([output.value], { type: "text/plain;charset=utf-8" }), "placeholder.txt");
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-4 @[30rem]:grid-cols-2">
      <Field label="Generate"
        ><Select
          v-model="mode"
          class="w-full"
          :options="[
            { value: 'words', label: 'Words' },
            { value: 'sentences', label: 'Sentences' },
            { value: 'paragraphs', label: 'Paragraphs' },
          ]" /></Field
      ><Field label="Count"
        ><NumberField
          v-model="count"
          :min="1"
          :max="limit"
          class="w-full"
      /></Field>
    </div>
    <Field
      v-slot="{ controlProps }"
      label="Placeholder text"
      ><Textarea
        v-bind="controlProps"
        :model-value="output"
        :rows="16"
        readonly
        class="w-full"
    /></Field>
    <p class="text-muted-foreground text-xs">
      Latin placeholder copy for testing layouts. It is not publish-ready product copy.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        @click="download"
        >Download text</Button
      ><Button
        color="secondary"
        variant="outline"
        @click="copyText(output)"
        >Copy text</Button
      ><Button @click="offset++">Generate variation</Button></ToolActions
    ></ToolWorkspace
  >
</template>
