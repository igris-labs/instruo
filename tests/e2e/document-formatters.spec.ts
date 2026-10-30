import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const [route, sourceLabel, outputLabel, source, expected] of [
  [
    "javascript-formatter",
    "JavaScript input",
    "Formatted JavaScript",
    'const url="https://example.com/a;b";const n=2;',
    '"https://example.com/a;b"',
  ],
  [
    "html-formatter",
    "HTML input",
    "Formatted HTML",
    "<main><pre>  a\n    b  </pre><h1>Hello</h1></main>",
    "  a\n    b  ",
  ],
  [
    "css-minifier",
    "CSS input",
    "Minified CSS",
    '.a { content: "a ; b"; width: calc(100% - 2px); }',
    '"a ; b"',
  ],
  [
    "sql-formatter",
    "SQL input",
    "Formatted SQL",
    "select 'from here' as label from users;",
    "'from here'",
  ],
  [
    "xml-formatter",
    "XML input",
    "Formatted XML",
    "<root><item>A &amp; B</item></root>",
    "A &amp; B",
  ],
  [
    "graphql-formatter",
    "GraphQL document",
    "Formatted query",
    "query { user { id name } }",
    "  user {",
  ],
])
  test(`${route} formats in a real browser worker`, async ({ page }) => {
    await visit(page, `/tools/${route}`);
    await page.getByRole("textbox", { name: sourceLabel, exact: true }).fill(source);
    const output = page.getByRole("textbox", { name: outputLabel, exact: true });
    await expect(output).toHaveValue(new RegExp(expected!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: "Download", exact: true })).toBeEnabled();
    if (route === "html-formatter" || route === "javascript-formatter") {
      await page.getByRole("combobox", { name: "Operation", exact: true }).click();
      await page.getByRole("option", { name: "Minify", exact: true }).click();
      await expect(output).toHaveValue(
        new RegExp(expected!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        { timeout: 30_000 },
      );
    }
    if (route === "graphql-formatter") {
      await page.getByRole("textbox", { name: sourceLabel, exact: true }).fill("query { broken }}");
      await expect(page.getByRole("alert")).toContainText("Check your document");
      await expect(output).toHaveValue("");
      await expect(page.getByRole("button", { name: "Download", exact: true })).toBeDisabled();
    }
  });
