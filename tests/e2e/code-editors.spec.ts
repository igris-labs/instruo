import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("JSON highlighting and folding never change the downloaded data", async ({ page }) => {
  await visit(page, "/tools/json-formatter");
  const value = { name: "<img src=x onerror=alert(1)>", details: { ready: true, list: [1, 2] } };
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  const output = page.getByRole("textbox", { name: "JSON output", exact: true });
  await input.fill(JSON.stringify(value));
  const editor = page.locator("[data-code-editor]").filter({ has: output });
  await expect(editor.locator(".syntax-token").first()).toBeVisible();
  await expect(editor.locator("img")).toHaveCount(0);
  const fold = editor.getByRole("button", { name: "Collapse block at line 3", exact: true });
  const lineNumber = editor.locator("[data-line-number]").filter({ hasText: /^3$/ });
  await expect(lineNumber).toHaveText("3");
  const numberBounds = (await lineNumber.boundingBox())!;
  const foldBounds = (await fold.boundingBox())!;
  expect(foldBounds.x).toBeGreaterThanOrEqual(numberBounds.x + numberBounds.width);
  await fold.click();
  await expect(output).toHaveValue(/…/);
  await expect(
    editor.getByRole("button", { name: "Expand block at line 3", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(lineNumber).toHaveText("3");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const stream = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(value);
  await editor.getByRole("button", { name: "Collapse all", exact: true }).click();
  await expect(output).toHaveValue(/^\{ … \}$/);
  await editor.getByRole("button", { name: "Expand all", exact: true }).click();
  await expect(output).toHaveValue(JSON.stringify(value, null, 2));
  await input.fill("{broken");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(editor.getByRole("button", { name: "Collapse all", exact: true })).toHaveCount(0);
});

test("syntax colors follow light/dark mode without altering editor text", async ({ page }) => {
  await visit(page, "/tools/json-formatter");
  await page
    .getByRole("textbox", { name: "JSON input", exact: true })
    .fill('{"name":"Instruo","ready":true}');
  const token = page
    .locator("[data-code-editor] .syntax-token")
    .filter({ hasText: '"Instruo"' })
    .first();
  await expect(token).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  });
  const light = await token.evaluate((element) => getComputedStyle(element).color);
  await page.evaluate(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });
  expect(await token.evaluate((element) => getComputedStyle(element).color)).not.toBe(light);
  await expect(page.getByRole("textbox", { name: "JSON input", exact: true })).toHaveValue(
    '{"name":"Instruo","ready":true}',
  );
});

test("scrolling, resizing and large input retain usable native editors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, "/tools/json-formatter");
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  await input.fill(
    JSON.stringify(
      { list: Array.from({ length: 100 }, (_, id) => ({ id, label: "x".repeat(100) })) },
      null,
      2,
    ),
  );
  await expect(page.locator(".syntax-token").first()).toBeVisible();
  await input.evaluate((element) => {
    element.scrollTop = 200;
    element.scrollLeft = 80;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator("[data-code-editor]").first().locator("pre")).toHaveCSS(
    "transform",
    /matrix/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.fill("x".repeat(100_001));
  await expect(page.locator("[data-code-editor]").first()).toHaveAttribute(
    "data-highlight-state",
    "ready",
  );
  await expect(page.getByText(/Large document: highlighting is paused/)).toHaveCount(0);
  await input.fill("false");
  await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue(
    "false",
  );
});

for (const [route, language, input] of [
  ["/tools/javascript-formatter", "js", "const answer = 42;"],
  ["/tools/sql-formatter", "sql", "SELECT id FROM users WHERE active = true;"],
  ["/tools/html-formatter", "html", '<div class="example">Hello</div>'],
  ["/tools/type-generator", "ts", null],
  ["/tools/git-command", "bash", null],
]) {
  test(`${route} uses its own syntax grammar`, async ({ page }) => {
    await visit(page, route!);
    const editor = page.locator(`[data-language="${language}"]`).first();
    if (input) await editor.locator("textarea").fill(input);
    await expect(editor.locator(".syntax-token").first()).toBeVisible();
  });
}

test("landing hero has the requested additional breathing room", async ({ page }) => {
  await visit(page, "/");
  const hero = page.locator("section[aria-labelledby=hero-title]");
  expect((await hero.boundingBox())!.height).toBeGreaterThan(400);
});
