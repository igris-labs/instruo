import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const theme of ["light", "dark"] as const) {
  test(`IPEX landing, header and footer stay usable in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("nuxt-color-mode", value), theme);
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await visit(page, "/");
      await expect(
        page.getByRole("banner").locator('[data-brand="instruo-open-junction"]'),
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").locator('[data-brand="instruo-open-junction"]'),
      ).toBeVisible();
      await expect(page.locator('img[src="/logo.svg"]')).toHaveCount(0);
      await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
        "href",
        "/brand/favicon.svg",
      );
      expect(
        await page.evaluate(() => {
          const style = getComputedStyle(document.documentElement);
          return (
            style.getPropertyValue("--accent").trim() === style.getPropertyValue("--primary").trim()
          );
        }),
      ).toBe(true);
      await expect(
        page.getByRole("heading", { name: "Tools for everyday work.", exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Browse tools", exact: true })).toHaveAttribute(
        "href",
        "/tools",
      );
      await expect(
        page.getByRole("button", { name: "Explore games", exact: true }),
      ).toHaveAttribute("href", "/games");
      await expect(page.getByRole("textbox", { name: "JSON input", exact: true })).toHaveCount(0);
      await expect(page.locator('[aria-labelledby="tools-title"] [data-tool-card] h3')).toHaveCount(
        4,
      );
      await expect(
        page.getByRole("navigation", { name: "Browse tool categories", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Find a tool", exact: true })).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: "Free and open source", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "No signup. Just start.", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Processed in your browser.", exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Get started", exact: true })).toHaveAttribute(
        "href",
        "/tools",
      );
      expect(
        await page
          .locator("main > div > section")
          .evaluateAll((sections) =>
            sections.map((section) => section.getAttribute("aria-labelledby")),
          ),
      ).toEqual(["hero-title", "benefits-title", "tools-title", "games-title", "start-title"]);
      await expect(
        page.getByRole("navigation", { name: "Footer navigation", exact: true }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const search = page.getByRole("button", { name: "Search tools and games", exact: true });
      await search.click();
      await expect(page.getByRole("dialog", { name: "Search tools and games" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(search).toBeFocused();
    }
    await page.getByRole("button", { name: "Browse tools", exact: true }).click();
    await expect(page).toHaveURL(/\/tools$/);
    await expect(
      page.getByRole("heading", { name: "Find the right tool", exact: true }),
    ).toBeVisible();
  });
}

test("landing search and final call to action lead to real workflows", async ({ page }) => {
  await visit(page, "/");
  await page.getByRole("button", { name: "Search tools and games", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search tools and games", exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect(
    page.getByRole("heading", { name: "Find the right tool", exact: true }),
  ).toBeVisible();
});

test("header uses IPEX sliding hover without a left navigation track", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/", "/tools"]) {
    await visit(page, route);
    const nav = page
      .getByRole("banner")
      .getByRole("navigation", { name: "Main navigation", exact: true });
    await expect(nav.locator("[data-nav-track]")).not.toBeVisible();
    const list = nav.locator(".akaza-navigation-menu-list");
    const hoverPosition = "--nav-x";
    await nav.getByRole("link", { name: "Tools", exact: true }).hover();
    const toolsPosition = await list.evaluate(
      (element, property) => element.style.getPropertyValue(property),
      hoverPosition,
    );
    await nav.getByRole("link", { name: "Games", exact: true }).hover();
    await expect
      .poll(() =>
        list.evaluate(
          (element, property) => element.style.getPropertyValue(property),
          hoverPosition,
        ),
      )
      .not.toBe(toolsPosition);
    await expect(list).toHaveCSS("--nav-opacity", "1");
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`flat hero previews work without shifting in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("nuxt-color-mode", value), theme);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    for (const width of [390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 950 });
      await visit(page, "/");
      const preview = page.getByTestId("hero-showcase");
      const previewBounds = (await preview.boundingBox())!;
      const benefitsBounds = (await page
        .locator('section[aria-labelledby="benefits-title"]')
        .boundingBox())!;
      expect(Math.abs(previewBounds.x - benefitsBounds.x)).toBeLessThan(1);
      expect(Math.abs(previewBounds.width - benefitsBounds.width)).toBeLessThan(1);
      await expect(preview).toHaveCSS("transform", "none");
      await expect(preview.locator("[data-code-block] .syntax-token").first()).toBeVisible();
      const height = (await preview.boundingBox())!.height;
      await preview.getByRole("tab", { name: "YAML", exact: true }).click();
      await expect(preview.getByRole("tab", { name: "YAML", exact: true })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(preview.getByRole("textbox", { name: "yaml code", exact: true })).toHaveValue(
        /name: Instruo/,
      );
      await expect(
        preview.getByRole("button", { name: "Open converter", exact: true }),
      ).toHaveAttribute("href", "/tools/json-yaml");
      expect(Math.abs((await preview.boundingBox())!.height - height)).toBeLessThan(1);
      await preview.getByRole("button", { name: "Preview Sky", exact: true }).click();
      await expect(
        preview.getByRole("button", { name: "Preview Sky", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        preview.getByRole("button", { name: "Preview Sage", exact: true }),
      ).toHaveAttribute("aria-pressed", "false");
      await expect(preview.getByText("#87AACA", { exact: true })).toBeVisible();
      await expect(
        preview.getByRole("link", { name: "Play Lights Out", exact: true }),
      ).toHaveAttribute("href", "/games/lights-out");
      await expect(
        preview.getByRole("button", { name: "Open color converter", exact: true }),
      ).toHaveAttribute("href", "/tools/color-converter");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const colorCard = await preview
        .getByRole("article", { name: "Interactive color preview", exact: true })
        .boundingBox();
      const gameCard = await preview
        .getByRole("link", { name: "Play Lights Out", exact: true })
        .boundingBox();
      const formatterCard = await preview
        .getByRole("article", { name: "A little less busywork.", exact: true })
        .boundingBox();
      if (width < 1024) {
        const alignedCard = width < 640 ? gameCard! : formatterCard!;
        expect(
          Math.abs(colorCard!.y + colorCard!.height - alignedCard.y - alignedCard.height),
        ).toBeLessThan(1);
      }
      if (width === 1440) {
        const privacy = await preview
          .getByLabel("Local processing privacy", { exact: true })
          .boundingBox();
        const formatter = await preview
          .getByRole("article", { name: "A little less busywork.", exact: true })
          .boundingBox();
        expect(
          Math.abs(privacy!.y + privacy!.height - formatter!.y - formatter!.height),
        ).toBeLessThan(1);
        const nav = await page
          .getByRole("navigation", { name: "Main navigation", exact: true })
          .boundingBox();
        expect(Math.abs(nav!.x + nav!.width / 2 - width / 2)).toBeLessThan(1);
      }
    }
    await page
      .getByTestId("hero-showcase")
      .getByRole("button", { name: "Open converter", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "JSON to YAML Converter", exact: true }),
    ).toBeVisible();
  });
}

test.describe("touch hero", () => {
  test.use({ hasTouch: true });
  test("preview controls fit a small phone and keep touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visit(page, "/");
    const preview = page.getByTestId("hero-showcase");
    for (const name of ["Preview Sage", "Preview Sky", "Preview Apricot"]) {
      const button = preview.getByRole("button", { name, exact: true });
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await button.tap();
      await expect(button).toHaveAttribute("aria-pressed", "true");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test("the error screen uses the approved brand and returns home", async ({ page }) => {
  await page.goto("/unknown-brand-check-page");
  await expect(
    page.getByRole("heading", { name: "That page isn't here", exact: true }),
  ).toBeVisible();
  const home = page.getByRole("link", { name: "Instruo home", exact: true });
  await expect(home.locator('[data-brand="instruo-open-junction"]')).toBeVisible();
  await home.click();
  await expect(
    page.getByRole("heading", { name: "Tools for everyday work.", exact: true }),
  ).toBeVisible();
});
