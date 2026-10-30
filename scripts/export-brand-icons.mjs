import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("../", import.meta.url));
const browser = await chromium.launch();
try {
  for (const [source, output, size] of [
    ["favicon.svg", "favicon-32.png", 32],
    ["app-icon.svg", "apple-touch-icon.png", 180],
    ["app-icon.svg", "app-icon-512.png", 512],
  ]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      colorScheme: "light",
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(resolve(root, "public/brand", source)).href);
    await page.screenshot({ path: resolve(root, "public/brand", output) });
    await page.close();
  }
} finally {
  await browser.close();
}
