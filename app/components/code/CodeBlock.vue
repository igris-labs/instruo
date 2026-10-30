<script setup lang="ts">
import { useCodeHighlight } from "./use-code-highlight";
import { useCodeViewport } from "./use-code-viewport";

const props = defineProps<{ code: string; language: string }>();
const input = useTemplateRef<HTMLTextAreaElement>("input");
const count = computed(() => props.code.split("\n").length);
const { scroll, range, offset, sync } = useCodeViewport(input, () => count.value);
const { html, ready, pending, failed } = useCodeHighlight(
  () => props.code,
  () => props.language,
  () =>
    Array.from({ length: range.value.end - range.value.start }, (_, index) => ({
      line: range.value.start + index,
    })),
  () => false,
);
</script>
<template>
  <div
    class="bg-muted/30 relative m-0 min-w-0 overflow-hidden rounded-md [&_.syntax-token]:text-(--shiki-light) dark:[&_.syntax-token]:text-(--shiki-dark)"
    data-code-block
    :data-language="language"
    :data-highlight-state="failed ? 'error' : ready ? 'ready' : pending ? 'pending' : 'plain'"
    :data-rendered-lines="range.end - range.start"
    :data-total-lines="count"
  >
    <textarea
      ref="input"
      :value="code"
      :aria-label="`${language} code`"
      readonly
      spellcheck="false"
      wrap="off"
      :rows="Math.min(14, Math.max(2, count))"
      class="text-foreground focus-visible:ring-ring block max-h-96 w-full resize-none border-0 bg-transparent p-3 font-mono text-[13px] leading-6 [tab-size:2] outline-none focus-visible:ring-1 focus-visible:ring-inset"
      :class="ready && 'text-transparent!'"
      @scroll="sync"
    />
    <div
      v-if="ready"
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <pre
        class="m-0 w-max min-w-full p-3 font-mono text-[13px] leading-6 whitespace-pre [tab-size:2]"
        :style="{ transform: `translate(${-scroll.x}px, ${offset}px)` }"
      ><code v-html="html" /></pre>
    </div>
  </div>
</template>
