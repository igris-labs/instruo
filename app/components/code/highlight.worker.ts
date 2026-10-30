import type { CodeWindow, HighlightRequest, HighlightResponse } from "./highlight.types";
import { escapeCode, highlightLines } from "../../utils/highlight";
import { jsonFolds } from "./json-folds";

const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<HighlightRequest>) => void;
  postMessage: (message: HighlightResponse) => void;
};
let version = 0;
let html: string[] = [];
let sourceLines: string[] = [];
let viewport: CodeWindow = { key: "", rows: [] };
let timer: ReturnType<typeof setTimeout> | undefined;

function publish(folds?: ReturnType<typeof jsonFolds>) {
  scope.postMessage({
    type: "result",
    version,
    key: viewport.key,
    folds,
    lines: viewport.rows.map((row) =>
      row.foldEnd === undefined
        ? (html[row.line] ?? "")
        : `${html[row.line] ?? ""} … ${escapeCode(sourceLines[row.foldEnd]?.trimStart() ?? "")}`,
    ),
  });
}
scope.onmessage = ({ data }) => {
  if (data.type === "viewport") {
    if (data.version !== version) return;
    viewport = data.window;
    if (html.length) publish();
    return;
  }
  version = data.version;
  viewport = data.window;
  html = [];
  sourceLines = [];
  clearTimeout(timer);
  // Coalesce edits queued while tokenizing, rather than processing every obsolete document.
  timer = setTimeout(async () => {
    try {
      const result = await highlightLines(data.source, data.language);
      if (data.version !== version) return;
      html = result;
      sourceLines = data.source.split("\n");
      publish(data.foldable ? jsonFolds(data.source) : []);
    } catch {
      if (data.version === version) scope.postMessage({ type: "error", version });
    }
  }, 0);
};
