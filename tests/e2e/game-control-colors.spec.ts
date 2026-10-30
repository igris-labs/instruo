import { expect, test } from "@playwright/test";
import { resources } from "../helpers/catalogue";
import { visit } from "./helpers";

const games = resources.filter((item) => item.kind === "game");

async function primaryColorMismatches(workspace: import("@playwright/test").Locator) {
  return workspace.locator('button[data-slot="button"]').evaluateAll((elements) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const rgb = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).join(",");
    };
    return elements.flatMap((element) => {
      const button = element as HTMLButtonElement;
      if (
        button.disabled ||
        button.getAttribute("aria-disabled") === "true" ||
        !button.getClientRects().length ||
        !button.classList.contains("bg-(--button-color)") ||
        !button.className.includes("--button-color:var(--primary)")
      )
        return [];
      const probe = document.createElement("span");
      probe.style.setProperty("color", "var(--button-foreground)", "important");
      probe.hidden = true;
      button.append(probe);
      const expected = rgb(getComputedStyle(probe).color);
      probe.remove();
      const nodes = [button, ...button.querySelectorAll("span")].filter(
        (node) =>
          node === button ||
          [...node.childNodes].some(
            (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
          ),
      );
      return nodes.flatMap((node) =>
        rgb(getComputedStyle(node).color) === expected
          ? []
          : [
              {
                label: button.textContent?.trim() || button.getAttribute("aria-label"),
                actual: getComputedStyle(node).color,
                expected,
              },
            ],
      );
    });
  });
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} game controls`, () => {
    test.use({ colorScheme: theme });
    for (const game of games) {
      test(`${game.id} retains IPEX foregrounds before and after starting`, async ({ page }) => {
        await visit(page, game.proposedRoute);
        const workspace = page.locator("#workspace");
        await expect(workspace.locator("section").first()).toBeVisible();
        if (game.renderer === "phaser") await expect(workspace.locator("canvas")).toBeVisible();
        const loading = workspace.getByRole("progressbar", { name: "Loading game", exact: true });
        if (await loading.count()) await expect(loading).not.toBeVisible();
        const start = workspace
          .getByRole("button", {
            name: /^(Start (?:game|chase|field|sequence|match|circuit|puzzle)|Play now|Enter the|Deal)/i,
          })
          .first();
        if (await start.count()) await expect(start).toBeEnabled();
        expect(await primaryColorMismatches(workspace)).toEqual([]);
        if (await start.isVisible()) {
          await start.click();
          expect(await primaryColorMismatches(workspace)).toEqual([]);
        }
        await expect(workspace.locator('[class*="text-foreground-inverted"]')).toHaveCount(0);
      });
    }
    test("Maze Chase start, sound and stage controls are clear and operable", async ({ page }) => {
      await visit(page, "/games/maze-chase");
      const start = page.getByRole("button", { name: "Start chase", exact: true });
      await expect(start).toBeVisible();
      await start.hover();
      expect(await primaryColorMismatches(page.locator("#workspace"))).toEqual([]);
      await start.focus();
      await expect(start).toBeFocused();
      const sound = page.getByRole("button", { name: "Mute sound", exact: true });
      await expect(sound).toHaveClass(/bg-transparent/);
      await sound.click();
      await expect(
        page.getByRole("button", { name: "Turn sound on", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await start.click();
      await expect(start).not.toBeVisible();
      const fullscreen = page.getByRole("button", { name: "Enter fullscreen", exact: true });
      await expect(fullscreen).toHaveClass(/bg-card/);
      await expect(fullscreen).toBeVisible();
    });
    test("secondary controls inside dark artwork use dark-surface tokens", async ({ page }) => {
      await visit(page, "/games/mastermind");
      await page.getByRole("button", { name: "Start game", exact: true }).click();
      const reset = page.getByRole("button", { name: "New code", exact: true });
      const color = await reset.evaluate((element) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!;
        context.fillStyle = getComputedStyle(element).color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        return { rgb: [r!, g!, b!], scheme: getComputedStyle(element).colorScheme };
      });
      expect(color.scheme).toBe("dark");
      expect(Math.min(...color.rgb)).toBeGreaterThanOrEqual(140);
      await expect(page.locator("[data-game-surface=dark]")).toHaveClass(/dark/);
      await expect(reset).toBeEnabled();
    });
  });
}
