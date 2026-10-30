import type { WatchSource } from "vue";
import { onBeforeUnmount, ref, watch } from "vue";
// Shared lifecycle only; each tool owns its operation and input validation.
export function useToolTask(sources: WatchSource[]) {
  const output = ref("");
  const error = ref("");
  const busy = ref(false);
  let version = 0;
  function reset() {
    version++;
    output.value = error.value = "";
    busy.value = false;
  }
  watch(sources, reset, { flush: "sync" });
  onBeforeUnmount(reset);
  async function run(operation: () => Promise<string> | string) {
    reset();
    const id = version;
    busy.value = true;
    try {
      const value = await operation();
      if (id === version) output.value = value;
    } catch (cause) {
      if (id === version)
        error.value =
          cause instanceof Error
            ? cause.message
            : "This operation could not complete. Check your input and browser support.";
    } finally {
      if (id === version) busy.value = false;
    }
  }
  return { output, error, busy, run, reset };
}
