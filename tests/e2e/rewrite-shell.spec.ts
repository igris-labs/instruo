import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("catalogues use actual counts and distinct tool/game presentation", async ({ page }) => {
  const runtimes: string[] = [];
  page.on("request", (request) => {
    if (/phaser|createFlappyBirdGame/.test(request.url())) runtimes.push(request.url());
  });
  await visit(page, "/tools");
  await expect(page.getByRole("heading", { name: "Find the right tool" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Directory results" })).toContainText("101 tools");
  await page.getByRole("textbox", { name: "Search tools", exact: true }).fill("JSON Formatter");
  await expect(page.getByRole("status", { name: "Directory results" })).toContainText("1 tool");
  await expect(
    page.locator("[data-tool-card]").filter({ hasText: "JSON Formatter" }),
  ).toHaveAttribute("href", "/tools/json-formatter");
  await page
    .getByRole("textbox", { name: "Search tools", exact: true })
    .fill("no matching utility xyz");
  await expect(page.getByRole("heading", { name: "No matches" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.getByRole("status", { name: "Directory results" })).toContainText("101 tools");
  await page.getByRole("link", { name: "Games", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Pick your next break" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Directory results" })).toContainText("32 games");
  await expect(page.getByRole("img", { name: "Lights Out artwork", exact: true })).toHaveAttribute(
    "src",
    "/game-arts/lights-out.jpg",
  );
  expect(runtimes).toEqual([]);
});

test("global search keeps the IPEX keyboard flow and closes outside", async ({ page }) => {
  await visit(page, "/");
  const trigger = page.getByRole("button", { name: "Search tools and games", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Search tools and games" });
  const input = dialog.getByRole("combobox");
  await input.fill("JSON Formatter");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await expect(dialog.locator("svg")).not.toHaveCount(0);
  await input.press("Enter");
  await expect(page).toHaveURL(/\/tools\/json-formatter$/);
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press("ControlOrMeta+k");
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).not.toBeVisible();
});

for (const width of [390, 768, 1024, 1440]) {
  test(`workspace fits a ${width}px container and uses native mobile navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, "/tools/json-formatter");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    if (width < 1024) {
      await page.getByRole("button", { name: "Toggle navigation", exact: true }).click();
      const navigation = page.getByRole("dialog");
      await expect(navigation).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(navigation).not.toBeVisible();
    }
    await page
      .getByRole("textbox", { name: "JSON input", exact: true })
      .fill('{"responsive":true}');
    await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue(
      /"responsive": true/,
    );
  });
}

test("light theme, reduced motion and 200% text preserve the working page", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("nuxt-color-mode", "light"));
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 768, height: 900 });
  await visit(page, "/tools/image-format-converter");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  await expect(page.getByRole("button", { name: "Choose an image", exact: true })).toBeVisible();
});
