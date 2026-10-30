import { describe, expect, it } from "vitest";
import { convertUnit } from "../app/features/tools/everyday/unit-converter/useUnitConverter";
import { featureFunctions } from "./helpers/feature-functions";

describe("migrated Mastermind scoring", () => {
  const score = (secret: string[], guess: string[]) => {
    const rules = featureFunctions<{
      scoreGuess: (value: string[]) => { exact: number; close: number };
    }>("app/features/games/logic/mastermind/Mastermind.vue", ["scoreGuess"], {
      code: { value: secret },
    });
    return rules.scoreGuess(guess);
  };

  it.each([
    [["sun", "violet", "coral", "ruby"], ["ruby", "ocean", "jade", "sun"], 0, 2],
    [["sun", "violet", "coral", "ruby"], ["ocean", "violet", "coral", "ruby"], 3, 0],
    [["sun", "violet", "coral", "ruby"], ["ocean", "violet", "coral", "coral"], 2, 0],
    [["ruby", "ruby", "jade", "sun"], ["ruby", "jade", "ruby", "ruby"], 1, 2],
    [["ruby", "ocean", "jade", "sun"], ["ruby", "ruby", "ruby", "ruby"], 1, 0],
    [["ruby", "ruby", "ruby", "ruby"], ["ruby", "ruby", "ruby", "ruby"], 4, 0],
  ] as const)(
    "counts exact/close without positional feedback or double-counting: %j / %j",
    (secret, guess, exact, close) => {
      expect(score([...secret], [...guess])).toEqual({ exact, close });
    },
  );
});

describe("migrated Nim decisions", () => {
  it.each([
    [3, 4, 5],
    [1, 2, 3],
    [0, 0, 2],
    [7, 4, 1],
  ])("chooses a legal move for %j", (...values) => {
    const rules = featureFunctions<{
      optimalComputerMove: () => { amount: number; pile: number };
    }>("app/features/games/logic/nim/Nim.vue", ["optimalComputerMove"], {
      piles: { value: values },
    });
    const move = rules.optimalComputerMove();
    expect(move.amount).toBeGreaterThan(0);
    expect(move.amount).toBeLessThanOrEqual(values[move.pile]!);
    if (values.reduce((sum, value) => sum ^ value, 0) !== 0) {
      values[move.pile]! -= move.amount;
      expect(values.reduce((sum, value) => sum ^ value, 0)).toBe(0);
    }
  });

  it("alternates turns and lets the actual last mover win", () => {
    const bindings = {
      phase: { value: "playing" },
      piles: { value: [1, 1, 0] },
      turn: { value: 1 },
      winner: { value: null },
      moves: { value: [] },
      mode: { value: "local" },
      clearComputerTimer() {},
    };
    const rules = featureFunctions<{
      applyMove: (pile: number, amount: number, player: number) => void;
    }>("app/features/games/logic/nim/Nim.vue", ["applyMove"], bindings);
    rules.applyMove(0, 1, 1);
    expect(bindings.turn.value).toBe(2);
    rules.applyMove(1, 1, 2);
    expect(bindings.winner.value).toBe(2);
    expect(bindings.phase.value).toBe("complete");
    rules.applyMove(0, 1, 1);
    expect(bindings.moves.value).toHaveLength(2);
  });
});

describe("migrated unit conversion", () => {
  it("preserves decimals", () => {
    expect(convertUnit(2.5, "meter", "foot", "length")).toBeCloseTo(8.2020997375);
  });

  it("converts freezing point and absolute zero without treating zero as missing", () => {
    expect(convertUnit(32, "fahrenheit", "celsius", "temperature")).toBe(0);
    expect(convertUnit(0, "celsius", "fahrenheit", "temperature")).toBe(32);
    expect(convertUnit(0, "kelvin", "celsius", "temperature")).toBeCloseTo(-273.15);
  });
});
