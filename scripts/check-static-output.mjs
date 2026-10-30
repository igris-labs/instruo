import assert from "node:assert/strict";
import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parse } from "yaml";

const output = resolve("dist");
assert(!existsSync(resolve(output, "_worker.js")), "Static output must not require a Worker.");
assert(!existsSync(resolve(output, "_routes.json")), "Static output must not route to Functions.");
for (const route of ["", "tools", "games"]) {
  assert(existsSync(resolve(output, route, "index.html")), `Missing static page: /${route}`);
}
assert(existsSync(resolve(output, "404.html")), "Missing static 404 page.");

const payload = readFileSync(resolve(output, "_payload.json"), "utf8");
let count = 0;
for (const collection of ["tools", "games"]) {
  for (const file of globSync(`content/${collection}/**/*.md`)) {
    const source = readFileSync(file, "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
    assert(frontmatter, `Missing front matter: ${file}`);
    const { resourceId } = parse(frontmatter[1]);
    assert(payload.includes(JSON.stringify(resourceId)), `Catalogue is missing ${resourceId}`);
    const directory = resolve(output, collection, basename(file, ".md"));
    const html = readFileSync(resolve(directory, "index.html"), "utf8");
    assert(/<h1\b/.test(html), `Missing prerendered heading: ${file}`);
    assert(existsSync(resolve(directory, "_payload.json")), `Missing page payload: ${file}`);
    count++;
  }
}
console.log(
  `Static output verified: ${count} resources, directories and homepage; no Worker or D1 runtime.`,
);
