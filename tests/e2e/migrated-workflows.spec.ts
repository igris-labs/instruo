import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("JSONPath runs a query and recovers from invalid input", async ({ page }) => {
  await visit(page, "/tools/jsonpath-tester");
  await page
    .getByLabel("JSON document", { exact: true })
    .fill('{"users":[{"name":"Ada"},{"name":"Linus"}]}');
  await page.getByLabel("JSONPath", { exact: true }).fill("$.users[*].name");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(/Ada[\s\S]*Linus/);
  await page.getByLabel("JSON document", { exact: true }).fill("{broken");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue("");
  await page.getByLabel("JSON document", { exact: true }).fill('{"users":[]}');
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue("[]");
});

test("environment formatter normalizes assignments and masks preview secrets", async ({ page }) => {
  await visit(page, "/tools/env-formatter");
  await page
    .getByLabel(".env input", { exact: true })
    .fill("APP_NAME = Instruo\nAPI_SECRET = never-display-this\n# keep this");
  const output = page.getByLabel("Formatted preview", { exact: true });
  await expect(output).toHaveValue(/APP_NAME=Instruo/);
  await expect(output).not.toHaveValue(/never-display-this/);
  await page.getByRole("checkbox", { name: "Redact secret-looking values in preview" }).uncheck();
  await expect(output).toHaveValue(/API_SECRET=never-display-this/);
});

test("unit conversion supports negative temperatures and native selects", async ({ page }) => {
  await visit(page, "/tools/unit-converter");
  await expect(page.getByText("3.2808399 foot", { exact: true })).toBeVisible();
  await page.getByLabel("Category", { exact: true }).click();
  await page.getByRole("option", { name: "Temperature", exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill("-40");
  await page.getByLabel("Amount", { exact: true }).press("Tab");
  await expect(page.getByText("-40 fahrenheit", { exact: true })).toBeVisible();
});

test("HMAC signs and verifies matching and mismatching signatures", async ({ page }) => {
  await visit(page, "/tools/hmac-generator");
  await page.getByLabel("Secret", { exact: true }).fill("test secret");
  await page.getByLabel("Message", { exact: true }).fill("test message");
  await page.getByRole("button", { name: "Generate / verify", exact: true }).click();
  const signature = page.getByLabel("Base64 signature", { exact: true });
  await expect(signature).not.toHaveValue("");
  await page.getByLabel("Expected signature", { exact: true }).fill(await signature.inputValue());
  await page.getByRole("button", { name: "Generate / verify", exact: true }).click();
  await expect(page.getByText("Signature matches.", { exact: true })).toBeVisible();
  await page.getByLabel("Expected signature", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Generate / verify", exact: true }).click();
  await expect(page.getByText("Signature does not match.", { exact: true })).toBeVisible();
});

test("AES encrypts Unicode, decrypts it and rejects a wrong password", async ({ page }) => {
  await visit(page, "/tools/aes-encryptor");
  await page.getByLabel("Password", { exact: true }).fill("correct password");
  await page.getByLabel("Input", { exact: true }).fill("Hello 🌍 नमस्ते");
  await page.getByRole("button", { name: "Encrypt", exact: true }).click();
  const output = page.getByLabel("Output", { exact: true });
  await expect(output).toHaveValue(/"data":/);
  const encrypted = await output.inputValue();
  await page.getByLabel("Input", { exact: true }).fill(encrypted);
  await page.getByRole("button", { name: "Decrypt", exact: true }).click();
  await expect(output).toHaveValue("Hello 🌍 नमस्ते");
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page.getByRole("button", { name: "Decrypt", exact: true }).click();
  await expect(output).not.toHaveValue("Hello 🌍 नमस्ते");
});

const image = {
  name: "sample.svg",
  mimeType: "image/svg+xml",
  buffer: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>',
  ),
};

test("migrated compressor exports WebP and removal cancels in-flight output", async ({ page }) => {
  await visit(page, "/tools/image-compressor");
  await page.getByLabel("Choose an image", { exact: true }).setInputFiles(image);
  await expect(page.getByAltText("Selected source", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Compress image", exact: true }).click();
  const result = page.getByAltText("Compressed result", { exact: true });
  await expect(result).toBeVisible();
  expect(
    await result.evaluate(async (element: HTMLImageElement) => ({
      mime: (await (await fetch(element.src)).blob()).type,
      width: element.naturalWidth,
      height: element.naturalHeight,
    })),
  ).toEqual({ mime: "image/webp", width: 20, height: 10 });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("compressed-image.webp");
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...options) {
      original.call(
        this,
        (blob) =>
          setTimeout(() => {
            callback(blob);
            document.documentElement.dataset.encodingSettled = "true";
          }, 350),
        ...options,
      );
    };
  });
  await page.getByRole("button", { name: "Compress image", exact: true }).click();
  await page.getByRole("button", { name: "Remove file", exact: true }).click();
  await page.locator("html[data-encoding-settled=true]").waitFor();
  await expect(result).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download", exact: true })).toBeDisabled();
});

test("Mastermind records aggregate feedback and resets attempts", async ({ page }) => {
  await visit(page, "/games/mastermind");
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  for (const color of ["Ruby", "Ocean", "Jade", "Sun"])
    await page.getByRole("button", { name: new RegExp(`^Choose ${color},`) }).click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByLabel("Attempt 1", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/^\d exact, \d close$/)).toBeVisible();
  await page.getByRole("button", { name: "New code", exact: true }).click();
  await expect(page.getByLabel("Empty attempt 1", { exact: true })).toBeVisible();
});

test("Number Guess clears submitted input and records each turn", async ({ page }) => {
  await visit(page, "/games/number-guess");
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  const input = page.getByLabel("Your guess", { exact: true });
  await input.fill("50");
  await input.press("Enter");
  await expect(page.getByLabel("Guess history", { exact: true })).toContainText("50");
  if (await input.isVisible()) await expect(input).toHaveValue("");
});
