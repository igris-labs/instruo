import type { CodeRow, HighlightRequest, HighlightResponse } from "./highlight.types";
import type { JsonFold } from "./json-folds";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { escapeCode } from "../../utils/escape-code";

export function useCodeHighlight(
  source: () => string,
  language: () => string,
  rows: () => CodeRow[],
  foldable: () => boolean,
) {
  const folds = shallowRef<JsonFold[]>([]);
  const result = shallowRef<Extract<HighlightResponse, { type: "result" }> | null>(null);
  const pending = ref(false);
  const failed = ref(false);
  const sourceLines = computed(() => source().split("\n"));
  const ready = computed(() => !!result.value);
  // Project cached tokens synchronously; scrolling must never wait for a worker response.
  const html = computed(() => {
    if (!result.value) return "";
    const lines = result.value.lines;
    return rows()
      .map((row) =>
        row.foldEnd === undefined
          ? (lines[row.line] ?? "")
          : `${lines[row.line] ?? ""} … ${escapeCode(sourceLines.value[row.foldEnd]?.trimStart() ?? "")}`,
      )
      .join("\n");
  });
  let worker: Worker | undefined;
  let mounted = false;
  let version = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function send(message: HighlightRequest) {
    worker?.postMessage(message);
  }
  function fail() {
    pending.value = false;
    failed.value = true;
    result.value = null;
    worker?.terminate();
    worker = undefined;
  }
  function update() {
    version++;
    clearTimeout(timer);
    result.value = null;
    folds.value = [];
    failed.value = false;
    pending.value = !!source();
    if (!mounted) return;
    if (!source()) {
      worker?.terminate();
      worker = undefined;
      pending.value = false;
      return;
    }
    timer = setTimeout(() => {
      try {
        if (!worker) {
          worker = new Worker(new URL("./highlight.worker.ts", import.meta.url), {
            type: "module",
          });
          worker.onmessage = ({ data }: MessageEvent<HighlightResponse>) => {
            if (data.version !== version) return;
            if (data.type === "error") {
              fail();
              return;
            }
            pending.value = false;
            result.value = data;
            if (data.folds) folds.value = data.folds;
          };
          worker.onerror = fail;
          worker.onmessageerror = fail;
        }
        send({
          type: "document",
          version,
          source: source(),
          language: language(),
          foldable: foldable(),
        });
      } catch {
        fail();
      }
    }, 80);
  }
  watch([source, language, foldable], update);
  onMounted(() => {
    mounted = true;
    update();
  });
  onBeforeUnmount(() => {
    version++;
    clearTimeout(timer);
    worker?.terminate();
    worker = undefined;
  });
  return { folds, html, ready, pending, failed };
}
