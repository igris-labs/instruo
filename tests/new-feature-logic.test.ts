import { describe, expect, it } from "vitest";
import { applyMove, makePuzzle, solveBoard } from "../app/features/games/lights-out/logic";
import { transformJson } from "../app/features/tools/json/logic";

describe("jSON engine", () => {
  it.each([
    '{"hello":"नमस्ते 🔒","items":[1,null,false]}',
    "[1,2,3]",
    "0",
    "false",
    "null",
    '"text"',
  ])("preserves parsed values in both modes: %s", (input) => {
    for (const mode of ["format", "minify"] as const) {
      const result = transformJson(input, mode);
      expect(result.error).toBe("");
      expect(JSON.parse(result.output)).toEqual(JSON.parse(input));
    }
  });
  it("has deliberate empty and invalid states", () => {
    expect(transformJson("  ")).toEqual({ output: "", error: "" });
    expect(transformJson("{broken").error).not.toBe("");
    expect(transformJson("{broken").output).toBe("");
  });
});

describe("lights Out engine", () => {
  it.each([5, 6, 7] as const)("generates deterministic solvable puzzles for size %i", (size) => {
    for (const seed of [0, 1, 42, 20261028]) {
      const board = makePuzzle(size, seed);
      expect(board).toEqual(makePuzzle(size, seed));
      for (const index of solveBoard(board, size)) applyMove(board, index, size);
      expect(board.every((light) => !light)).toBe(true);
    }
  });
});
