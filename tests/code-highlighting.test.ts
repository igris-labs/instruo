import { describe, expect, it } from "vitest";
import { foldJsonLines, jsonFolds } from "../app/components/code/json-folds";
import { codeViewport } from "../app/components/code/viewport";
import { codeLanguages, escapeCode, highlightCode, highlightLines } from "../app/utils/highlight";

describe("jSON folding", () => {
  const source = JSON.stringify(
    { name: 'literal } [ and \\" quotes', nested: { active: true, items: [1, 2] }, empty: [] },
    null,
    2,
  );
  it("finds multiline structures without mistaking string contents for brackets", () => {
    const ranges = jsonFolds(source);
    expect(ranges).toHaveLength(3);
    expect(ranges[0]).toEqual({ start: 0, end: source.split("\n").length - 1 });
    expect(jsonFolds('{"broken": [')).toEqual([]);
    expect(jsonFolds('{"compact":[1,2]}')).toEqual([]);
    expect(jsonFolds("false")).toEqual([]);
    expect(jsonFolds('{"list":[\n1\n]}')).toHaveLength(1);
  });
  it("collapses independently and preserves the full source outside the projection", () => {
    const ranges = jsonFolds(source);
    const closed = foldJsonLines(source, ranges, new Set([ranges[1]!.start]));
    expect(closed.map((line) => line.text).join("\n")).toContain("…");
    expect(closed.some((line) => line.text.includes('"empty": []'))).toBe(true);
    expect(
      foldJsonLines(source, ranges, new Set())
        .map((line) => line.text)
        .join("\n"),
    ).toBe(source);
    expect(JSON.parse(source).nested.items).toEqual([1, 2]);
  });
  it("retains nested collapsed state while an ancestor is closed and reopened", () => {
    const ranges = jsonFolds(source);
    const closed = new Set(ranges.map((range) => range.start));
    expect(foldJsonLines(source, ranges, closed)).toHaveLength(1);
    closed.delete(0);
    expect(foldJsonLines(source, ranges, closed).length).toBeGreaterThan(1);
    expect(foldJsonLines(source, ranges, closed).some((line) => line.collapsed)).toBe(true);
  });
});

describe("shiki fine-grained highlighter", () => {
  it.each(codeLanguages)("loads the %s grammar with both themes", async (language) => {
    const result = await highlightCode('const value = {"ready": true, "count": 42};', language);
    expect(result).toContain('class="syntax-token"');
    expect(result).toContain("--shiki-light:");
    expect(result).toContain("--shiki-dark:");
  });
  it("escapes executable markup and preserves whitespace and line breaks", async () => {
    const source = '<script>alert("unsafe")</script>\n  <img src=x onerror="alert(1)">\n';
    const html = await highlightCode(source, "html");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html.replace(/<span[^>]*>|<\/span>/g, "")).toBe(escapeCode(source));
  });
  it("falls back safely for unsupported languages", async () => {
    expect(await highlightCode("<unknown>", "missing")).toBe("&lt;unknown&gt;");
  });
  it("tokenizes more than 18,000 lines without the former character or line cutoff", async () => {
    const source = JSON.stringify(
      Array.from({ length: 4500 }, (_, id) => ({ id, label: `item-${id}` })),
      null,
      2,
    );
    expect(source.length).toBeGreaterThan(100_000);
    const lines = await highlightLines(source, "json");
    expect(lines).toHaveLength(18_002);
    expect(lines[lines.length - 3]).toContain("item-4499");
    expect(lines[lines.length - 3]).toContain("syntax-token");
  });
});

describe("code viewport", () => {
  it("keeps rendering bounded at the beginning, middle and end of a large file", () => {
    for (const y of [0, 10_000, 18_002 * 24]) {
      const range = codeViewport(y, 360, 18_002);
      expect(range.start).toBeGreaterThanOrEqual(0);
      expect(range.end).toBeLessThanOrEqual(18_002);
      expect(range.end - range.start).toBeLessThanOrEqual(33);
    }
  });
  it("adapts to resizing and safely handles an empty range", () => {
    expect(codeViewport(0, 900, 100).end).toBeGreaterThan(codeViewport(0, 200, 100).end);
    expect(codeViewport(0, 360, 0)).toEqual({ start: 0, end: 0 });
    expect(codeViewport(9000, 360, 1)).toEqual({ start: 0, end: 1 });
  });
});
