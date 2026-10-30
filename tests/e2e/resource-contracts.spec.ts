import { expect, test } from "@playwright/test";
import { resources } from "../helpers/catalogue";
import { visit } from "./helpers";

for (const resource of resources) {
  test(`${resource.id} mounts its own working presenter`, async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await visit(page, resource.proposedRoute);
    await expect(
      page.getByRole("heading", { name: resource.title, exact: true, level: 1 }),
    ).toBeVisible();
    const workspace = page.locator("#workspace");
    await expect(workspace.locator("section").first()).toBeVisible();
    if (resource.id.startsWith("tool:")) {
      const layout = workspace.locator("[data-tool-layout]");
      await expect(layout).toBeVisible();
      const title = await page.locator("article > header").boundingBox();
      const bounds = await layout.boundingBox();
      expect(Math.abs(bounds!.x - title!.x)).toBeLessThan(2);
      expect(
        await layout.evaluate((element) => element.scrollWidth - element.clientWidth),
      ).toBeLessThanOrEqual(1);
    }
    await expect(
      workspace.getByText("Not part of this working preview", { exact: true }),
    ).toHaveCount(0);
    await expect(workspace.getByText("This workspace could not load", { exact: true })).toHaveCount(
      0,
    );
    if (resource.renderer === "phaser") await expect(workspace.locator("canvas")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(failures).toEqual([]);
  });
}
