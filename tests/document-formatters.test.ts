import type { DocumentLanguage } from "../app/features/tools/developer/formatting/format";
import { describe, expect, it } from "vitest";
import { formatDocument } from "../app/features/tools/developer/formatting/format";
const options = (language: DocumentLanguage, mode: "format" | "minify" = "format") => ({
  language,
  mode,
  indent: 2,
  dialect: "sql",
});
describe("parser-backed document formatting", () => {
  it("preserves JavaScript strings, templates, regexes and comments without running code", async () => {
    const source =
      // eslint-disable-next-line no-template-curly-in-string -- Test fixture must preserve a literal JavaScript template.
      'const url="https://example.com/a;b"; const regex=/a{2}/; const message=`a;${url}`; // keep me\nthrow new Error("never execute");';
    const formatted = await formatDocument(source, options("javascript"));
    expect(formatted).toContain('"https://example.com/a;b"');
    expect(formatted).toContain("/a{2}/");
    expect(formatted).toContain("// keep me");
    expect(await formatDocument(formatted, options("javascript"))).toBe(formatted);
    const minified = await formatDocument(source, options("javascript", "minify"));
    expect(minified).toContain("https://example.com/a;b");
    expect(minified).toContain('throw new Error("never execute")');
  });
  it("preserves HTML preformatted text and avoids treating URL colons as syntax", async () => {
    // HTML minification's browser-only bundle is exercised by the real-worker browser test.
    for (const mode of ["format"] as const) {
      const text = await formatDocument(
        '<main><pre>  a\n    b  </pre><a href="https://example.com">Read more</a></main>',
        options("html", mode),
      );
      expect(text).toContain("  a\n    b  ");
      expect(text).toContain('href="https://example.com"');
    }
  });
  it("handles CSS semicolons inside strings and calc whitespace", async () => {
    const result = await formatDocument(
      '.a { content: "a ; b"; width: calc(100% - 2px); }',
      options("css", "minify"),
    );
    expect(result).toContain('"a ; b"');
    expect(result).toContain("calc(100% - 2px)");
  });
  it("formats SQL according to the selected dialect without changing literals", async () => {
    const result = await formatDocument(
      "select 'from here' as label from users where name = 'where';",
      options("sql"),
    );
    expect(result).toContain("SELECT");
    expect(result).toContain("'from here'");
    expect(result).toContain("'where'");
    await expect(
      formatDocument("select 1", { ...options("sql"), dialect: "unknown" }),
    ).rejects.toThrow("supported SQL dialect");
  });
  it("preserves XML entity references and rejects broken markup", async () => {
    expect(
      await formatDocument("<root><item>A &amp; B</item><empty /></root>", options("xml")),
    ).toContain("A &amp; B");
    await expect(formatDocument("<root><item></root>", options("xml"))).rejects.toThrow();
  });
  it("formats GraphQL and reports extra closing braces instead of crashing", async () => {
    expect(
      await formatDocument(
        "query User($id: ID!) { user(id: $id) { id name } }",
        options("graphql"),
      ),
    ).toContain("  user(id: $id) {");
    await expect(formatDocument("query { name }}", options("graphql"))).rejects.toThrow();
  });
  it("rejects oversized source and invalid indentation", async () => {
    await expect(formatDocument("x".repeat(2_000_001), options("javascript"))).rejects.toThrow(
      "2 MB",
    );
    await expect(
      formatDocument("const a = 1", { ...options("javascript"), indent: -1 }),
    ).rejects.toThrow("spaces");
    expect(await formatDocument("   ", options("css"))).toBe("");
  });
});
