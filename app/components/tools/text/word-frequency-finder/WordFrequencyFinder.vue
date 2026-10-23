<script setup lang="ts">
const input = ref("");
const wordsToFind = ref("");

const requestedWords = computed(() => {
  return [
    ...new Set(
      wordsToFind.value
        .split(",")
        .map((word) => word.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
});

const frequencies = computed(() => {
  const counts = new Map<string, number>();
  const words = input.value.toLocaleLowerCase().match(/[\p{L}\p{N}'-]+/gu) ?? [];

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return requestedWords.value.map((word) => ({ word, count: counts.get(word) ?? 0 }));
});
</script>

<template>
  <ToolWorkbench description="Word counts update as text or search terms change.">
    <div class="grid gap-6">
      <UiField
        v-slot="{ controlProps }"
        label="Text to analyze"
      >
        <UiTextarea
          v-bind="controlProps"
          v-model="input"
          placeholder="Type or paste text…"
          autoresize
          :rows="12"
          :maxrows="20"
          class="w-full"
        />
      </UiField>

      <UiField
        label="Words to find"
        description="Separate words with commas. Matching ignores case."
      >
        <UiInput
          v-model="wordsToFind"
          placeholder="tool, browser, text"
          class="w-full"
        />
      </UiField>

      <div
        v-if="frequencies.length"
        class="border-outline/70 overflow-hidden rounded-lg border-t"
      >
        <div
          v-for="item in frequencies"
          :key="item.word"
          class="border-outline/70 grid grid-cols-[1fr_auto] items-center gap-6 border-b py-4"
        >
          <span class="text-foreground-highlighted font-medium">{{ item.word }}</span>
          <span class="font-mono text-lg tabular-nums">{{ item.count }}</span>
        </div>
      </div>

      <p
        v-else
        class="text-foreground-muted border-outline/70 rounded-lg border p-5 text-sm"
      >
        Add one or more comma-separated words to see their frequency.
      </p>
    </div>
  </ToolWorkbench>
</template>
