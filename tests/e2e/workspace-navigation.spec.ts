import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const scenario of [
  { initial: "/tools/env-formatter", next: "/tools/csv-json", title: "CSV to JSON" },
  { initial: "/games/number-guess", next: "/games/nim", title: "Nim" },
]) {
  test(`${scenario.next} hides the previous workspace while loading and selects one sidebar link`, async ({
    page,
  }) => {
    await visit(page, scenario.initial);
    const previousHeading = await page.locator("h1").textContent();
    const selected = page.locator('nav[aria-label="Resources"] a[data-akaza-active]');
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("href", scenario.initial);

    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/*", async (request) => {
      if (
        request.request().resourceType() === "script" &&
        new URL(request.request().url()).pathname.startsWith("/_nuxt/")
      ) {
        await pending;
      }
      await request.continue();
    });
    try {
      await page.locator(`nav[aria-label="Resources"] a[href="${scenario.next}"]`).click();
      await expect(
        page.getByRole("status").filter({ hasText: `Loading ${scenario.title}` }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: previousHeading!, exact: true }),
      ).not.toBeVisible();
      await expect(selected).toHaveCount(1);
      await expect(selected).toHaveAttribute("href", scenario.next);
    } finally {
      release();
    }

    await expect(
      page.getByRole("heading", { name: scenario.title, exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: `Loading ${scenario.title}` }),
    ).toHaveCount(0);
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("aria-current", "page");
    await page.goBack();
    await expect(page.getByRole("heading", { name: previousHeading!, exact: true })).toBeVisible();
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("href", scenario.initial);
    await page.goForward();
    await expect(
      page.getByRole("heading", { name: scenario.title, exact: true }).first(),
    ).toBeVisible();
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("href", scenario.next);
  });
}
