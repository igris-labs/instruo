import { onBeforeUnmount, ref, watch } from "vue";
import { draft, inferSchema, parseDocument } from "./schema";
export function useSchemaStudio() {
  const source = ref('{"name":"Ada","age":36,"tags":["math"]}');
  const schema = ref("");
  const required = ref(true);
  const closed = ref(false);
  const status = ref("");
  const tone = ref("primary");
  const busy = ref(false);
  let worker: Worker | undefined, timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    worker?.terminate();
    worker = undefined;
    clearTimeout(timer);
    busy.value = false;
  };
  const fail = (message: string) => {
    status.value = message;
    tone.value = "error";
    stop();
  };
  watch(
    [source, schema],
    () => {
      stop();
      status.value = "";
    },
    { flush: "sync" },
  );
  function generate() {
    stop();
    try {
      schema.value = JSON.stringify(
        {
          $schema: draft,
          ...inferSchema(
            parseDocument(source.value, "JSON document"),
            required.value,
            closed.value,
          ),
        },
        null,
        2,
      );
      status.value = "Schema generated from this sample. Review the rules before relying on them.";
      tone.value = "primary";
    } catch (cause) {
      fail(cause instanceof Error ? cause.message : "Input must be valid JSON.");
    }
  }
  function validate() {
    stop();
    status.value = "Validating locally…";
    tone.value = "primary";
    busy.value = true;
    try {
      worker = new Worker(new URL("./schema.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = ({
        data,
      }: MessageEvent<{ valid: boolean; errors: string[]; total: number; error: string }>) => {
        stop();
        tone.value = data.valid ? "success" : "error";
        status.value =
          data.error ||
          (data.valid
            ? "Valid: JSON matches schema."
            : data.errors.join("\n") +
              (data.total > 100 ? `\nShowing 100 of ${data.total} errors.` : ""));
      };
      worker.onerror = () =>
        fail(
          "Your browser could not run validation. Background workers and local code generation must be allowed.",
        );
      worker.postMessage({ source: source.value, schema: schema.value });
      timer = setTimeout(
        fail,
        4000,
        "Validation took too long and was stopped. Simplify the schema or use a smaller document.",
      );
    } catch {
      fail("Your browser blocked background validation. No data was sent anywhere.");
    }
  }
  onBeforeUnmount(stop);
  generate();
  return { source, schema, required, closed, status, tone, busy, generate, validate };
}
