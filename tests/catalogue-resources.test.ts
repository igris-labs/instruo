import { describe, expect, it } from "vitest";
import { resources } from "./helpers/catalogue";

describe("public catalogue", () => {
  it("registers a unique route and presenter for each tool and game", () => {
    expect(resources.filter((item) => item.kind === "tool")).toHaveLength(101);
    expect(resources.filter((item) => item.kind === "game")).toHaveLength(32);
    expect(new Set(resources.map((item) => item.id)).size).toBe(resources.length);
    expect(new Set(resources.map((item) => item.proposedRoute)).size).toBe(resources.length);
    expect(resources.every((item) => item.title.trim())).toBe(true);
  });
  it("recognizes both canvas and DOM games", () => {
    expect(resources.find((item) => item.id === "game:snake")?.renderer).toBe("phaser");
    expect(resources.find((item) => item.id === "game:solitaire")?.renderer).toBe("dom");
  });
});
