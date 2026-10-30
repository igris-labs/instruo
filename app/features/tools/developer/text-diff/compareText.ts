import { diffLines } from "diff";
export function compareText(left: string, right: string, ignoreWhitespace = false) {
  if (left.length + right.length > 200_000)
    throw new Error("Compare up to 200,000 characters in total.");
  if (!left && !right) return { rows: [], output: "", added: 0, removed: 0 };
  const changes = diffLines(left, right, { ignoreWhitespace, timeout: 250, maxEditLength: 2000 });
  if (!changes) throw new Error("The difference is too complex. Compare smaller sections.");
  const rows = changes.flatMap((change) =>
    change.value
      .replace(/\n$/, "")
      .split("\n")
      .map((line) => ({
        left: change.added ? "" : line,
        right: change.removed ? "" : line,
        type: change.added ? "added" : change.removed ? "removed" : "same",
      })),
  );
  return {
    rows,
    output: changes
      .map((change) =>
        change.value
          .split("\n")
          .map((line) => (change.added ? "+" : change.removed ? "-" : " ") + line)
          .join("\n"),
      )
      .join("\n"),
    added: rows.filter((row) => row.type === "added").length,
    removed: rows.filter((row) => row.type === "removed").length,
  };
}
