export interface JsonFold {
  start: number;
  end: number;
}

export function jsonFolds(source: string): JsonFold[] {
  try {
    JSON.parse(source);
  } catch {
    return [];
  }
  const stack: number[] = [];
  const folds: JsonFold[] = [];
  let line = 0;
  let quoted = false;
  let escaped = false;
  for (const char of source) {
    if (char === "\n") line++;
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{" || char === "[") stack.push(line);
    else if (char === "}" || char === "]") {
      const start = stack.pop();
      if (start !== undefined && start < line) folds.push({ start, end: line });
    }
  }
  return folds
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((fold, index, all) => index === 0 || all[index - 1]!.start !== fold.start);
}

export function foldJsonLines(source: string, folds: JsonFold[], collapsed: ReadonlySet<number>) {
  const lines = source.split("\n");
  const starts = new Map(folds.map((fold) => [fold.start, fold]));
  const visible: { original: number; text: string; fold?: JsonFold; collapsed: boolean }[] = [];
  for (let index = 0; index < lines.length; index++) {
    const fold = starts.get(index);
    const hidden = !!fold && collapsed.has(index);
    visible.push({
      original: index,
      text: hidden ? `${lines[index]} … ${lines[fold.end]!.trimStart()}` : lines[index]!,
      fold,
      collapsed: hidden,
    });
    if (hidden) index = fold.end;
  }
  return visible;
}
