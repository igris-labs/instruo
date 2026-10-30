import { describe, expect, it } from "vitest";
import { matchesResource } from "../app/features/catalogue/search";
const image = {
  title: "Image Format Converter",
  category: "Image",
  description: "Convert images between PNG, JPEG, and WebP.",
  tags: ["image", "converter"],
};
describe("task search", () => {
  it("recognizes common format aliases and ignores connecting words", () => {
    expect(matchesResource(image, "convert PNG to JPG")).toBe(true);
    expect(matchesResource(image, "convert JSON to PNG")).toBe(false);
  });
  it("supports category, tags, authored synonyms and punctuation", () => {
    expect(matchesResource({ ...image, aliases: ["picture conversion"] }, "picture")).toBe(true);
    expect(
      matchesResource(
        { title: ".env Formatter", description: "", category: "Developer", tags: [] },
        "ENV format",
      ),
    ).toBe(true);
  });
  it("treats an empty query as browse mode", () => {
    expect(matchesResource(image, "   ")).toBe(true);
  });
  it("recognizes the task labels shown by directory navigation", () => {
    expect(
      matchesResource(
        { title: "JSON Formatter", description: "Format JSON.", category: "Developer", tags: [] },
        "code & data",
      ),
    ).toBe(true);
    expect(matchesResource(image, "images design")).toBe(true);
  });
});
