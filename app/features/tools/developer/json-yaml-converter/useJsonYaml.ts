import { computed, ref } from "vue";
import { parseDocument, stringify } from "yaml";
export function convertJsonYaml(input: string, direction: string, indent: number) {
  if (!input.trim()) return "";
  if (new TextEncoder().encode(input).length > 1_000_000)
    throw new Error("Use a document smaller than 1 MB.");
  if (direction === "json-yaml") return stringify(JSON.parse(input), { indent });
  const document = parseDocument(input, { uniqueKeys: true, intAsBigInt: true, stringKeys: true });
  if (document.errors.length) throw new Error(document.errors[0]!.message);
  if (document.warnings.length) throw new Error(document.warnings[0]!.message);
  return JSON.stringify(
    document.toJS({ maxAliasCount: 100 }),
    (_key, value: unknown) => {
      if (typeof value === "bigint") {
        if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER))
          throw new Error(
            "An integer exceeds JSON's safe numeric precision. Quote it in YAML to preserve it as a string.",
          );
        return Number(value);
      }
      if (typeof value === "number" && !Number.isFinite(value))
        throw new TypeError("JSON cannot represent Infinity or NaN. Quote these values in YAML.");
      return value;
    },
    indent,
  );
}
export function useJsonYaml() {
  const input = ref("");
  const direction = ref("json-yaml");
  const indent = ref("2");
  const result = computed(() => {
    try {
      return {
        output: convertJsonYaml(input.value, direction.value, Number(indent.value)),
        error: "",
      };
    } catch (cause) {
      return {
        output: "",
        error: cause instanceof Error ? cause.message : "Could not convert this document.",
      };
    }
  });
  function swap() {
    if (!result.value.output) return;
    const output = result.value.output;
    direction.value = direction.value === "json-yaml" ? "yaml-json" : "json-yaml";
    input.value = output;
  }
  return { input, direction, indent, result, swap };
}
