import { expect, test } from "@playwright/test";

test("compact shell exposes primary destinations and the project repository", async ({ page }) => {
  await page.goto("/tools/developer/json-formatter");
  const header = page.getByRole("banner");
  for (const name of ["Home", "Tools", "Games"]) {
    await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(header.getByRole("link", { name: "Instruo on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/igris-labs/instruo",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
});

test("resource shell fits mobile, tablet, and desktop containers", async ({ page }) => {
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/tools/developer/json-formatter", "/games/word/wordle"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
      }));
      expect(dimensions.width).toBe(dimensions.viewportWidth);
      const browse = page.getByRole("button", { name: /Browse (tools|games)/ });
      if (width < 1024) await expect(browse).toBeVisible();
      else {
        await expect(browse).not.toBeVisible();
        await expect(
          page.getByRole("textbox", { name: /Filter (tool|game) navigation/ }),
        ).toBeVisible();
      }
    }
  }
});

test("resource navigation opens on demand and closes after selection", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/tools/developer/json-formatter");
  await page.getByRole("button", { name: "Browse tools", exact: true }).click();
  const sidebar = page.getByRole("dialog");
  await sidebar.getByRole("textbox", { name: "Filter tool navigation" }).fill("Unit Converter");
  const target = sidebar.getByRole("link", { name: "Unit Converter", exact: true });
  await target.click();
  await expect(page).toHaveURL(/unit-converter/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Unit Converter");
  await expect(sidebar).not.toBeVisible();
  await page.getByRole("button", { name: "Browse tools", exact: true }).click();
  await expect(sidebar.getByRole("link", { name: "Unit Converter", exact: true })).toBeVisible();
});

test("search retains keyboard navigation, empty state, and dismissal", async ({ page }) => {
  await page.goto("/tools");
  await page.getByRole("button", { name: "Search tools and games", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const input = dialog.getByPlaceholder("Search tools and games…");
  await expect(input).toBeFocused();
  await input.fill("nothing-matches-this-query");
  await expect(dialog.getByText("No matches. Try another name or task.")).toBeVisible();
  await input.fill("JSON Formatter");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await input.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/json-formatter/);
  await expect(dialog).not.toBeVisible();
});

test("home formatter is usable and opens the existing full tool", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "JSON input", exact: true }).fill('{"works":true}');
  await expect(page.getByRole("textbox", { name: "Valid JSON output", exact: true })).toHaveValue(
    '{\n  "works": true\n}',
  );
  await page.getByRole("link", { name: "Open JSON Formatter", exact: true }).click();
  await expect(page).toHaveURL(/tools\/developer\/json-formatter/);
});

test("directory groups expand into complete categories", async ({ page }) => {
  await page.goto("/tools");
  const group = page.getByRole("region", { name: "Developer", exact: true });
  await expect(group.getByRole("link")).toHaveCount(6);
  await group.getByRole("button", { name: "View all Developer tools" }).click();
  await expect(page).toHaveURL(/category=Developer/);
  expect(await group.getByRole("link").count()).toBeGreaterThan(6);
});

test("tool icons have consistent category colors in both themes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/tools");
  await page.waitForLoadState("networkidle");
  for (const theme of ["light", "dark"]) {
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    const colors = await page
      .getByRole("region", { name: "Common tasks" })
      .locator(".iconify")
      .evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).color));
    expect(new Set(colors).size).toBe(3);
    const developerColor = await page
      .getByRole("region", { name: "Developer", exact: true })
      .getByRole("link")
      .first()
      .locator(".iconify")
      .first()
      .evaluate((icon) => getComputedStyle(icon).color);
    expect(developerColor).toBe(colors[0]);
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  }
});

test("landing stays usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Browse tools", exact: true })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(
    await page
      .locator("[data-line]")
      .evaluateAll((lines) => lines.some((line) => line.getAnimations().length > 0)),
  ).toBe(false);
});

test("desktop navigation preserves its scroll position between tools", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/tools/developer/json-formatter");
  await page.waitForLoadState("networkidle");
  const sidebar = page.locator(".akaza-sidebar-body");
  const target = sidebar.getByRole("link", { name: "JSON Minifier", exact: true });
  await target.scrollIntoViewIfNeeded();
  const before = await sidebar.evaluate((element) => element.scrollTop);
  await target.click();
  await expect(page).toHaveURL(/json-minifier/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("JSON Minifier");
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeCloseTo(before, 0);
  await expect(target).toHaveAttribute("aria-current", "page");
});

test("workspace sidebar and shared icons use the larger geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/developer/json-formatter");
  await page.waitForLoadState("networkidle");
  const sidebar = page.locator(".akaza-sidebar-panel");
  expect((await sidebar.boundingBox())!.width).toBe(248);
  const link = page.getByRole("link", { name: "JSON Formatter", exact: true });
  expect((await link.locator(".iconify").first().boundingBox())!.width).toBe(20);
  const search = page.getByRole("button", { name: "Search tools and games", exact: true });
  expect((await search.locator(".iconify").boundingBox())!.width).toBe(20);
});

test("long sidebar labels stay on one line with their full name available", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tools/developer/json-formatter");
    if (width < 1024) await page.getByRole("button", { name: "Browse tools", exact: true }).click();
    const link = page.getByRole("link", { name: "JavaScript Formatter and Minifier", exact: true });
    await link.scrollIntoViewIfNeeded();
    const label = link.locator("[title]");
    await expect(label).toHaveAttribute("title", "JavaScript Formatter and Minifier");
    const geometry = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
        whitespace: style.whiteSpace,
      };
    });
    expect(geometry.whitespace).toBe("nowrap");
    expect(geometry.height).toBeLessThanOrEqual(geometry.lineHeight + 1);
    expect((await link.boundingBox())!.height).toBe(32);
  }
});

test("mobile directory categories expose all matching tools", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools");
  await page.waitForLoadState("networkidle");
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Everyday", exact: true }).click();
  await expect(page).toHaveURL(/category=Everyday/);
  await page.getByRole("textbox", { name: "Search tools" }).fill("World Clock");
  await expect(page.getByRole("link", { name: /World Clock/ })).toBeVisible();
});

test("home artwork stays inside its links across breakpoints", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const preview = page.getByRole("link", { name: "Play Flappy Bird", exact: true });
    const art = await preview.locator("img").boundingBox();
    const caption = await preview.getByRole("heading").boundingBox();
    expect(art).not.toBeNull();
    expect(caption).not.toBeNull();
    expect(art!.y + art!.height).toBeLessThan(caption!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});
