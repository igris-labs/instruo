export function transformJson(input: string, mode: "format" | "minify" = "format") {
  if (!input.trim()) return { output: "", error: "" };
  try {
    return {
      output: JSON.stringify(JSON.parse(input), null, mode === "format" ? 2 : 0),
      error: "",
    };
  } catch (cause) {
    return { output: "", error: cause instanceof Error ? cause.message : "JSON is invalid." };
  }
}
