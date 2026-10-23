import { expect, test } from "@playwright/test";

test("homepage exposes task-first navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Instruo/);
  await expect(page.getByRole("heading", { name: "Small tasks. Done well." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Browse tools", exact: true })).toHaveAttribute(
    "href",
    "/tools",
  );
  await expect(page.getByRole("textbox", { name: "JSON input", exact: true })).toBeVisible();
});

test("a catalogue route opens without a hydration error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: "Tools", exact: true })).toBeVisible();
  expect(errors.filter((message) => /hydration|unhandled/i.test(message))).toEqual([]);
});

test("catalogues support direct keyboard filtering", async ({ page }) => {
  await page.goto("/tools");
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("navigation", { name: "Tool categories" })
    .getByRole("button", { name: /Everyday/ })
    .click();
  await expect(page).toHaveURL(/category=Everyday/);

  const toolSearch = page.getByRole("textbox", { name: "Search tools" });
  await page.keyboard.press("/");
  await expect(toolSearch).toBeFocused();
  await toolSearch.fill("world clock");
  await expect(page.getByRole("link", { name: /World Clock/i })).toBeVisible();

  await page.goto("/games");
  await page.waitForLoadState("networkidle");
  const gameSearch = page.getByRole("textbox", { name: "Search games" });
  await gameSearch.fill("wordle");
  await expect(page.getByRole("link", { name: "Play Wordle" })).toBeVisible();
});

test("catalogue pages do not overflow a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/tools", "/games"]) {
    await page.goto(path);
    const widths = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(widths.content).toBe(widths.viewport);
  }
});

test("global search opens with keyboard and navigates to a tool", async ({ page }) => {
  await page.goto("/tools");
  const trigger = page.getByRole("button", { name: "Search tools and games", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("Search tools and games…").fill("world clock");
  await dialog.getByRole("option", { name: /World Clock/ }).click();
  await expect(page).toHaveURL(/world-clock/);
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("mobile resource navigation uses a dismissible sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/everyday/world-clock");
  await page.getByRole("button", { name: "Browse tools", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("textbox")).toHaveCount(0);
  await drawer.getByRole("button", { name: "Developer", exact: true }).click();
  await drawer.getByRole("link", { name: "JSON Formatter", exact: true }).click();
  await expect(page).toHaveURL(/json-formatter/);
  await expect(drawer).not.toBeVisible();
});

test("theme controls switch the shared application theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).first().click();
  await expect(page.locator("html")).toHaveClass(/light/);
});
