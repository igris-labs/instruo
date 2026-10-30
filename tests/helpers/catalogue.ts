import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../../", import.meta.url));
const registry = readFileSync(resolve(root, "app/features/catalogue/views.ts"), "utf8");
const views = new Map(
  [
    ...registry.matchAll(
      /"(tool:[\w-]+|game:[\w-]+)":\s*defineAsyncComponent\([\s\S]*?import\("([^"]+)"/g,
    ),
  ].map((match) => [match[1]!, match[2]!] as const),
);

function documents(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? documents(path) : entry.name.endsWith(".md") ? [path] : [];
  });
}

/** Exercise the current public catalogue, not a frozen migration inventory. */
export const resources = ["tools", "games"].flatMap((collection) =>
  documents(resolve(root, "content", collection)).map((path) => {
    const source = readFileSync(path, "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
    if (!frontmatter) throw new Error(`Missing front matter: ${path}`);
    const meta = parse(frontmatter[1]!) as { resourceId: string; title: string };
    const view = views.get(meta.resourceId);
    if (!view) throw new Error(`No registered view for ${meta.resourceId}`);
    const component = readFileSync(resolve(root, "app/features/catalogue", view), "utf8");
    return {
      id: meta.resourceId,
      kind: collection === "tools" ? "tool" : "game",
      title: meta.title,
      proposedRoute: `/${collection}/${meta.resourceId.split(":")[1]}`,
      renderer: component.includes("import GameCanvas ") ? "phaser" : "dom",
    };
  }),
);
