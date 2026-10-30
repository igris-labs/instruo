import type { CodeRow, HighlightRequest, HighlightResponse } from "./highlight.types";
import type { JsonFold } from "./json-folds";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";

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
  const window = computed(() => {
    const value = rows();
    return { key: value.map((row) => `${row.line}:${row.foldEnd ?? ""}`).join(","), rows: value };
  });
  const ready = computed(() => !!result.value && result.value.key === window.value.key);
  const html = computed(() => (ready.value ? result.value!.lines.join("\n") : ""));
  let worker: Worker | undefined;
  let mounted = false;
  let version = 0;
  let posted = 0;
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
        posted = version;
        send({
          type: "document",
          version,
          source: source(),
          language: language(),
          foldable: foldable(),
          window: window.value,
        });
      } catch {
        fail();
      }
    }, 80);
  }
  watch([source, language, foldable], update);
  watch(window, () => {
    if (worker && posted === version) send({ type: "viewport", version, window: window.value });
  });
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
