<script setup lang="ts">
import type { JsonFold } from "./json-folds";
import { cn } from "../../utils/ui";
import { Button } from "../ui/button";
import { inputVariants } from "../ui/input";
import { foldJsonLines } from "./json-folds";
import { useCodeHighlight } from "./use-code-highlight";
import { useCodeViewport } from "./use-code-viewport";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    language: string;
    readonly?: boolean;
    rows?: number | string;
    foldable?: boolean;
  }>(),
  { readonly: false, rows: 12, foldable: true },
);
const model = defineModel<string>({ default: "" });
const attrs = useAttrs();
const input = useTemplateRef<HTMLTextAreaElement>("input");
const collapsed = shallowRef<ReadonlySet<number>>(new Set());
const folds = shallowRef<JsonFold[]>([]);
const lineCount = computed(() => model.value.split("\n").length);
const gutterWidth = computed(() => `${Math.max(64, String(lineCount.value).length * 7 + 36)}px`);
const lines = computed(() => foldJsonLines(model.value, folds.value, collapsed.value));
const source = computed(() =>
  collapsed.value.size ? lines.value.map((line) => line.text).join("\n") : model.value,
);
const {
  scroll,
  range,
  offset,
  sync: syncScroll,
} = useCodeViewport(input, () => lines.value.length);
const visibleLines = computed(() => lines.value.slice(range.value.start, range.value.end));
const highlighting = useCodeHighlight(
  () => model.value,
  () => props.language,
  () =>
    visibleLines.value.map((line) => ({
      line: line.original,
      foldEnd: line.collapsed ? line.fold?.end : undefined,
    })),
  () => props.readonly && props.foldable && props.language === "json",
);
const { html: highlighted, ready: colored, pending, failed } = highlighting;
watch(highlighting.folds, (value) => {
  folds.value = value;
});
watch(model, () => {
  collapsed.value = new Set();
});
function toggle(start: number) {
  const next = new Set(collapsed.value);
  if (next.has(start)) next.delete(start);
  else next.add(start);
  collapsed.value = next;
}
</script>
<template>
  <div
    class="min-w-0 [&_.syntax-token]:text-(--shiki-light) dark:[&_.syntax-token]:text-(--shiki-dark)"
    data-code-editor
    :data-language="language"
    :data-highlight-state="failed ? 'error' : colored ? 'ready' : pending ? 'pending' : 'plain'"
    :data-rendered-lines="visibleLines.length"
    :data-total-lines="lines.length"
    :style="{ '--code-gutter': gutterWidth }"
  >
    <div
      class="text-muted-foreground mb-2 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs"
    >
      <span
        >{{ language.toUpperCase() }} · {{ lineCount }} {{ model.includes("\n") ? "lines" : "line"
        }}<span
          v-if="pending"
          role="status"
        >
          · Highlighting…</span
        ></span
      >
      <div
        v-if="folds.length"
        class="flex gap-1"
      >
        <Button
          color="secondary"
          variant="ghost"
          size="xs"
          :disabled="collapsed.size === folds.length"
          @click="collapsed = new Set(folds.map((fold) => fold.start))"
          >Collapse all</Button
        >
        <Button
          color="secondary"
          variant="ghost"
          size="xs"
          :disabled="!collapsed.size"
          @click="collapsed = new Set()"
          >Expand all</Button
        >
      </div>
    </div>
    <div class="relative min-w-0">
      <textarea
        ref="input"
        v-bind="attrs"
        :value="source"
        :readonly="readonly"
        :rows="rows"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        wrap="off"
        :class="
          cn(
            inputVariants({ size: 'sm', variant: 'soft' }).root(),
            'caret-foreground block h-auto min-h-24 w-full resize-y p-3 font-mono text-[13px] leading-6 [tab-size:2]',
            folds.length && 'pl-[calc(var(--code-gutter)+0.5rem)] [@media(pointer:coarse)]:pl-3',
            attrs.class as string,
            colored && 'text-transparent!',
          )
        "
        @input="model = ($event.target as HTMLTextAreaElement).value"
        @scroll="syncScroll"
      />
      <div
        v-if="colored"
        class="pointer-events-none absolute inset-px z-10 overflow-hidden rounded-md"
        aria-hidden="true"
      >
        <pre
          class="m-0 w-max min-w-full p-3 font-mono text-[13px] leading-6 whitespace-pre [tab-size:2]"
          :class="
            folds.length > 0 && 'pl-[calc(var(--code-gutter)+0.5rem)] [@media(pointer:coarse)]:pl-3'
          "
          :style="{ transform: `translate(${-scroll.x}px, ${offset}px)` }"
        ><code v-html="highlighted" /></pre>
      </div>
      <div
        v-if="folds.length"
        class="bg-muted absolute inset-y-px left-px z-20 w-(--code-gutter) overflow-hidden rounded-l-md [@media(pointer:coarse)]:hidden"
        aria-label="JSON block folding"
      >
        <div
          class="pt-3"
          :style="{ transform: `translateY(${offset}px)` }"
        >
          <div
            v-for="line in visibleLines"
            :key="line.original"
            class="grid h-6 grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-1 px-1"
          >
            <span
              class="text-dimmed text-right font-mono text-[11px] tabular-nums"
              data-line-number
              aria-hidden="true"
              >{{ line.original + 1 }}</span
            >
            <Button
              v-if="line.fold"
              color="secondary"
              variant="ghost"
              size="xs"
              shape="icon"
              class="size-6 p-0"
              :aria-label="`${line.collapsed ? 'Expand' : 'Collapse'} block at line ${line.original + 1}`"
              :aria-expanded="!line.collapsed"
              @click="toggle(line.original)"
            >
              <Icon
                :name="line.collapsed ? 'tabler:plus' : 'tabler:minus'"
                mode="svg"
                class="size-3"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
    <p
      v-if="collapsed.size"
      role="status"
      class="text-muted-foreground mt-2 text-xs"
    >
      Folded view. Copy and download include the complete value.
    </p>
    <p
      v-if="failed"
      class="text-muted-foreground mt-2 text-xs"
    >
      Highlighting is unavailable. Editing, copy and download remain available.
    </p>
  </div>
</template>
