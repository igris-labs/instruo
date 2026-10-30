import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("workspace has a wider IPEX sidebar, three-column collection and no table of contents", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2048, height: 1135 });
  await visit(page, "/tools/json-formatter");
  await expect(page.locator(".akaza-sidebar-root")).toHaveCSS("width", "276px");
  await expect(
    page
      .getByRole("navigation", { name: "Resources", exact: true })
      .locator(".akaza-navigation-menu-list"),
  ).toHaveCSS("--sidebar-group-gap", "20px");
  await expect(page.getByRole("complementary", { name: "On this page", exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole("banner").getByText("Code & data", { exact: true })).toBeVisible();
  const breadcrumb = page
    .getByRole("banner")
    .getByRole("navigation", { name: "Breadcrumb", exact: true });
  await expect(breadcrumb.locator("svg")).toHaveCount(1);
  await expect(breadcrumb.locator("svg path")).toHaveAttribute("d", "m9 5 7 7-7 7");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("JSON Formatter");
  await visit(page, "/tools");
  const cards = page.locator("[data-tool-card]");
  const row = await cards.evaluateAll((items) =>
    items.slice(0, 4).map((item) => item.getBoundingClientRect().top),
  );
  expect(row[0]).toBe(row[1]);
  expect(row[1]).toBe(row[2]);
  expect(row[3]).toBeGreaterThan(row[2]!);
  await expect(page.getByRole("complementary", { name: "On this page", exact: true })).toHaveCount(
    0,
  );
});

test("directory results reserve a full page of space without stretching the last cards", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const kind of ["tools", "games"]) {
      await visit(page, kind === "tools" ? "/tools?category=Image" : "/games");
      const results = page.locator('section[aria-label="Directory results"]');
      const initial = await results.evaluate((element) => element.getBoundingClientRect().height);
      const last = kind === "tools" ? 2 : 3;
      await page.getByRole("button", { name: `Go to page ${last}`, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`page=${last}`));
      await expect
        .poll(async () => results.evaluate((element) => element.getBoundingClientRect().height))
        .toBe(initial);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});

test("tools have bounded flat cards, working category navigation and persistent page state", async ({
  page,
}) => {
  const hydration: string[] = [];
  page.on("console", (message) => {
    if (/hydration/i.test(message.text())) hydration.push(message.text());
  });
  await visit(page, "/tools");
  const cards = page.locator("[data-tool-card]");
  await expect(cards).toHaveCount(12);
  await expect(cards.first()).toContainText("JSON Formatter");
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Showing 13–24 of 101", { exact: true })).toBeVisible();
  await expect(cards).toHaveCount(12);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-instruo-ready", "true");
  await expect(page.getByText("Showing 13–24 of 101", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Images & design", exact: true }).click();
  await expect(page).toHaveURL(/category=Image/);
  await expect(page.getByRole("status", { name: "Directory results", exact: true })).toContainText(
    "15 tools",
  );
  await expect(page.getByText("Showing 1–12 of 15", { exact: true })).toBeVisible();
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page.getByRole("heading", { name: "Images & design", exact: true })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Images & design", exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Resources", exact: true })
      .locator("[data-nav-track]:visible"),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Clear filters", exact: true })).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search tools", exact: true })
    .fill("image format converter");
  await expect(page.getByRole("status", { name: "Directory results", exact: true })).toContainText(
    "1 tool",
  );
  await expect(cards.first()).toContainText("Image Format Converter");
  await cards.first().click();
  await expect(page).toHaveURL(/\/tools\/image-format-converter$/);
  await expect(
    page.getByRole("heading", { name: "Image Format Converter", exact: true, level: 1 }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("textbox", { name: "Search tools", exact: true })).toHaveValue(
    "image format converter",
  );
  await expect(cards).toHaveCount(1);
  expect(hydration).toEqual([]);
});

test("landing leads to the collection, and mobile categories remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, "/");
  await page.getByRole("button", { name: "View all tools", exact: true }).click();
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Images & design", exact: true }).click();
  await expect(page).toHaveURL(/category=Image/);
  await expect(page.getByRole("status", { name: "Directory results", exact: true })).toContainText(
    "15 tools",
  );
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Text", exact: true }).click();
  await expect(page.getByRole("status", { name: "Directory results", exact: true })).toContainText(
    "8 tools",
  );
  await expect(page.locator("[data-tool-card]")).toHaveCount(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("IPEX docs navigation has static category groups, keeps selection and closes on mobile", async ({
  page,
}) => {
  await visit(page, "/tools/json-formatter");
  const resources = page.getByRole("navigation", { name: "Resources", exact: true });
  await expect(resources.locator("button[aria-expanded]")).toHaveCount(0);
  await expect(resources.getByText("Code & data", { exact: true })).toBeVisible();
  await expect(resources.getByText("Security", { exact: true })).toHaveCount(1);
  await expect(
    resources.getByRole("link", { name: "JSON Formatter", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await resources.getByRole("link", { name: "Image Format Converter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Image Format Converter", exact: true }),
  ).toBeVisible();
  await expect(
    resources.getByRole("link", { name: "Image Format Converter", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByRole("button", { name: "Close navigation", exact: true })).toBeVisible();
  await drawer.getByRole("link", { name: "JSON Formatter", exact: true }).click();
  await expect(page.getByRole("heading", { name: "JSON Formatter", exact: true })).toBeVisible();
  await expect(drawer).not.toBeVisible();
});
