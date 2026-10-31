import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("reference sidebar keeps mobile scroll and reveals the active item after desktop resize", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 700 });
  await visit(page, "/tools/json-formatter");
  const toggle = page.getByRole("button", { name: "Toggle navigation", exact: true });
  await toggle.click();
  const drawer = page.getByRole("dialog");
  const body = page.locator(".akaza-sidebar-body:visible");
  await expect(body).toBeVisible();
  await body.evaluate(async (element) => {
    element.scrollTop = 500;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  const position = await body.evaluate((element) => element.scrollTop);
  expect(position).toBeGreaterThan(0);
  await drawer.getByRole("button", { name: "Close navigation", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await toggle.click();
  await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(position);
  await drawer.getByRole("link", { name: "World Clock", exact: true }).click();
  await expect(page.getByRole("heading", { name: "World Clock", exact: true })).toBeVisible();
  await expect(drawer).not.toBeVisible();
  await page.setViewportSize({ width: 1440, height: 700 });
  const active = page.locator('nav[aria-label="Resources"] a[data-akaza-active]');
  await expect(active).toHaveCount(1);
  await expect(active).toHaveAttribute("href", "/tools/world-clock");
  await expect
    .poll(async () =>
      active.evaluate((element) => {
        const viewport = element.closest(".akaza-sidebar-body")!.getBoundingClientRect();
        const row = element.getBoundingClientRect();
        return row.top >= viewport.top && row.bottom <= viewport.bottom;
      }),
    )
    .toBe(true);
});

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
