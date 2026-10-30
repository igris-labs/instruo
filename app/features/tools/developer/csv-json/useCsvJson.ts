import { onBeforeUnmount, onMounted, ref, watch } from "vue";
export function useCsvJson() {
  const input = ref("name,score\nAda,10\nLinus,9");
  const delimiter = ref("auto");
  const headers = ref(true);
  const typed = ref(false);
  const busy = ref(false);
  const result = ref({ output: "", rows: 0, columns: 0, error: "" });
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let mounted = false;
  function stop() {
    worker?.terminate();
    worker = undefined;
    clearTimeout(timer);
    busy.value = false;
  }
  function fail(error: string) {
    stop();
    result.value = { output: "", rows: 0, columns: 0, error };
  }
  function run() {
    if (!input.value.trim()) return;
    busy.value = true;
    try {
      worker = new Worker(new URL("./csv.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = ({ data }: MessageEvent<typeof result.value>) => {
        stop();
        result.value = data;
      };
      worker.onerror = () =>
        fail("Could not parse CSV. Check that your browser allows background workers.");
      worker.postMessage({
        input: input.value,
        delimiter: delimiter.value === "auto" ? "" : delimiter.value,
        headers: headers.value,
        typed: typed.value,
      });
      timer = setTimeout(fail, 4000, "Parsing took too long and was stopped. Try a smaller file.");
    } catch {
      fail("Your browser blocked background parsing. No data was sent anywhere.");
    }
  }
  function schedule() {
    stop();
    clearTimeout(debounce);
    result.value = { output: "", rows: 0, columns: 0, error: "" };
    busy.value = !!input.value.trim();
    if (mounted) debounce = setTimeout(run, 180);
  }
  watch([input, delimiter, headers, typed], schedule, { flush: "sync" });
  onMounted(() => {
    mounted = true;
    schedule();
  });
  onBeforeUnmount(() => {
    stop();
    clearTimeout(debounce);
  });
  return { input, delimiter, headers, typed, result, busy };
}
