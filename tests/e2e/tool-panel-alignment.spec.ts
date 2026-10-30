import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const theme of ["light", "dark"]) {
  for (const width of [390, 820, 1440]) {
    test(`${theme} document panels and UUID use deliberate aligned space at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((mode) => localStorage.setItem("nuxt-color-mode", mode), theme);
      for (const tool of ["markdown-preview", "markdown-table", "mermaid-editor"]) {
        await visit(page, `/tools/${tool}`);
        const editor = page.locator("[data-tool-layout] textarea").first();
        const other =
          tool === "markdown-table"
            ? page.locator("[data-tool-layout] textarea").nth(1)
            : page.getByLabel(
                tool === "markdown-preview" ? "Markdown preview" : "Diagram preview",
                { exact: true },
              );
        const a = (await editor.boundingBox())!;
        const b = (await other.boundingBox())!;
        expect(Math.abs(a.height - b.height), tool).toBeLessThan(2);
        expect(a.height, tool).toBeLessThanOrEqual(384);
        if (width === 1440) {
          expect(Math.abs(a.y - b.y), tool).toBeLessThan(2);
          expect(Math.abs(a.width - b.width), tool).toBeLessThan(2);
        } else expect(b.y, tool).toBeGreaterThan(a.y + a.height);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          tool,
        ).toBeLessThanOrEqual(1);
      }
      await visit(page, "/tools/uuid-generator");
      const workspace = (await page.locator("[data-tool-layout]").boundingBox())!;
      const output = (await page.getByLabel("UUID v4 output", { exact: true }).boundingBox())!;
      expect(Math.abs(output.width - workspace.width)).toBeLessThan(2);
      expect(output.height).toBeLessThan(140);
    });
  }
  test(`${theme} checkbox text has an 8px gap and remains clickable`, async ({ page }) => {
    await page.addInitScript((mode) => localStorage.setItem("nuxt-color-mode", mode), theme);
    await visit(page, "/tools/unix-permissions");
    const checkbox = page.getByRole("checkbox", { name: "Owner Read", exact: true });
    const gap = await checkbox.evaluate(
      (element) =>
        element.parentElement!.querySelector(".akaza-checkbox-text")!.getBoundingClientRect().left -
        element.getBoundingClientRect().right,
    );
    expect(gap).toBe(8);
    await page.getByText("Owner Read", { exact: true }).click();
    await expect(checkbox).not.toBeChecked();
  });
}
