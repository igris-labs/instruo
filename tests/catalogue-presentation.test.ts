import { describe, expect, it } from "vitest";
import {
  categoryPresentation,
  directoryPage,
  directoryPageSize,
  quickStartSlugs,
} from "../app/features/catalogue/presentation";

describe("catalogue presentation", () => {
  it("bounds the page to actual available results", () => {
    expect(directoryPageSize).toBe(12);
    expect(directoryPage("2", 101)).toBe(2);
    expect(directoryPage("999", 101)).toBe(9);
    expect(directoryPage("2", 0)).toBe(1);
    expect(directoryPage(2, 12)).toBe(1);
    expect(directoryPage(2, 13)).toBe(2);
  });
  it("rejects invalid pages instead of slicing from a negative or fractional offset", () => {
    for (const input of [
      undefined,
      null,
      [],
      "-1",
      "NaN",
      "2.5",
      "Infinity",
      0,
      Number.MAX_VALUE,
    ]) {
      expect(directoryPage(input, 101)).toBe(1);
    }
  });
  it("provides stable task labels and unique curated entry points without duplicating metadata", () => {
    expect(Object.keys(categoryPresentation)).toHaveLength(7);
    expect(categoryPresentation.Image?.label).toBe("Images & design");
    expect(new Set(quickStartSlugs).size).toBe(quickStartSlugs.length);
  });
});
