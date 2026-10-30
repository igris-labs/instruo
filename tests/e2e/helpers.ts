import type { Page } from "@playwright/test";
export async function visit(page: Page, path: string) {
  await page.goto(path);
  await page.locator("html[data-instruo-ready=true]").waitFor();
}
