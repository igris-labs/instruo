import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test("certificate inspection exposes real subject and validity fields", async ({ page }) => {
  await import("reflect-metadata");
  const { X509CertificateGenerator } = await import("@peculiar/x509");
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  const certificate = await X509CertificateGenerator.createSelfSigned({
    name: "CN=Local Fixture",
    keys,
    signingAlgorithm: { name: "ECDSA", hash: "SHA-256" },
    notBefore: new Date("2020-01-01T00:00:00Z"),
    notAfter: new Date("2021-01-01T00:00:00Z"),
  });
  await visit(page, "/tools/pem-inspector");
  await page.getByLabel("PEM document", { exact: true }).fill(certificate.toString("pem"));
  await page.getByRole("button", { name: "Inspect PEM", exact: true }).click();
  await expect(page.getByLabel("Inspection result", { exact: true })).toHaveValue(/Local Fixture/);
  await expect(page.getByLabel("Inspection result", { exact: true })).toHaveValue(
    /2021-01-01T00:00:00.000Z/,
  );
  await page.getByLabel("PEM document", { exact: true }).fill("invalid");
  await expect(page.getByLabel("Inspection result", { exact: true })).toHaveValue("");
});

test("loan schedules export every month, not just the visible page", async ({ page }) => {
  await visit(page, "/tools/loan-calculator");
  await page.getByLabel("Loan amount", { exact: true }).fill("1200");
  await page.getByLabel("Annual rate (%)", { exact: true }).fill("0");
  await page.getByLabel("Term (months)", { exact: true }).fill("24");
  await page.getByLabel("Term (months)", { exact: true }).press("Tab");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download schedule CSV", exact: true }).click();
  const download = await pending;
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv.trim().split("\n")).toHaveLength(25);
  expect(csv).toContain("24,");
});

test("age calculator exposes invalid ranges and recovers", async ({ page }) => {
  await visit(page, "/tools/age-calculator");
  await page.getByLabel("Birth date", { exact: true }).fill("2000-02-29");
  await page.getByLabel("As of", { exact: true }).fill("2025-02-28");
  await expect(page.getByLabel("Age result")).toContainText("25 years, 0 months");
  await page.getByLabel("As of", { exact: true }).fill("1999-01-01");
  await expect(page.getByRole("button", { name: "Copy age", exact: true })).toBeDisabled();
  await page.getByLabel("As of", { exact: true }).fill("2026-02-28");
  await expect(page.getByLabel("Age result")).toContainText("26 years");
});

test("query import preserves duplicate keys, empty values and URL fragments", async ({ page }) => {
  await visit(page, "/tools/query-builder");
  await page
    .getByLabel("Base URL (optional)", { exact: true })
    .fill("https://example.com/?tag=one&tag=two&empty=#part");
  await page.getByRole("button", { name: "Import query from URL", exact: true }).click();
  await expect(page.getByLabel("Key 2", { exact: true })).toHaveValue("tag");
  await expect(page.getByLabel("Generated query", { exact: true })).toHaveValue(
    "https://example.com/?tag=one&tag=two&empty=#part",
  );
});

test("screenshot exports contain solid redaction but no selection-guide border", async ({
  page,
}) => {
  await visit(page, "/tools/screenshot-redactor");
  await page.getByLabel("Image", { exact: true }).setInputFiles({
    name: "red.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="red"/></svg>',
    ),
  });
  const canvas = page.getByRole("application");
  await expect(page.getByRole("button", { name: "Download PNG", exact: true })).toBeEnabled();
  const rect = (await canvas.boundingBox())!;
  await page.mouse.move(rect.x + 30, rect.y + 30);
  await page.mouse.down();
  await page.mouse.move(rect.x + 100, rect.y + 100);
  await page.mouse.up();
  await expect(page.getByRole("button", { name: "Delete selected", exact: true })).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const buffer = await readFile((await (await pending).path())!);
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const c = document.createElement("canvas");
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    return {
      inside: [...ctx.getImageData(60, 60, 1, 1).data],
      outside: [...ctx.getImageData(20, 20, 1, 1).data],
      edge: [...ctx.getImageData(30, 60, 1, 1).data],
    };
  }, buffer.toString("base64"));
  expect(pixels.inside.slice(0, 3).every((v) => v < 40)).toBe(true);
  expect(pixels.outside).toEqual([255, 0, 0, 255]);
  expect(pixels.edge.slice(0, 3).every((v) => v < 40)).toBe(true);
});

test("SVG optimization preserves viewBox and useful IDs", async ({ page }) => {
  await visit(page, "/tools/svg-optimizer");
  await page
    .getByLabel("SVG input", { exact: true })
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><desc>Accessible square</desc><rect id="shape" width="20" height="20"/></svg>',
    );
  await expect(page.getByLabel("Optimized SVG", { exact: true })).toHaveValue(
    /viewBox="0 0 24 24"/,
  );
  await expect(page.getByLabel("Optimized SVG", { exact: true })).toHaveValue(/Accessible square/);
});

test("Mermaid renders a real sequence diagram and recovers after invalid source", async ({
  page,
}) => {
  await visit(page, "/tools/mermaid-editor");
  await expect(
    page.getByLabel("Diagram preview").locator("svg .nodes text").filter({ hasText: "Start" }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: "Render diagram", exact: true })).toBeEnabled({
    timeout: 30000,
  });
  await page
    .getByLabel("Mermaid source", { exact: true })
    .fill("sequenceDiagram\nAlice->>Bob: Hello");
  await page.getByRole("button", { name: "Render diagram", exact: true }).click();
  await expect(page.getByLabel("Diagram preview").locator("svg")).toBeVisible();
  await expect(page.getByLabel("Diagram preview")).toContainText("Alice");
  await page.getByLabel("Mermaid source", { exact: true }).fill("not a diagram");
  await page.getByRole("button", { name: "Render diagram", exact: true }).click();
  await expect(page.getByText("Could not render preview", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download SVG", exact: true })).toBeDisabled();
});

test("Markdown uses GFM tables and strips executable and remote-resource content", async ({
  page,
}) => {
  await visit(page, "/tools/markdown-preview");
  await page
    .getByLabel("Markdown", { exact: true })
    .fill(
      '# Title\n\n| A | B |\n|---|---|\n|1|2|\n\n<img src="https://example.com/track" onerror="alert(1)"><script>alert(1)<' +
        "/script>",
    );
  const preview = page.getByLabel("Markdown preview", { exact: true });
  await expect(preview.locator("table")).toBeVisible();
  await expect(preview.locator("h1")).toHaveText("Title");
  await expect(preview.locator("img,script,iframe")).toHaveCount(0);
});

test("pathological regular expressions are stopped off the main thread", async ({ page }) => {
  await visit(page, "/tools/regex-tester");
  await page.getByLabel("Pattern", { exact: true }).fill("^(a+)+$");
  await page.getByLabel("Test text", { exact: true }).fill(`${"a".repeat(40)}!`);
  await expect(page.getByText(/Pattern took too long/)).toBeVisible({ timeout: 10000 });
  await page.getByLabel("Pattern", { exact: true }).fill("a+");
  await expect(page.getByText(/Pattern took too long/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy matches", exact: true })).toBeEnabled();
});

test("SRI hashes the exact bytes of a local file and invalidates stale output", async ({
  page,
}) => {
  await visit(page, "/tools/sri-generator");
  await page.getByLabel("Input source", { exact: true }).click();
  await page.getByRole("option", { name: /file/i }).click();
  const bytes = Buffer.from([0, 255, 128, 10, 13, 42]);
  await page
    .getByLabel("Resource file", { exact: true })
    .setInputFiles({ name: "fixture.bin", mimeType: "application/octet-stream", buffer: bytes });
  await page.getByRole("button", { name: "Generate hash", exact: true }).click();
  await expect(page.getByLabel("integrity value", { exact: true })).toHaveValue(
    `sha384-${createHash("sha384").update(bytes).digest("base64")}`,
  );
  await page.getByLabel("Algorithm", { exact: true }).click();
  await page.getByRole("option", { name: "SHA-256", exact: true }).click();
  await expect(page.getByLabel("integrity value", { exact: true })).toHaveValue("");
});

test("EXIF clean export is a PNG with a matching extension", async ({ page }) => {
  await visit(page, "/tools/exif-viewer");
  await page.getByLabel("Choose a photo", { exact: true }).setInputFiles({
    name: "photo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40"><rect width="60" height="40" fill="red"/></svg>',
    ),
  });
  await expect(page.getByRole("button", { name: "Download clean PNG", exact: true })).toBeEnabled();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download clean PNG", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe("clean-photo.png");
});

test("script names cannot silently overwrite each other", async ({ page }) => {
  await visit(page, "/tools/package-json-scripts");
  await page.getByLabel("Script 2 name", { exact: true }).fill("dev");
  await expect(page.getByText("Script names must be unique.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy JSON", exact: true })).toBeDisabled();
  await page.getByLabel("Script 2 name", { exact: true }).fill("build");
  await expect(page.getByRole("button", { name: "Copy JSON", exact: true })).toBeEnabled();
});

test("random-picker edits reset the no-repeat draw instead of using old choices", async ({
  page,
}) => {
  await visit(page, "/tools/random-picker");
  await page.getByLabel("Choices", { exact: true }).fill("Only choice");
  await page.getByRole("button", { name: "Pick one", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pick one", exact: true })).toBeDisabled();
  await page.getByLabel("Choices", { exact: true }).fill("New choice");
  await page.getByRole("button", { name: "Pick one", exact: true }).click();
  await expect(page.getByText("New choice", { exact: true }).first()).toBeVisible();
});

test("SSH rejects malformed wire data rather than hashing an arbitrary string", async ({
  page,
}) => {
  await visit(page, "/tools/ssh-fingerprint");
  await page.getByLabel("OpenSSH public key", { exact: true }).fill("ssh-ed25519 AAAA");
  await page.getByRole("button", { name: /Calculate fingerprint/ }).click();
  await expect(page.getByRole("button", { name: /Copy fingerprint/ })).toBeDisabled();
});
