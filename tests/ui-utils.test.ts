import { describe, expect, it } from "vitest";
import { cn } from "../app/utils/ui";

describe("uI class merging", () => {
  it("keeps conditional classes and lets caller utilities override defaults", () => {
    expect(cn("px-2 text-xs", ["rounded-lg", false], { "opacity-50": true }, "px-4")).toBe(
      "text-xs rounded-lg opacity-50 px-4",
    );
  });
});
