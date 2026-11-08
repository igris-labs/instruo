import type { HighlightRequest, HighlightResponse } from "./highlight.types";
import { highlightLines } from "../../utils/highlight";
import { jsonFolds } from "./json-folds";

const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<HighlightRequest>) => void;
  postMessage: (message: HighlightResponse) => void;
};
let version = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

scope.onmessage = ({ data }) => {
  version = data.version;
  clearTimeout(timer);
  // Coalesce edits queued while tokenizing, rather than processing every obsolete document.
  timer = setTimeout(async () => {
    try {
      const result = await highlightLines(data.source, data.language);
      if (data.version !== version) return;
      scope.postMessage({
        type: "result",
        version,
        lines: result,
        folds: data.foldable ? jsonFolds(data.source) : [],
      });
    } catch {
      if (data.version === version) scope.postMessage({ type: "error", version });
    }
  }, 0);
};
