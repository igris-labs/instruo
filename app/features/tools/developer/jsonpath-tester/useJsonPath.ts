import { onBeforeUnmount, onMounted, ref, watch } from "vue";
export function useJsonPath() {
  const input = ref('{"users":[{"name":"Ada","active":true},{"name":"Linus","active":false}]}');
  const path = ref("$.users[*].name");
  const withPaths = ref(false);
  const output = ref("");
  const error = ref("");
  const count = ref(0);
  const busy = ref(false);
  let worker: Worker | undefined, timer: ReturnType<typeof setTimeout> | undefined;
  function stop() {
    worker?.terminate();
    worker = undefined;
    clearTimeout(timer);
    busy.value = false;
  }
  function fail(message: string) {
    stop();
    output.value = "";
    error.value = message;
    count.value = 0;
  }
  function run() {
    stop();
    output.value = error.value = "";
    count.value = 0;
    busy.value = true;
    try {
      worker = new Worker(new URL("./query.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = ({
        data,
      }: MessageEvent<{ output: string; error: string; count: number }>) => {
        stop();
        output.value = data.output;
        error.value = data.error;
        count.value = data.count;
      };
      worker.onerror = () =>
        fail("Could not run the query. Check that your browser allows background workers.");
      worker.postMessage({ source: input.value, path: path.value, withPaths: withPaths.value });
      timer = setTimeout(
        fail,
        4000,
        "Query took too long and was stopped. Simplify the query or document.",
      );
    } catch {
      fail("Your browser blocked background queries. No data was sent anywhere.");
    }
  }
  watch(
    [input, path, withPaths],
    () => {
      stop();
      output.value = error.value = "";
      count.value = 0;
    },
    { flush: "sync" },
  );
  onMounted(run);
  onBeforeUnmount(stop);
  return { input, path, withPaths, output, error, count, busy, run };
}
