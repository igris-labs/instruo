import { categoryPresentation } from "./presentation";
const aliases: Record<string, string> = {
  jpg: "jpeg",
  js: "javascript",
  ts: "typescript",
  md: "markdown",
  yml: "yaml",
};
const stopWords = new Set(["a", "an", "the", "to", "from", "for", "and", "my"]);
function terms(value: string) {
  return (value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((word) => aliases[word] ?? word);
}
export function matchesResource(
  resource: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    aliases?: string[];
  },
  query: string,
) {
  const words = terms(query).filter((word) => !stopWords.has(word));
  const text = terms(
    [
      resource.title,
      resource.description,
      resource.category,
      categoryPresentation[resource.category]?.label ?? "",
      ...resource.tags,
      ...(resource.aliases ?? []),
    ].join(" "),
  ).join(" ");
  return words.every((word) => text.includes(word));
}
