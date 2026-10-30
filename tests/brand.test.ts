import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root));
const source = read("public/brand/instruo-symbol.svg");
const paths = (svg: string) =>
  [...svg.matchAll(/<path\s[^>]*\bd="([^"]+)"/g)].map((match) => match[1]);

describe("approved Instruo branding", () => {
  it("locks the approved drawing and keeps every shipped symbol geometrically identical", () => {
    expect(createHash("sha256").update(source).digest("hex")).toBe(
      "98d8aaff1042c25a56450c3ee36b4b8511d5c538a8ef831fe75864ce1a6a4961",
    );
    const expected = paths(source.toString());
    expect(expected).toHaveLength(2);
    for (const path of [
      "public/brand/instruo-symbol.svg",
      "public/brand/favicon.svg",
      "public/brand/app-icon.svg",
      "app/components/product/BrandLogo.vue",
    ]) {
      const markup = read(path).toString();
      expect(paths(markup), path).toEqual(expected);
      expect(markup, path).toContain('opacity=".6"');
      expect(markup, path).toContain('viewBox="0 0 220 224"');
    }
  });

  it("exports correctly sized PNG icons with valid PNG headers", () => {
    for (const [file, size] of [
      ["favicon-32.png", 32],
      ["apple-touch-icon.png", 180],
      ["app-icon-512.png", 512],
    ] as const) {
      const image = read(`public/brand/${file}`);
      expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(image.readUInt32BE(16)).toBe(size);
      expect(image.readUInt32BE(20)).toBe(size);
    }
  });
});
