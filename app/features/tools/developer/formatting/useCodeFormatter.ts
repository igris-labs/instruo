import type { DocumentLanguage, FormatOptions } from "./format";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { formatDocument } from "./format";

export function useCodeFormatter(
  language: DocumentLanguage,
  initial = "",
  initialMode: "format" | "minify" = "format",
) {
  const input = ref(initial);
  const mode = ref(initialMode);
  const indent = ref("2");
  const dialect = ref("sql");
  const output = ref("");
  const error = ref("");
  const busy = ref(false);
  let version = 0;
  let mounted = false;
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function publish(id: number, text: string, message: string) {
    if (id !== version) return;
    output.value = text;
    error.value = message;
    busy.value = false;
  }
  async function execute(id: number) {
    const source = input.value;
    const options: FormatOptions = {
      language,
      mode: mode.value,
      indent: Number(indent.value),
      dialect: dialect.value,
    };
    if (!worker) {
      try {
        worker = new Worker(new URL("./format.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = ({
          data,
        }: MessageEvent<{ id: number; output: string; error: string }>) =>
          publish(data.id, data.output, data.error);
        worker.onerror = () => {
          worker?.terminate();
          worker = undefined;
          publish(version, "", "Formatting worker failed. Edit the source to retry.");
        };
      } catch {
        worker = undefined;
      }
    }
    if (worker) {
      worker.postMessage({ id, source, options });
      return;
    }
    try {
      if (source.length > 100_000)
        throw new Error(
          "Your browser blocked background formatting. Try a smaller document or allow workers.",
        );
      publish(id, await formatDocument(source, options), "");
    } catch (cause) {
      publish(id, "", cause instanceof Error ? cause.message : "Could not format this document.");
    }
  }
  function schedule() {
    const id = ++version;
    clearTimeout(timer);
    output.value = error.value = "";
    busy.value = !!input.value.trim();
    if (mounted && busy.value)
      timer = setTimeout(() => {
        void execute(id);
      }, 180);
  }
  watch([input, mode, indent, dialect], schedule, { flush: "sync" });
  onMounted(() => {
    mounted = true;
    schedule();
  });
  onBeforeUnmount(() => {
    ++version;
    clearTimeout(timer);
    worker?.terminate();
  });
  const bytes = computed(() => ({
    input: new TextEncoder().encode(input.value).length,
    output: new TextEncoder().encode(output.value).length,
  }));
  return { input, mode, indent, dialect, output, error, busy, bytes };
}
