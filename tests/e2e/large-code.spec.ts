import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const theme of ["light", "dark"] as const) {
  for (const surface of ["editor", "block"] as const) {
    test(`${surface} keeps syntax colors while scrolling in ${theme} mode without worker round trips`, async ({
      page,
    }) => {
      await page.addInitScript((mode) => {
        localStorage.setItem("nuxt-color-mode", mode);
        const NativeWorker = window.Worker;
        window.Worker = class extends NativeWorker {
          postMessage(message: unknown) {
            // A busy worker must not interrupt an already-highlighted document during scrolling.
            if ((message as { type?: string }).type === "viewport") return;
            super.postMessage(message);
          }
        };
      }, theme);
      const data = Object.fromEntries(
        Array.from({ length: 300 }, (_, index) => [`line${index}`, `value-${index}`]),
      );
      if (surface === "editor") {
        await visit(page, "/tools/json-formatter");
        await page
          .getByRole("textbox", { name: "JSON input", exact: true })
          .fill(JSON.stringify(data, null, 2));
      } else {
        await visit(page, "/tools/openapi-viewer");
        await page
          .getByRole("textbox")
          .first()
          .fill(
            JSON.stringify({
              openapi: "3.0.3",
              info: { title: "Scroll check", version: "1", contact: data },
              paths: {},
            }),
          );
        await page.getByRole("button", { name: "Inspect document", exact: true }).click();
      }
      const code = page
        .locator(surface === "editor" ? "[data-code-editor]" : "[data-code-block]")
        .first();
      await expect(code).toHaveAttribute("data-highlight-state", "ready");
      const frames = await code.evaluate(async (root) => {
        const input = root.querySelector("textarea")!;
        const observed: string[] = [];
        const visible: string[] = [];
        const observer = new MutationObserver(() =>
          observed.push(root.getAttribute("data-highlight-state")!),
        );
        observer.observe(root, { attributes: true, attributeFilter: ["data-highlight-state"] });
        for (const fraction of [0.2, 0.7, 1, 0.4, 0]) {
          input.scrollTop = fraction * (input.scrollHeight - input.clientHeight);
          input.scrollLeft = fraction * 20;
          input.dispatchEvent(new Event("scroll"));
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          observed.push(root.getAttribute("data-highlight-state")!);
          visible.push(root.querySelector("pre")?.textContent ?? "");
        }
        observer.disconnect();
        return { observed, visible };
      });
      expect(frames.observed.every((state) => state === "ready")).toBe(true);
      expect(frames.visible[2]).toContain("value-299");
      expect(frames.visible[4]).toContain("value-0");
      expect(Number(await code.getAttribute("data-rendered-lines"))).toBeLessThan(100);
    });
  }
}

test("18k-line JSON stays highlighted with bounded DOM, folding and complete export", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const source = JSON.stringify(
    Array.from({ length: 4500 }, (_, id) => ({ id, label: `item-${id}` })),
    null,
    2,
  );
  await visit(page, "/tools/json-formatter");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate((value) => navigator.clipboard.writeText(value), source);
  await page.getByRole("textbox", { name: "JSON input", exact: true }).focus();
  await page.keyboard.press("ControlOrMeta+V");
  // The app remains interactive while the workers tokenize both source and output.
  await page.getByRole("button", { name: "Search tools and games", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search tools and games" });
  await dialog.getByRole("combobox").fill("json");
  await expect(dialog.getByRole("combobox")).toHaveValue("json");
  await page.keyboard.press("Escape");
  const output = page.getByRole("textbox", { name: "JSON output", exact: true });
  const editor = page.locator("[data-code-editor]").filter({ has: output });
  await expect(editor).toHaveAttribute("data-highlight-state", "ready", { timeout: 30_000 });
  await expect(editor).toHaveAttribute("data-total-lines", "18002");
  expect(Number(await editor.getAttribute("data-rendered-lines"))).toBeLessThan(100);
  expect(await editor.locator(".syntax-token").count()).toBeLessThan(1000);
  expect(await editor.locator("[data-line-number]").count()).toBeLessThan(100);
  await output.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(editor.locator("pre")).toContainText("item-4499", { timeout: 10_000 });
  await expect(editor).toHaveAttribute("data-highlight-state", "ready");
  await expect(editor.locator("[data-line-number]").last()).toHaveText("18002");
  expect(
    await editor
      .locator("[data-line-number]")
      .last()
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(Number(await editor.getAttribute("data-rendered-lines"))).toBeLessThan(100);
  await editor.getByRole("button", { name: "Collapse all", exact: true }).click();
  await expect(output).toHaveValue("[ … ]");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const stream = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(source);
  await editor.getByRole("button", { name: "Expand all", exact: true }).click();
  await expect(output).toHaveValue(source);
  await expect(editor).toHaveAttribute("data-highlight-state", "ready");
});

test("new edits win over in-flight work and leaving the route terminates workers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const stats = { active: 0, started: 0 };
    (window as unknown as { workerStats: typeof stats }).workerStats = stats;
    window.Worker = class extends NativeWorker {
      ended = false;
      tracked: boolean;
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        this.tracked = String(url).includes("highlight.worker");
        if (this.tracked) {
          stats.active++;
          stats.started++;
        }
      }
      terminate() {
        if (this.tracked && !this.ended) {
          stats.active--;
          this.ended = true;
        }
        super.terminate();
      }
    };
  });
  await visit(page, "/tools/json-formatter");
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(
    (value) => navigator.clipboard.writeText(value),
    JSON.stringify(
      Array.from({ length: 18000 }, (_, index) => `obsolete-${index}`),
      null,
      2,
    ),
  );
  await input.focus();
  await page.keyboard.press("ControlOrMeta+V");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { workerStats: { started: number } }).workerStats.started,
      ),
    )
    .toBeGreaterThan(0);
  await input.fill('{"latest":true}');
  const editor = page.locator("[data-code-editor]").last();
  await expect(editor).toHaveAttribute("data-highlight-state", "ready", { timeout: 20_000 });
  await expect(editor.locator("pre")).toContainText("latest");
  await expect(editor.locator("pre")).not.toContainText("obsolete");
  await page.getByRole("link", { name: "Tools", exact: true }).first().click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { workerStats: { active: number } }).workerStats.active,
      ),
    )
    .toBe(0);
});

test("worker failure retains readable, editable text and full output", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        if (String(url).includes("highlight.worker")) throw new Error("Worker disabled for test");
        super(url, options);
      }
    };
  });
  await visit(page, "/tools/json-formatter");
  const input = page.getByRole("textbox", { name: "JSON input", exact: true });
  await input.fill('{"available":true}');
  await expect(page.locator("[data-code-editor]").first()).toHaveAttribute(
    "data-highlight-state",
    "error",
  );
  await expect(input).not.toHaveClass(/text-transparent/);
  await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue(
    JSON.stringify({ available: true }, null, 2),
  );
  await input.fill("false");
  await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue(
    "false",
  );
});
