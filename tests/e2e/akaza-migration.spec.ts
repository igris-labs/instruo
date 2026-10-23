import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";

test("json editing preserves field labels, validation, and live output", async ({ page }) => {
  await page.goto("/tools/developer/json-formatter");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  await input.fill('{"ready":true}');
  await expect(page.getByRole("textbox", { name: "Valid JSON output" })).toHaveValue(
    /"ready": true/,
  );
  await input.fill("{broken");
  await expect(input).toHaveAttribute("aria-invalid", "true");
});

test("numeric fields preserve decimal conversion", async ({ page }) => {
  await page.goto("/tools/everyday/unit-converter");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  const amount = page.getByRole("spinbutton", { name: "Amount", exact: true });
  await amount.fill("2.5");
  await amount.press("Tab");
  await expect(amount).toHaveValue("2.5");
  await expect(page.getByText(/8\.202/)).toBeVisible();
});

test("radio groups keep text conversion interactive", async ({ page }) => {
  await page.goto("/tools/text/case-changer");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  await page.getByRole("textbox", { name: "Input", exact: true }).fill("Hello world");
  await page.getByRole("radio", { name: "UPPERCASE", exact: true }).check();
  await expect(page.getByRole("textbox", { name: "Output", exact: true })).toHaveValue(
    "HELLO WORLD",
  );
});

test("http status accordion exposes its detailed explanations", async ({ page }) => {
  await page.goto("/tools/developer/http-status");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  const trigger = page.getByRole("button", { name: /404.*Not Found/ });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("GET /invoices/9999 references an invoice that is not available."),
  ).toBeVisible();
});

test("native file selection still produces a local converted image", async ({ page }) => {
  await page.goto("/tools/image/image-format-converter");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  await page.getByLabel("Choose an image", { exact: true }).setInputFiles({
    name: "sample.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>',
    ),
  });
  await page.getByRole("button", { name: "Convert", exact: true }).click();
  await expect(page.getByAltText("Converted image")).toHaveAttribute("src", /^blob:/);
  await expect(page.getByRole("button", { name: "Download", exact: true })).toBeEnabled();
});

test("removing a source image clears the resizer controls", async ({ page }) => {
  await page.goto("/tools/image/image-resizer");
  await expect(page.getByRole("button", { name: "Switch to dark theme" }).first()).toBeVisible();
  await page.getByLabel("Choose an image", { exact: true }).setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jAdUAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByRole("spinbutton", { name: "Width", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove pixel.png", exact: true }).click();
  await expect(page.getByRole("spinbutton", { name: "Width", exact: true })).not.toBeVisible();
});
