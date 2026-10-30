import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

const image = {
  name: "sample.svg",
  mimeType: "image/svg+xml",
  buffer: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>',
  ),
};

test("JSON workspace validates, recovers and downloads real JSON", async ({ page }) => {
  await visit(page, "/tools/json-formatter");
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  await input.fill('{"ready":true,"count":0}');
  const output = page.getByRole("textbox", { name: "JSON output", exact: true });
  await expect(output).toHaveValue(/"ready": true/);
  await input.fill("{broken");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Copy JSON", exact: true })).toBeDisabled();
  await input.fill("false");
  await expect(output).toHaveValue("false");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("formatted.json");
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe("false");
});

test("image conversion produces the selected MIME and dimensions, with stale results cleared", async ({
  page,
}) => {
  await visit(page, "/tools/image-format-converter");
  const picker = page.getByLabel("Source image file", { exact: true });
  await picker.setInputFiles(image);
  await expect(page.getByAltText("Original image", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Convert image", exact: true }).click();
  const output = page.getByAltText("Converted image", { exact: true });
  await expect(output).toBeVisible();
  const result = await output.evaluate(async (element: HTMLImageElement) => {
    const response = await fetch(element.src);
    const blob = await response.blob();
    return { mime: blob.type, width: element.naturalWidth, height: element.naturalHeight };
  });
  expect(result).toEqual({ mime: "image/webp", width: 20, height: 10 });
  await page.getByRole("button", { name: "Remove image", exact: true }).click();
  await expect(output).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Convert image", exact: true })).toBeDisabled();
  await picker.setInputFiles(image);
  await expect(page.getByAltText("Original image", { exact: true })).toBeVisible();
});

test("Lights Out changes cells, charges hints and resets the same circuit", async ({ page }) => {
  await visit(page, "/games/lights-out");
  await page.getByRole("button", { name: "Start circuit", exact: true }).click();
  const lights = page.getByRole("button", { name: /^Light \d+, (on|off)$/ });
  await expect(lights).toHaveCount(25);
  const before = await lights.first().getAttribute("aria-label");
  await lights.first().click();
  await expect(lights.first()).not.toHaveAttribute("aria-label", before!);
  await page.getByRole("button", { name: "Hint +2", exact: true }).click();
  await expect(page.getByText("3 scored moves", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset circuit", exact: true }).click();
  await expect(page.getByText("0 scored moves", { exact: true })).toBeVisible();
  await expect(lights.first()).toHaveAttribute("aria-label", before!);
});

test("image removal during encoding cannot resurrect an old result", async ({ page }) => {
  await visit(page, "/tools/image-format-converter");
  await page.getByLabel("Source image file", { exact: true }).setInputFiles(image);
  await expect(page.getByAltText("Original image", { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...options) {
      original.call(
        this,
        (blob) => {
          setTimeout(() => {
            callback(blob);
            document.documentElement.dataset.encodingSettled = "true";
          }, 350);
        },
        ...options,
      );
    };
  });
  await page.getByRole("button", { name: "Convert image", exact: true }).click();
  await page.getByRole("button", { name: "Remove image", exact: true }).click();
  await page.locator("html[data-encoding-settled=true]").waitFor();
  await expect(page.getByAltText("Converted image", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Download WebP/ })).toHaveCount(0);
});

test("Flappy result does not trap search, and route exit removes the canvas", async ({ page }) => {
  await visit(page, "/games/flappy-bird");
  await page.getByRole("button", { name: "Play now", exact: true }).click();
  await page.getByRole("button", { name: "Search tools and games", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search tools and games" });
  const input = dialog.getByRole("combobox");
  await input.pressSequentially("wasd json");
  await expect(input).toHaveValue("wasd json");
  // The open dialog correctly makes background headings inert to accessibility queries.
  await expect(page.locator("h2").filter({ hasText: /^Flight over$/ })).toBeVisible({
    timeout: 15000,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("link", { name: "Tools", exact: true }).first().click();
  await expect(page.locator("canvas")).toHaveCount(0);
});
