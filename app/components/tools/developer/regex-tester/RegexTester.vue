<script setup lang="ts">
interface MatchResult {
  index: number;
  length: number;
  value: string;
}

const pattern = ref("\\btool\\b");
const flags = ref("gi");
const input = ref("");
const { copyText } = useCopyToClipboard();

const result = computed(() => {
  if (!pattern.value) return { error: "", matches: [] as MatchResult[] };

  try {
    const expression = new RegExp(pattern.value, flags.value);
    const matches: MatchResult[] = [];

    if (flags.value.includes("g")) {
      for (const match of input.value.matchAll(expression)) {
        matches.push({ index: match.index ?? 0, length: match[0].length, value: match[0] });
      }
    } else {
      const match = expression.exec(input.value);
      if (match) matches.push({ index: match.index, length: match[0].length, value: match[0] });
    }

    return { error: "", matches };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid regular expression.",
      matches: [] as MatchResult[],
    };
  }
});

const output = computed(() => result.value.matches.map((match) => match.value).join("\n"));
</script>

<template>
  <ToolWorkbench
    description="Test JavaScript regular expressions locally against text you provide."
  >
    <div class="grid gap-6">
      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <UiField
          label="Pattern"
          description="Use JavaScript regular expression syntax."
          :error="result.error || undefined"
        >
          <UiInput
            v-model="pattern"
            class="w-full"
            placeholder="\\bword\\b"
          />
        </UiField>
        <UiField
          label="Flags"
          description="For example, gi."
        >
          <UiInput
            v-model="flags"
            class="w-full font-mono"
            placeholder="gi"
          />
        </UiField>
      </div>

      <UiField
        v-slot="{ controlProps }"
        label="Test text"
      >
        <UiTextarea
          v-bind="controlProps"
          v-model="input"
          autoresize
          :rows="10"
          :maxrows="18"
          class="w-full"
          placeholder="Paste text to test…"
        />
      </UiField>

      <section
        class="border-outline/70 border-t pt-5"
        aria-live="polite"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-foreground-highlighted font-semibold">Matches</h2>
          <span class="text-foreground-muted font-mono text-sm tabular-nums">{{
            result.matches.length
          }}</span>
        </div>
        <p
          v-if="!result.matches.length"
          class="text-foreground-muted border-outline mt-4 rounded-md border p-4 text-sm"
        >
          No matches yet. Add test text or adjust the pattern.
        </p>
        <ol
          v-else
          class="border-outline/70 mt-4 border-t"
        >
          <li
            v-for="match in result.matches"
            :key="`${match.index}-${match.value}`"
            class="border-outline/70 flex items-center justify-between gap-4 border-b py-3 font-mono text-sm"
          >
            <code class="text-foreground-highlighted break-all">{{ match.value }}</code>
            <span class="text-foreground-muted shrink-0">index {{ match.index }}</span>
          </li>
        </ol>
      </section>

      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy matches"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
