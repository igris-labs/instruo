import { queryJson } from "./query";
const scope = globalThis as unknown as {
  onmessage:
    ((event: MessageEvent<{ source: string; path: string; withPaths: boolean }>) => void) | null;
  postMessage: (message: unknown) => void;
};
scope.onmessage = ({ data }) => {
  try {
    scope.postMessage({ ...queryJson(data.source, data.path, data.withPaths), error: "" });
  } catch (cause) {
    scope.postMessage({
      output: "",
      count: 0,
      error: cause instanceof Error ? cause.message : "Could not evaluate this query.",
    });
  }
};
