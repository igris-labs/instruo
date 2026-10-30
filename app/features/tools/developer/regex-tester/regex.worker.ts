const scope = globalThis as unknown as {
  onmessage:
    ((event: MessageEvent<{ pattern: string; flags: string; input: string }>) => void) | null;
  postMessage: (data: unknown) => void;
};
scope.onmessage = ({ data }) => {
  try {
    if (data.input.length > 200_000 || data.pattern.length > 4000)
      throw new Error("Use up to 200,000 input characters and a 4,000-character pattern.");
    const expression = new RegExp(data.pattern, data.flags);
    const matches: { index: number; length: number; value: string }[] = [];
    if (data.flags.includes("g")) {
      for (const match of data.input.matchAll(expression)) {
        if (matches.length >= 1000) throw new Error("More than 1,000 matches. Narrow the pattern.");
        matches.push({ index: match.index, length: match[0].length, value: match[0] });
      }
    } else {
      const match = expression.exec(data.input);
      if (match) matches.push({ index: match.index, length: match[0].length, value: match[0] });
    }
    scope.postMessage({ error: "", matches });
  } catch (cause) {
    scope.postMessage({
      error: cause instanceof Error ? cause.message : "Invalid pattern.",
      matches: [],
    });
  }
};
