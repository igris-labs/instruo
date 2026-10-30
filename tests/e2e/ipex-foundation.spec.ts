import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("canonical sm controls retain sizes, decimals, select models and overlay behavior", async ({
  page,
}) => {
  await visit(page, "/__foundation");
  await expect(page.getByRole("heading", { name: "IPEX conformance" })).toBeVisible();
  const primary = page.getByTestId("primary");
  await expect(primary).toHaveCSS("height", "28px");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Instruo");
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Instruo");
  const amount = page.getByRole("spinbutton", { name: "Amount", exact: true });
  await amount.fill("3.7");
  await amount.press("Tab");
  await expect(amount).toHaveValue("3.7");
  await page.getByRole("combobox", { name: "Format", exact: true }).click();
  await page.getByRole("option", { name: "PNG", exact: true }).click();
  await expect(page.getByText("Selected: png · Amount: 3.7")).toBeVisible();
  await page.getByRole("tab", { name: "Overlays", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Open dialog", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Test dialog" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(5, 5);
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Copy", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Notify", exact: true }).click();
  await expect(page.getByText("Test notification", { exact: true })).toBeVisible();
});

test("primary labels stay white and monochrome actions are readable in both themes", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("nuxt-color-mode", "light"));
  await page.emulateMedia({ colorScheme: "light" });
  await visit(page, "/__foundation");
  await expect(page.getByTestId("primary")).toHaveCSS("color", "oklch(1 0 0)");
  const colors = await page.getByTestId("accent").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      accent: style.getPropertyValue("--accent").trim(),
      primary: style.getPropertyValue("--primary").trim(),
    };
  });
  expect(colors.accent).toBe(colors.primary);
  async function contrast() {
    return page.getByTestId("accent").evaluate((element) => {
      const style = getComputedStyle(element);
      const context = document.createElement("canvas").getContext("2d")!;
      function luminance(color: string) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
      }
      const foreground = luminance(style.color);
      const stops =
        style.backgroundImage.match(/oklch\([^)]*\)|rgba?\([^)]*\)|color\([^)]*\)/g) ?? [];
      if (!stops.length) throw new Error("Accent button gradient stops were not resolved");
      return Math.min(
        ...stops.map((color) => {
          const background = luminance(color);
          return (
            (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
          );
        }),
      );
    });
  }
  await expect.poll(contrast).toBeGreaterThanOrEqual(4.5);
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(contrast).toBeGreaterThanOrEqual(4.5);
});
