import { JSONPathJS } from "jsonpath-js";
export function queryJson(source: string, path: string, withPaths = false) {
  if (new TextEncoder().encode(source).length > 1_000_000)
    throw new Error("Use a JSON document smaller than 1 MB.");
  if (path.length > 4000) throw new Error("Keep the query under 4,000 characters.");
  const value: Parameters<JSONPathJS["find"]>[0] = JSON.parse(source);
  const query = new JSONPathJS(path);
  const matches = withPaths ? query.paths(value) : query.find(value);
  if (!Array.isArray(matches))
    throw new TypeError("The query engine returned an unexpected result.");
  if (matches.length > 10_000) throw new Error("More than 10,000 matches. Narrow the query.");
  const output = JSON.stringify(matches, null, 2);
  if (output.length > 2_000_000) throw new Error("The result is too large. Narrow the query.");
  return { output, count: matches.length };
}
