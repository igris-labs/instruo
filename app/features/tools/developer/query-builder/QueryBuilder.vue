<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
const rows = ref([{ key: "", value: "" }]);
const base = ref("");
const importError = ref("");
const query = computed(() =>
  new URLSearchParams(
    rows.value.filter((row) => row.key !== "").map((row) => [row.key, row.value]),
  ).toString(),
);
const result = computed(() => {
  try {
    if (!base.value.trim()) return { output: query.value, error: "" };
    const url = new URL(base.value);
    if (!["http:", "https:"].includes(url.protocol))
      throw new Error("Use an http or https base URL.");
    for (const [key, value] of new URLSearchParams(query.value))
      url.searchParams.append(key, value);
    return { output: url.href, error: "" };
  } catch (cause) {
    return { output: "", error: (cause as Error).message };
  }
});
function addRow() {
  if (rows.value.length < 200) rows.value.push({ key: "", value: "" });
}
function removeRow(index: number) {
  rows.value.splice(index, 1);
  if (!rows.value.length) rows.value = [{ key: "", value: "" }];
}
function importQuery() {
  try {
    const url = new URL(base.value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use an http or https URL.");
    const pairs = Array.from(url.searchParams, ([key, value]) => ({ key, value }));
    if (pairs.length > 200) throw new Error("Import up to 200 parameters.");
    rows.value = pairs.length ? pairs : [{ key: "", value: "" }];
    url.search = "";
    base.value = url.href;
    importError.value = "";
  } catch (cause) {
    importError.value = (cause as Error).message;
  }
}
watch(base, () => (importError.value = ""));
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><Field
      label="Base URL (optional)"
      :error="result.error || importError || undefined"
      description="Leave empty for a query string. Repeated keys and empty values are preserved."
      ><Input
        v-model="base"
        class="w-full"
        placeholder="https://example.com/search" /></Field
    ><Button
      class="w-fit"
      color="secondary"
      variant="outline"
      :disabled="!base"
      @click="importQuery"
      >Import query from URL</Button
    >
    <div class="grid gap-3">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="grid items-end gap-3 @[30rem]:grid-cols-[1fr_1fr_auto]"
      >
        <Field :label="`Key ${index + 1}`"
          ><Input
            v-model="row.key"
            class="w-full"
            placeholder="q" /></Field
        ><Field :label="`Value ${index + 1}`"
          ><Input
            v-model="row.value"
            class="w-full"
            placeholder="search term" /></Field
        ><Button
          color="secondary"
          variant="ghost"
          :aria-label="`Remove row ${index + 1}`"
          @click="removeRow(index)"
          >Remove</Button
        >
      </div>
    </div>
    <Button
      class="w-fit"
      color="secondary"
      variant="outline"
      :disabled="rows.length >= 200"
      @click="addRow"
      >Add parameter</Button
    ><Field
      v-slot="{ controlProps }"
      label="Generated query"
      ><Textarea
        v-bind="controlProps"
        :model-value="result.output"
        readonly
        :rows="5"
        class="w-full font-mono" /></Field
    ><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="copyText(result.output)"
        >Copy result</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
