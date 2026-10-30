import { computed, ref } from "vue";
export type TransformerMode = "case" | "dedupe" | "reverse" | "slug" | "sort" | "whitespace";
export interface TransformOptions {
  operation: string;
  insensitive: boolean;
  trim: boolean;
  descending: boolean;
  keepEmpty: boolean;
  unicode: boolean;
}
export const defaultOperations: Record<TransformerMode, string> = {
  case: "lowercase",
  dedupe: "dedupe",
  reverse: "reverse",
  slug: "slug",
  sort: "alphabetical",
  whitespace: "whitespace",
};
export function transformText(value: string, mode: TransformerMode, options: TransformOptions) {
  if (value.length > 200_000) throw new Error("Use text shorter than 200,000 characters.");
  if (!value) return { output: "", note: "" };
  let output = value;
  let note = "";
  const lines = value.split(/\r?\n/);
  const words = () =>
    value.replace(/(\p{Ll}|\d)(\p{Lu})/gu, "$1 $2").match(/[\p{L}\p{N}]+/gu) ?? [];
  if (mode === "case") {
    switch (options.operation) {
      case "uppercase":
        output = value.toUpperCase();
        break;
      case "title":
        output = value
          .toLowerCase()
          .replace(
            /(^|[^\p{L}\p{N}])(\p{L})/gu,
            (_, boundary: string, letter: string) => boundary + letter.toUpperCase(),
          );
        break;
      case "sentence":
        output = value
          .toLowerCase()
          .replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toUpperCase());
        break;
      case "camel":
        output = words()
          .map((word, index) =>
            index ? word[0]!.toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase(),
          )
          .join("");
        break;
      case "snake":
        output = words().join("_").toLowerCase();
        break;
      case "kebab":
        output = words().join("-").toLowerCase();
        break;
      default:
        output = value.toLowerCase();
    }
  }
  if (mode === "dedupe") {
    const seen = new Set<string>();
    const kept = lines.filter((line) => {
      const key = options.trim ? line.trim() : line;
      const normalized = options.insensitive ? key.toLocaleLowerCase() : key;
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    output = kept.join("\n");
    note = `${lines.length - kept.length} duplicate lines removed. First occurrences are preserved.`;
  }
  if (mode === "reverse") {
    if (options.operation === "lines") output = lines.toReversed().join("\n");
    else if (options.operation === "words")
      output = value.trim().split(/\s+/).toReversed().join(" ");
    else
      output = Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value),
        (item) => item.segment,
      )
        .toReversed()
        .join("");
  }
  if (mode === "slug") {
    const normalized = value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim();
    const separator = options.operation === "underscore" ? "_" : "-";
    output = normalized
      .replace(options.unicode ? /[^\p{L}\p{N}]+/gu : /[^a-z0-9]+/g, separator)
      .replace(/^[-_]+|[-_]+$/g, "");
    if (!options.unicode && /\P{ASCII}/u.test(value))
      note = "ASCII mode removes non-Latin characters; enable Unicode to retain other scripts.";
  }
  if (mode === "sort") {
    const selected = options.keepEmpty ? lines : lines.filter((line) => line.trim());
    const numeric = (line: string) => line.trim() !== "" && Number.isFinite(Number(line));
    const compare = (a: string, b: string) => {
      if (options.operation === "length") return a.length - b.length;
      if (options.operation === "numerical") {
        if (!numeric(a)) return numeric(b) ? 1 : 0;
        if (!numeric(b)) return -1;
        return Number(a) - Number(b);
      }
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: options.insensitive ? "base" : "variant",
      });
    };
    output = selected
      .toSorted((a, b) => {
        if (options.operation === "numerical" && numeric(a) !== numeric(b))
          return numeric(a) ? -1 : 1;
        return compare(a, b) * (options.descending ? -1 : 1);
      })
      .join("\n");
    if (options.operation === "numerical" && selected.some((line) => !numeric(line)))
      note = "Non-numeric lines are kept at the end, not discarded.";
  }
  if (mode === "whitespace") {
    if (options.operation === "trim-lines") output = lines.map((line) => line.trim()).join("\n");
    else if (options.operation === "empty-lines")
      output = lines.filter((line) => line.trim()).join("\n");
    else if (options.operation === "line-endings") output = lines.join("\n");
    else
      output = value
        .replace(/[^\S\r\n]+/g, " ")
        .replace(/ *\r?\n */g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
  }
  return { output, note };
}
export function useTextTransformer(mode: TransformerMode) {
  const input = ref("");
  const operation = ref(defaultOperations[mode]);
  const insensitive = ref(false);
  const trim = ref(false);
  const descending = ref(false);
  const keepEmpty = ref(false);
  const unicode = ref(false);
  const result = computed(() => {
    try {
      return {
        ...transformText(input.value, mode, {
          operation: operation.value,
          insensitive: insensitive.value,
          trim: trim.value,
          descending: descending.value,
          keepEmpty: keepEmpty.value,
          unicode: unicode.value,
        }),
        error: "",
      };
    } catch (cause) {
      return {
        output: "",
        note: "",
        error: cause instanceof Error ? cause.message : "Could not transform this text.",
      };
    }
  });
  return { input, operation, insensitive, trim, descending, keepEmpty, unicode, result };
}
