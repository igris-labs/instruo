import { convertCsv } from "./convertCsv";
const scope = globalThis as unknown as {
  onmessage:
    | ((
        event: MessageEvent<{ input: string; delimiter: string; headers: boolean; typed: boolean }>,
      ) => void)
    | null;
  postMessage: (message: unknown) => void;
};
scope.onmessage = ({ data }) => {
  try {
    scope.postMessage({
      ...convertCsv(data.input, data.delimiter, data.headers, data.typed),
      error: "",
    });
  } catch (cause) {
    scope.postMessage({
      output: "",
      rows: 0,
      columns: 0,
      error: cause instanceof Error ? cause.message : "Could not parse CSV.",
    });
  }
};
