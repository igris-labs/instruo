import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

for (const [slug, input, expected] of [
  ["case-changer", "HELLO World", "hello world"],
  ["duplicate-line-remover", "one\ntwo\none", "one\ntwo"],
  ["text-reverser", "Hello 🌍", "🌍 olleH"],
  ["slug-generator", "  Café & Tea  ", "cafe-tea"],
  ["text-sorter", "pear\napple\nbanana", "apple\nbanana\npear"],
  ["whitespace-cleaner", "  Hello   world  ", "Hello world"],
]) {
  test(`${slug} updates output and clears both fields`, async ({ page }) => {
    await visit(page, `/tools/${slug}`);
    await page.getByLabel("Input", { exact: true }).fill(input!);
    const output = page.getByLabel("Output", { exact: true });
    await expect(output).toHaveValue(expected!);
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(output).toHaveValue("");
    await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
  });
}

for (const [slug, input, encoded, decoded] of [
  ["base64", "Hello 🌍", "SGVsbG8g8J+MjQ==", "Hello 🌍"],
  ["binary-text", "Hi", "01001000 01101001", "Hi"],
  ["morse-code", "SOS", "... --- ...", "SOS"],
  ["url-encode-decode", "hello & world", "hello%20%26%20world", "hello & world"],
]) {
  test(`${slug} encodes and decodes through native radio controls`, async ({ page }) => {
    await visit(page, `/tools/${slug}`);
    await page.getByLabel("Input", { exact: true }).fill(input!);
    await expect(page.getByLabel("Output", { exact: true })).toHaveValue(encoded!);
    await page.getByRole("radio", { name: "Decode", exact: true }).check();
    await page.getByLabel("Input", { exact: true }).fill(encoded!);
    await expect(page.getByLabel("Output", { exact: true })).toHaveValue(decoded!);
  });
}

test("contract generator changes targets and disables copying invalid JSON", async ({ page }) => {
  await visit(page, "/tools/type-generator");
  await page.getByLabel("Sample JSON", { exact: true }).fill('{"age":36}');
  await page.getByLabel("Target", { exact: true }).click();
  await page.getByRole("option", { name: "Valibot", exact: true }).click();
  await expect(page.getByLabel("Generated code", { exact: true })).toHaveValue(/v.number\(\)/);
  await page.getByLabel("Sample JSON", { exact: true }).fill("{broken");
  await expect(page.getByRole("button", { name: "Copy code", exact: true })).toBeDisabled();
});
