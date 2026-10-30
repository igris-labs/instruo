import { validateSchema } from "./schema";
const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<{ source: string; schema: string }>) => void) | null;
  postMessage: (message: unknown) => void;
};
scope.onmessage = ({ data }) => {
  try {
    scope.postMessage({ ...validateSchema(data.source, data.schema), error: "" });
  } catch (cause) {
    scope.postMessage({
      valid: false,
      errors: [],
      total: 0,
      error: cause instanceof Error ? cause.message : "Could not validate this schema.",
    });
  }
};
