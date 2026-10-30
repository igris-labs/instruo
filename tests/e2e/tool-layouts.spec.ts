import { expect, test } from "@playwright/test";
import { resources } from "../helpers/catalogue";
import { visit } from "./helpers";

const tools = [
  "api-request-builder",
  "color-converter",
  "graphql-formatter",
  "http-status",
  "json-schema-studio",
  "unit-converter",
  "stopwatch",
  "hmac-generator",
];

const allTools = resources.filter((resource) => resource.kind === "tool");

for (const width of [390, 820]) {
  test(`all 101 tool workspaces fit and align at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    for (const resource of allTools) {
      await visit(page, resource.proposedRoute);
      const layout = page.locator("[data-tool-layout]");
      await expect(layout, resource.id).toBeVisible();
      const header = await page.locator("article > header").boundingBox();
      const bounds = await layout.boundingBox();
      expect(Math.abs(header!.x - bounds!.x), resource.id).toBeLessThan(2);
      expect(
        await layout.evaluate((element) => element.scrollWidth - element.clientWidth),
        resource.id,
      ).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        resource.id,
      ).toBeLessThanOrEqual(1);
      await expect(page.getByText("This workspace could not load", { exact: true })).toHaveCount(0);
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 820, 1440]) {
    test(`${theme} tool alignment and action hierarchy at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of tools) {
        await visit(page, `/tools/${slug}`);
        const layout = page.locator("[data-tool-layout]");
        await expect(layout).toBeVisible();
        const title = await page.locator("article > header").boundingBox();
        const bounds = await layout.boundingBox();
        expect(Math.abs(bounds!.x - title!.x), slug).toBeLessThan(2);
        expect(
          await layout.evaluate((element) => element.scrollWidth - element.clientWidth),
          slug,
        ).toBeLessThanOrEqual(1);
        for (const bar of await layout.locator("[data-tool-actions]").all()) {
          expect(await bar.evaluate((element) => getComputedStyle(element).justifyContent)).toBe(
            slug === "stopwatch" ? "center" : "flex-end",
          );
          const actions = await bar.locator("button").evaluateAll((buttons) =>
            buttons.map((button) => ({
              primary: button.className.includes("--button-color:var(--primary)"),
              label: button.textContent?.trim(),
              height: button.getBoundingClientRect().height,
            })),
          );
          for (const action of actions) {
            expect(action.height, `${slug}: ${action.label}`).toBe(28);
            if (/copy|reset|clear|download/i.test(action.label ?? ""))
              expect(action.primary).toBe(false);
          }
          const primary = actions.findIndex((action) => action.primary);
          if (primary !== -1) expect(primary, slug).toBe(actions.length - 1);
        }
        if (slug === "unit-converter") {
          const category = await page
            .getByRole("combobox", { name: "Category", exact: true })
            .boundingBox();
          const amount = await page
            .getByRole("spinbutton", { name: "Amount", exact: true })
            .boundingBox();
          // Compare the whole NumberField, not the input between its +/- controls.
          const amountField = await page
            .getByRole("spinbutton", { name: "Amount", exact: true })
            .locator("xpath=..")
            .boundingBox();
          expect(Math.abs(category!.width - amountField!.width)).toBeLessThan(2);
          expect(amount!.width).toBeGreaterThan(50);
        }
        if (slug === "graphql-formatter") {
          const input = await page.getByLabel("GraphQL document", { exact: true }).boundingBox();
          const output = await page.getByLabel("Formatted query", { exact: true }).boundingBox();
          expect(input!.height).toBe(output!.height);
          if (bounds!.width >= 768) expect(Math.abs(input!.y - output!.y)).toBeLessThan(2);
        }
        if (slug === "api-request-builder") {
          const output = await page.getByLabel("Generated request", { exact: true }).boundingBox();
          expect(Math.abs(output!.width - bounds!.width)).toBeLessThan(2);
          expect(output!.height).toBeLessThan(180);
        }
        if (
          ["graphql-formatter", "unit-converter", "json-schema-studio", "stopwatch"].includes(slug)
        ) {
          await page.screenshot({ path: testInfo.outputPath(`${slug}.png`), fullPage: true });
        }
      }
    });
  }
}

test("Snake route content stays within each IPEX button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await visit(page, "/games/snake");
  const picker = page.getByRole("group", { name: "Snake stages", exact: true });
  await expect(picker).toBeVisible();
  for (const button of await picker.getByRole("button").all()) {
    expect(
      await button.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return [...element.querySelectorAll("strong, small, svg")].every((child) => {
          const box = child.getBoundingClientRect();
          return (
            box.left >= bounds.left &&
            box.right <= bounds.right &&
            box.top >= bounds.top &&
            box.bottom <= bounds.bottom
          );
        });
      }),
    ).toBe(true);
  }
  await picker.getByRole("button", { name: /Circuit/ }).click();
  await expect(page.getByRole("button", { name: /Start Circuit/ })).toBeVisible();
});
