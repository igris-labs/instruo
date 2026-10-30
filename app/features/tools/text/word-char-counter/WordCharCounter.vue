<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { analyzeText } from "./analyzeText";
const input = ref("");
const wpm = ref(200);
const result = computed(() => {
  try {
    return { data: analyzeText(input.value, wpm.value), error: "" };
  } catch (cause) {
    return { data: null, error: (cause as Error).message };
  }
});
const statistics = computed(() =>
  result.value.data
    ? Object.entries({
        Words: result.value.data.words,
        Characters: result.value.data.characters,
        "Without spaces": result.value.data.withoutSpaces,
        Lines: result.value.data.lines,
        Sentences: result.value.data.sentences,
        Paragraphs: result.value.data.paragraphs,
        "UTF-8 bytes": result.value.data.bytes,
        "Reading time": `${Math.floor(result.value.data.readingSeconds / 60)} min ${
          result.value.data.readingSeconds % 60
        } sec`,
      })
    : [],
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-[minmax(0,1.2fr)_minmax(16rem,.8fr)]">
      <Field
        v-slot="{ controlProps }"
        label="Text to count"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :rows="16"
          class="w-full"
          placeholder="Type or paste text…"
      /></Field>
      <div class="grid gap-5">
        <dl class="grid grid-cols-2 gap-3">
          <div
            v-for="[label, value] in statistics"
            :key="label"
            class="bg-muted/30 rounded-lg p-4"
          >
            <dt class="text-muted-foreground text-xs">{{ label }}</dt>
            <dd class="mt-2 text-2xl font-semibold break-all tabular-nums">{{ value }}</dd>
          </div>
        </dl>
        <Field label="Reading speed (words/minute)"
          ><NumberField
            v-model="wpm"
            :min="40"
            :max="1000"
            class="w-full"
        /></Field>
        <p class="text-muted-foreground text-xs">
          Characters count visible graphemes, including combined emoji. Words and sentences follow
          your browser's language segmentation.
        </p>
      </div>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check text"
      :description="result.error"
    /><ToolActions
      ><Button
        color="secondary"
        variant="ghost"
        :disabled="!input"
        @click="input = ''"
        >Clear</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.data"
        @click="copyText(statistics.map(([key, value]) => `${key}: ${value}`).join('\n'))"
        >Copy statistics</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
