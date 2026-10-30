import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("CSV preserves multiline fields, offers explicit typing, and blocks ambiguous headers", async ({
  page,
}) => {
  await visit(page, "/tools/csv-json");
  const input = page.getByRole("textbox", { name: "CSV input", exact: true });
  const output = page.getByRole("textbox", { name: "JSON output", exact: true });
  await input.fill('name,notes\nAda,"First line\nSecond, line"');
  await expect(output).toHaveValue(/First line\\nSecond, line/);
  await input.fill("id,score\n001,10");
  await page.getByRole("checkbox", { name: "Convert numbers and booleans", exact: true }).check();
  await expect(output).toHaveValue(/"id": "001",\n\s+"score": 10/);
  await input.fill("name,name\na,b");
  await expect(page.getByRole("alert")).toContainText("Duplicate column names");
  await expect(page.getByRole("button", { name: "Copy JSON", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "First row contains headers", exact: true }).uncheck();
  await expect(output).toHaveValue(/"name",\n\s+"name"/);
});

test("JSON/YAML exposes direction, round-trips a result and never exports an error message", async ({
  page,
}) => {
  await visit(page, "/tools/json-yaml");
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "YAML output", exact: true })).toHaveValue(
    /name: Ada/,
  );
  await page.getByRole("button", { name: "Swap direction", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue(
    /"name": "Ada"/,
  );
  await page
    .getByRole("textbox", { name: "YAML input", exact: true })
    .fill("name: Ada\nname: Linus");
  await expect(page.getByRole("alert")).toContainText("unique");
  await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
});

test("JSON Schema validates real constraints and clears stale validity after an edit", async ({
  page,
}) => {
  await visit(page, "/tools/json-schema-studio");
  const input = page.getByRole("textbox", { name: "JSON document", exact: true });
  const schema = page.getByRole("textbox", { name: "JSON Schema", exact: true });
  await input.fill('{"age":10}');
  await schema.fill('{"type":"object","properties":{"age":{"type":"integer","minimum":18}}}');
  await page.getByRole("button", { name: "Validate JSON", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("/age: must be >= 18");
  await input.fill('{"age":20}');
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Validate JSON", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Valid: JSON matches schema." }),
  ).toBeVisible();
  await input.fill('{"age":1}');
  await expect(page.getByText("Valid: JSON matches schema.", { exact: true })).toHaveCount(0);
});

test("path queries show recursive matches and filters with normalized paths", async ({ page }) => {
  await visit(page, "/tools/jsonpath-tester");
  await page.getByRole("textbox", { name: "JSONPath", exact: true }).fill("$..name");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Result", exact: true })).toHaveValue(
    /Ada[\s\S]*Linus/,
  );
  await page.getByRole("checkbox", { name: "Include matching paths", exact: true }).check();
  await page
    .getByRole("textbox", { name: "JSONPath", exact: true })
    .fill("$.users[?@.active == true].name");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Result", exact: true })).toHaveValue(
    /\$\['users'\]\[0\]\['name'\]/,
  );
  await expect(page.getByRole("textbox", { name: "Result", exact: true })).not.toHaveValue(/Linus/);
});

test("numeric sorting retains non-numeric data and reverses only numeric order", async ({
  page,
}) => {
  await visit(page, "/tools/text-sorter");
  await page.getByRole("textbox", { name: "Input", exact: true }).fill("pear\n20\n3\napple");
  await page.getByRole("radio", { name: "Numerical", exact: true }).check();
  await expect(page.getByRole("textbox", { name: "Output", exact: true })).toHaveValue(
    "3\n20\npear\napple",
  );
  await page.getByRole("checkbox", { name: "Descending order", exact: true }).check();
  await expect(page.getByRole("textbox", { name: "Output", exact: true })).toHaveValue(
    "20\n3\npear\napple",
  );
});

test("Base64URL swaps encode/decode and Morse refuses data loss", async ({ page }) => {
  await visit(page, "/tools/base64");
  await page.getByRole("combobox", { name: "Alphabet", exact: true }).click();
  await page.getByRole("option", { name: "Base64URL · no padding", exact: true }).click();
  await page.getByRole("textbox", { name: "Input", exact: true }).fill("Hello 🌍");
  await expect(page.getByRole("textbox", { name: "Output", exact: true })).toHaveValue(
    "SGVsbG8g8J-MjQ",
  );
  await page.getByRole("button", { name: "Swap direction", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Output", exact: true })).toHaveValue("Hello 🌍");
  await visit(page, "/tools/morse-code");
  await page.getByRole("textbox", { name: "Input", exact: true }).fill("Hello 🌍");
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
  await expect(page.getByText(/Morse code does not support/)).toBeVisible();
});

test("a pathological schema cannot freeze the page", async ({ page }) => {
  await visit(page, "/tools/json-schema-studio");
  await page
    .getByRole("textbox", { name: "JSON document", exact: true })
    .fill(JSON.stringify(`${"a".repeat(40)}!`));
  await page
    .getByRole("textbox", { name: "JSON Schema", exact: true })
    .fill('{"type":"string","pattern":"^(a+)+$"}');
  await page.getByRole("button", { name: "Validate JSON", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("took too long", { timeout: 10_000 });
  await page.getByRole("textbox", { name: "JSON document", exact: true }).fill('"aaa"');
  await page.getByRole("button", { name: "Validate JSON", exact: true }).click();
  await expect(page.getByText("Valid: JSON matches schema.", { exact: true })).toBeVisible();
});

for (const theme of ["light", "dark"] as const)
  for (const width of [390, 820, 1440]) {
    test(`${theme} parser and text products fit ${width}px containers`, async ({ page }, info) => {
      test.setTimeout(120_000);
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of [
        "javascript-formatter",
        "html-formatter",
        "css-minifier",
        "sql-formatter",
        "xml-formatter",
        "graphql-formatter",
        "csv-json",
        "json-yaml",
        "json-schema-studio",
        "jsonpath-tester",
        "case-changer",
        "text-sorter",
        "base64",
        "morse-code",
      ]) {
        await visit(page, `/tools/${slug}`);
        const example = page.getByRole("button", { name: "Load example", exact: true });
        if (await example.count()) await example.click();
        if (["case-changer", "text-sorter", "base64", "morse-code"].includes(slug))
          await page
            .getByRole("textbox", { name: "Input", exact: true })
            .fill(slug === "text-sorter" ? "pear\n20\n3\napple" : "Hello world");
        await expect(page.locator("[data-tool-layout]")).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          slug,
        ).toBeLessThanOrEqual(1);
        expect(
          await page
            .locator("[data-tool-layout]")
            .evaluate((element) => element.scrollWidth - element.clientWidth),
          slug,
        ).toBeLessThanOrEqual(1);
        await page.screenshot({ path: info.outputPath(`${slug}.png`), fullPage: true });
      }
    });
  }
