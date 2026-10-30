import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import QRCode from "qrcode";
import { visit } from "./helpers";

test("unit conversion swaps, validates and shows additional categories", async ({ page }) => {
  await visit(page, "/tools/unit-converter");
  await expect(
    page.getByRole("region", { name: "Conversion result" }).locator("output"),
  ).toHaveText("3.2808399 foot");
  await page.getByRole("button", { name: "Swap units" }).click();
  await expect(page.locator("output")).toHaveText("0.3048 meter");
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Temperature", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Amount", exact: true }).fill("-274");
  await page.getByRole("spinbutton", { name: "Amount", exact: true }).press("Tab");
  await expect(
    page.getByText("Temperature cannot be below absolute zero.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy result" })).toBeDisabled();
  await page.getByRole("spinbutton", { name: "Amount", exact: true }).fill("0");
  await page.getByRole("spinbutton", { name: "Amount", exact: true }).press("Tab");
  await expect(page.locator("output")).toHaveText("32 fahrenheit");
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Digital storage", exact: true }).click();
  await expect(page.getByText("KB uses 1,000 bytes; KiB uses 1,024 bytes.")).toBeVisible();
});

test("tip splitting presets and rounding cover the whole bill", async ({ page }) => {
  await visit(page, "/tools/tip-splitter");
  await expect(page.locator("output")).toContainText("47.20");
  await page.getByRole("spinbutton", { name: "Bill total", exact: true }).fill("100");
  await page.getByRole("button", { name: "0%", exact: true }).click();
  await page.getByRole("spinbutton", { name: "People", exact: true }).fill("3");
  await page.getByRole("spinbutton", { name: "People", exact: true }).press("Tab");
  await expect(page.locator("output")).toContainText("33.33");
  await expect(
    page.getByText("1 person pays $33.34 to cover rounding.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Currency", exact: true }).click();
  await page.getByRole("option", { name: "JPY", exact: true }).click();
  await expect(page.locator("output")).toContainText("33");
  await expect(page.locator("output")).not.toContainText(".33");
});

test("stopwatch records laps, pauses, resumes, and exports actual splits", async ({ page }) => {
  await visit(page, "/tools/stopwatch");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("timer")).not.toHaveText("00:00.00");
  await page.getByRole("button", { name: "Lap", exact: true }).click();
  await page.getByRole("button", { name: "Lap", exact: true }).click();
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Paused" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lap", exact: true })).toBeDisabled();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = readFileSync((await (await download).path())!, "utf8");
  expect(csv.split("\n")).toHaveLength(3);
  expect(csv).toMatch(/^Lap,Split,Total\n1,/);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("00:00.00");
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("color conversion previews modern formats, invalid input, and alpha", async ({ page }) => {
  await visit(page, "/tools/color-converter");
  const input = page.getByRole("textbox", { name: "Color", exact: true });
  await input.fill("oklch(70% 0.15 160)");
  await expect(page.getByRole("button", { name: "Copy OKLCH", exact: true })).toBeEnabled();
  await expect(
    page.getByRole("img", { name: "Color preview: oklch(70% 0.15 160)", exact: true }),
  ).toBeVisible();
  await input.fill("rgb(255 0 0 / 50%)");
  await expect(page.getByText("#ff000080", { exact: true })).toBeVisible();
  await expect(page.getByText(/Alpha 50%/)).toBeVisible();
  await input.fill("not a color");
  await expect(page.getByRole("button", { name: "Copy all", exact: true })).toBeDisabled();
  await expect(page.getByText("#ff000080", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Try HEX", exact: true }).click();
  await expect(page.getByText("#f97316", { exact: true })).toBeVisible();
});

test("custom QR PNG and SVG exports decode correctly in the image scanner", async ({ page }) => {
  await visit(page, "/tools/qr-generator");
  await page.getByRole("button", { name: "Customize appearance and export", exact: true }).click();
  await page.getByRole("combobox", { name: "Module style", exact: true }).click();
  await page
    .getByRole("option", { name: "Soft rounded · square detection patterns", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Error correction", exact: true }).click();
  const high = page.getByRole("option", { name: "High · 30% recovery", exact: true });
  await expect(high).toBeVisible();
  expect(
    await high.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
      );
    }),
  ).toBe(true);
  await high.click();
  await page
    .getByRole("textbox", { name: "Website URL", exact: true })
    .fill("https://instruo.org/tools/color-converter");
  await page.getByLabel("Foreground", { exact: true }).evaluate((element) => {
    (element as HTMLInputElement).value = "#16335c";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.getByRole("button", { name: "Download PNG", exact: true })).toBeEnabled();
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const png = readFileSync((await (await pngDownload).path())!);
  expect(png.readUInt32BE(16)).toBe(512);
  const svgDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG", exact: true }).click();
  const svg = readFileSync((await (await svgDownload).path())!, "utf8");
  expect(svg).toContain("#16335c");
  expect(svg).toContain('rx="0.18"');
  await visit(page, "/tools/qr-scanner");
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "code.png", mimeType: "image/png", buffer: png });
  await expect(page.getByRole("textbox", { name: "QR result", exact: true })).toHaveValue(
    "https://instruo.org/tools/color-converter",
  );
  await expect(page.getByRole("link", { name: "Open link", exact: true })).toHaveAttribute(
    "href",
    "https://instruo.org/tools/color-converter",
  );
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "code.svg", mimeType: "image/svg+xml", buffer: Buffer.from(svg) });
  await expect(page.getByRole("textbox", { name: "QR result", exact: true })).toHaveValue(
    "https://instruo.org/tools/color-converter",
  );
});

test("QR settings errors prevent stale export and recover without a reload", async ({ page }) => {
  await visit(page, "/tools/qr-generator");
  await expect(page.getByRole("button", { name: "Download PNG", exact: true })).toBeEnabled();
  await page.getByRole("textbox", { name: "Website URL", exact: true }).fill("not a URL");
  await expect(page.getByRole("alert")).toContainText("Enter a complete URL");
  await expect(page.getByRole("button", { name: "Download PNG", exact: true })).toBeDisabled();
  await expect(page.getByRole("img", { name: "Generated QR code", exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Content type", exact: true }).click();
  await page.getByRole("option", { name: "Plain text", exact: true }).click();
  await page.getByRole("textbox", { name: "Text", exact: true }).fill("नमस्ते Instruo 🌍");
  await expect(page.getByRole("button", { name: "Download PNG", exact: true })).toBeEnabled();
});

test("QR scanner clears stale results and recovers from a blank image", async ({ page }) => {
  await visit(page, "/tools/qr-scanner");
  const blank = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 100;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 100, 100);
    return canvas.toDataURL().split(",")[1]!;
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "blank.png",
    mimeType: "image/png",
    buffer: Buffer.from(blank, "base64"),
  });
  await expect(page.getByRole("alert")).toContainText("No QR code found");
  await page.locator('input[type="file"]').setInputFiles({
    name: "real.png",
    mimeType: "image/png",
    buffer: await QRCode.toBuffer("javascript:alert(1)"),
  });
  await expect(page.getByRole("textbox", { name: "QR result", exact: true })).toHaveValue(
    "javascript:alert(1)",
  );
  await expect(page.getByRole("link", { name: "Open link", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Remove file", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "QR result", exact: true })).toHaveCount(0);
});

test("camera permission denial leaves image scanning available", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => {
        throw new DOMException("Permission denied", "NotAllowedError");
      },
    });
  });
  await visit(page, "/tools/qr-scanner");
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Camera could not start");
  await page.locator('input[type="file"]').setInputFiles({
    name: "fallback.png",
    mimeType: "image/png",
    buffer: await QRCode.toBuffer("Image scanning still works"),
  });
  await expect(page.getByRole("textbox", { name: "QR result", exact: true })).toHaveValue(
    "Image scanning still works",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("camera streams stop on request and route exit", async ({ page }) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    Object.assign(window, { scannerStreams: streams });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 100;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "white";
        context.fillRect(0, 0, 100, 100);
        const stream = canvas.captureStream(2);
        streams.push(stream);
        return stream;
      },
    });
  });
  await visit(page, "/tools/qr-scanner");
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop camera", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { scannerStreams: MediaStream[] }).scannerStreams.every((stream) =>
        stream.getTracks().every((track) => track.readyState === "ended"),
      ),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop camera", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Unit Converter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Unit Converter", level: 1, exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      (window as unknown as { scannerStreams: MediaStream[] }).scannerStreams.every((stream) =>
        stream.getTracks().every((track) => track.readyState === "ended"),
      ),
    ),
  ).toBe(true);
});

test("password feedback and HTTP methods use meaningful colors with labels", async ({ page }) => {
  await visit(page, "/tools/password-strength");
  await page.getByRole("textbox", { name: "Password", exact: true }).fill("password123");
  const progress = page.getByRole("progressbar", {
    name: "Estimated password strength",
    exact: true,
  });
  await expect(progress).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".akaza-progress-indicator")).toHaveClass(/bg-destructive/);
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("river meadow lantern orbit");
  await expect(progress).toHaveAttribute("aria-valuenow", "5");
  await expect(page.locator(".akaza-progress-indicator")).toHaveClass(/bg-success/);
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Password", exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await visit(page, "/tools/api-request-builder");
  const method = page.getByRole("combobox", { name: "Method", exact: true });
  const readColor = await method.evaluate((element) => getComputedStyle(element).color);
  await method.click();
  await page.getByRole("option", { name: "DELETE", exact: true }).click();
  await expect(method).toContainText("DELETE");
  expect(await method.evaluate((element) => getComputedStyle(element).color)).not.toBe(readColor);
  await page.getByRole("textbox", { name: "Body", exact: true }).fill('{"name":"Ada"}');
  await method.click();
  await page.getByRole("option", { name: "HEAD", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Body", exact: true })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Generated request", exact: true })).toHaveValue(
    /^curl --head /,
  );
  await expect(
    page.getByRole("textbox", { name: "Generated request", exact: true }),
  ).not.toHaveValue(/--data/);
});

for (const theme of ["light", "dark"] as const)
  for (const width of [390, 820, 1440]) {
    test(`${theme} product tools remain usable at ${width}px`, async ({ page }, info) => {
      test.setTimeout(120_000);
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of [
        "unit-converter",
        "tip-splitter",
        "stopwatch",
        "qr-generator",
        "qr-scanner",
        "color-converter",
        "password-strength",
        "api-request-builder",
        "http-status",
      ]) {
        await visit(page, `/tools/${slug}`);
        await expect(page.locator("[data-tool-layout]")).toBeVisible();
        if (slug === "qr-generator")
          await expect(
            page.getByRole("img", { name: "Generated QR code", exact: true }),
          ).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          slug,
        ).toBeLessThanOrEqual(1);
        expect(
          await page
            .locator("[data-tool-layout]")
            .evaluate((element) => element.scrollWidth - element.clientWidth),
          slug,
        ).toBeLessThanOrEqual(1);
        await expect(page.getByText("This workspace could not load", { exact: true })).toHaveCount(
          0,
        );
        await page.screenshot({ path: info.outputPath(`${slug}.png`), fullPage: true });
      }
    });
  }
