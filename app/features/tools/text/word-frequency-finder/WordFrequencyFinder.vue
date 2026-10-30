<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTable } from "~/components/ui/data-table";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { downloadBlob } from "~/utils/browser-tools";
import { segmentWords } from "../word-char-counter/analyzeText";
const input = ref("");
const wordsToFind = ref("");
const ignoreCase = ref(true);
const excludeCommon = ref(false);
const common = new Set(
  "a an the and or but of in on to for with at by is are was were be it this that as".split(" "),
);
const result = computed(() => {
  try {
    const words = segmentWords(input.value);
    const counts = new Map<string, number>();
    for (let word of words) {
      if (ignoreCase.value) word = word.toLocaleLowerCase();
      if (excludeCommon.value && common.has(word.toLocaleLowerCase())) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    const requested = [
      ...new Set(
        wordsToFind.value
          .split(",")
          .map((word) => word.trim())
          .filter(Boolean)
          .map((word) => (ignoreCase.value ? word.toLocaleLowerCase() : word)),
      ),
    ];
    const rows = (
      requested.length
        ? requested.map((word) => ({ word, count: counts.get(word) ?? 0 }))
        : Array.from(counts, ([word, count]) => ({ word, count })).toSorted(
            (a, b) => b.count - a.count || a.word.localeCompare(b.word),
          )
    ).map((row) => ({
      ...row,
      share: words.length ? `${((row.count / words.length) * 100).toFixed(2)}%` : "0%",
    }));
    return { rows, total: words.length, error: "" };
  } catch (cause) {
    return { rows: [], total: 0, error: (cause as Error).message };
  }
});
const columns = [
  { accessor: "word", header: "Word" },
  { accessor: "count", header: "Count" },
  { accessor: "share", header: "Share of all words" },
] as const;
const csv = computed(
  () =>
    `Word,Count,Share\n${result.value.rows
      .map((row) => `"${row.word.replace(/"/g, '""')}",${row.count},${row.share}`)
      .join("\n")}`,
);
const { copyText } = useCopyToClipboard();
function download() {
  downloadBlob(new Blob([csv.value], { type: "text/csv" }), "word-frequency.csv");
}
</script>
<template>
  <ToolWorkspace
    ><Field
      v-slot="{ controlProps }"
      label="Text to analyze"
      ><Textarea
        v-bind="controlProps"
        v-model="input"
        :rows="12"
        class="w-full"
        placeholder="Paste text to see the most frequent words." /></Field
    ><Field
      label="Words to find"
      description="Optional, comma-separated. Leave empty to rank all words."
      ><Input
        v-model="wordsToFind"
        class="w-full"
        placeholder="tool, browser, text"
    /></Field>
    <div class="flex flex-wrap gap-4">
      <Checkbox
        v-model="ignoreCase"
        label="Ignore letter case"
      /><Checkbox
        v-model="excludeCommon"
        label="Exclude common English words"
      />
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check text"
      :description="result.error"
    />
    <p class="text-muted-foreground text-xs tabular-nums">
      {{ result.total }} total words · {{ result.rows.length }} results
    </p>
    <DataTable
      :data="result.rows"
      :columns="columns"
      row-key="word"
      :paginate="true"
      :show-pagination="true"
      empty-label="Paste text or adjust the words to find."
      :ui="{ viewport: 'max-h-96' }"
    /><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.rows.length"
        @click="download"
        >Download CSV</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.rows.length"
        @click="copyText(csv)"
        >Copy frequencies</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
