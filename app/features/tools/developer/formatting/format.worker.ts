import type { FormatOptions } from "./format";
import { formatDocument } from "./format";
const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<{ id: number; source: string; options: FormatOptions }>) => void;
  postMessage: (message: { id: number; output: string; error: string }) => void;
};
scope.onmessage = async ({ data }) => {
  try {
    scope.postMessage({
      id: data.id,
      output: await formatDocument(data.source, data.options),
      error: "",
    });
  } catch (cause) {
    scope.postMessage({
      id: data.id,
      output: "",
      error: cause instanceof Error ? cause.message : "Could not format this document.",
    });
  }
};
