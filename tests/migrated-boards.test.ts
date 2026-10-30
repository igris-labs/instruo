import { describe, expect, it } from "vitest";
import { featureFunctions } from "./helpers/feature-functions";

describe("migrated Wordle repeated-letter rules", () => {
  it.each([
    ["APPLE", "ALLEY", ["correct", "present", "absent", "present", "absent"]],
    ["APPLE", "PUPPY", ["present", "absent", "correct", "absent", "absent"]],
    ["LEVEL", "LEVEL", ["correct", "correct", "correct", "correct", "correct"]],
  ])("scores %s against %s without reusing letters", (answer, guess, expected) => {
    const rules = featureFunctions<{ evaluateGuess: (guess: string) => string[] }>(
      "app/features/games/word/wordle/Wordle.vue",
      ["evaluateGuess"],
      { target: { value: answer }, wordLength: 5 },
    );
    expect([...rules.evaluateGuess(guess as string)]).toEqual(expected);
  });
});

interface Cell {
  adjacent: number;
  flagged: boolean;
  mine: boolean;
  open: boolean;
}
interface Field {
  columns: number;
  rows: number;
  mines: number;
}
function minefield(settings: Field) {
  const cells = { value: [] as Cell[] };
  const state = {
    settings: { value: settings },
    cells,
    minesPlaced: { value: false },
    phase: { value: "playing" },
    blastIndex: { value: null as number | null },
    flags: {
      get value() {
        return cells.value.filter((cell) => cell.flagged).length;
      },
    },
    pause() {},
    resume() {},
    markPulse() {},
  };
  const rules = featureFunctions<{
    createEmptyBoard: (option: Field) => Cell[];
    getNeighbors: (index: number, option?: Field) => number[];
    placeMines: (index: number) => void;
    reveal: (index: number) => void;
    toggleFlag: (index: number) => void;
  }>(
    "app/features/games/logic/minesweeper/Minesweeper.vue",
    ["createEmptyBoard", "getNeighbors", "placeMines", "reveal", "toggleFlag"],
    state,
  );
  state.cells.value = rules.createEmptyBoard(settings);
  return { state, ...rules };
}

describe("migrated Minesweeper rules", () => {
  it.each([
    { columns: 9, rows: 9, mines: 10 },
    { columns: 16, rows: 16, mines: 40 },
    { columns: 30, rows: 16, mines: 99 },
  ])("keeps first click and neighbors safe in %j", (settings) => {
    const rules = minefield(settings);
    const first = settings.columns + 1;
    rules.reveal(first);
    expect(rules.state.cells.value).toHaveLength(settings.rows * settings.columns);
    expect(rules.state.cells.value.filter((cell) => cell.mine)).toHaveLength(settings.mines);
    for (const index of [first, ...rules.getNeighbors(first)]) {
      expect(rules.state.cells.value[index]!.mine).toBe(false);
    }
    for (const [index, cell] of rules.state.cells.value.entries()) {
      expect(cell.adjacent).toBe(
        rules.getNeighbors(index).filter((neighbor) => rules.state.cells.value[neighbor]!.mine)
          .length,
      );
    }
  });

  it("does not reveal a flagged cell or place mines until a reveal", () => {
    const rules = minefield({ columns: 9, rows: 9, mines: 10 });
    rules.toggleFlag(0);
    rules.reveal(0);
    expect(rules.state.minesPlaced.value).toBe(false);
    expect(rules.state.cells.value[0]!.open).toBe(false);
  });

  it("reveals all mines after a loss", () => {
    const rules = minefield({ columns: 9, rows: 9, mines: 10 });
    rules.reveal(0);
    const mine = rules.state.cells.value.findIndex((cell) => cell.mine);
    rules.reveal(mine);
    expect(rules.state.phase.value).toBe("lost");
    expect(rules.state.blastIndex.value).toBe(mine);
    expect(rules.state.cells.value.filter((cell) => cell.mine).every((cell) => cell.open)).toBe(
      true,
    );
  });

  it("recognizes a fully revealed safe field as won", () => {
    const rules = minefield({ columns: 9, rows: 9, mines: 10 });
    rules.reveal(0);
    for (const [index, cell] of rules.state.cells.value.entries()) {
      if (!cell.mine) rules.reveal(index);
    }
    expect(rules.state.phase.value).toBe("won");
  });
});

interface Card {
  faceUp: boolean;
  value: number;
  color: string;
  suit: string;
}
describe("migrated Solitaire placement rules", () => {
  const tableau = { value: [[]] as Card[][] };
  const foundations = { value: { hearts: [] as Card[] } };
  const rules = featureFunctions<{
    canTableau: (cards: Card[], column: number) => boolean;
    canFoundation: (card: Card, suit: string) => boolean;
  }>("app/features/games/strategy/solitaire/Solitaire.vue", ["canTableau", "canFoundation"], {
    tableau,
    foundations,
  });
  const card = (value: number, color = "red", faceUp = true): Card => ({
    value,
    color,
    faceUp,
    suit: "hearts",
  });

  it("only allows visible kings on an empty tableau", () => {
    tableau.value = [[]];
    expect(rules.canTableau([card(13)], 0)).toBe(true);
    expect(rules.canTableau([card(12)], 0)).toBe(false);
    expect(rules.canTableau([card(13, "red", false)], 0)).toBe(false);
  });

  it("requires descending alternating colors", () => {
    tableau.value = [[card(7, "black")]];
    expect(rules.canTableau([card(6)], 0)).toBe(true);
    expect(rules.canTableau([card(6, "black")], 0)).toBe(false);
    expect(rules.canTableau([card(5)], 0)).toBe(false);
  });

  it("builds foundations from ace upward in suit", () => {
    foundations.value.hearts = [];
    expect(rules.canFoundation(card(1), "hearts")).toBe(true);
    expect(rules.canFoundation(card(2), "hearts")).toBe(false);
    foundations.value.hearts = [card(1)];
    expect(rules.canFoundation(card(2), "hearts")).toBe(true);
    expect(rules.canFoundation({ ...card(2), suit: "clubs" }, "hearts")).toBe(false);
  });
});

describe("migrated Crossword topology", () => {
  interface Entry {
    number: number;
    direction: string;
    cells: number[];
    answer: string;
  }
  const rules = featureFunctions<{
    puzzleRows: string[];
    makeEntries: () => { entries: Entry[]; starts: Map<number, number> };
  }>("app/features/games/word/crossword/Crossword.vue", [
    "puzzleRows",
    "rowCount",
    "columnCount",
    "cellCount",
    "isOpen",
    "makeEntries",
  ]);

  it("has a 15×15 rotationally symmetric mask", () => {
    expect(rules.puzzleRows).toHaveLength(15);
    const cells = rules.puzzleRows.join("");
    for (const row of rules.puzzleRows) expect(row).toHaveLength(15);
    for (let index = 0; index < cells.length; index += 1) {
      expect(cells[index] === "#").toBe(cells[cells.length - 1 - index] === "#");
    }
  });

  it("covers open squares with numbered real intersecting entries", () => {
    const { entries, starts } = rules.makeEntries();
    const cells = rules.puzzleRows.join("");
    const seen = new Set(entries.flatMap((entry) => entry.cells));
    for (const entry of entries) {
      expect(entry.answer.length).toBeGreaterThanOrEqual(3);
      expect(entry.answer).toBe(entry.cells.map((index) => cells[index]).join(""));
      expect(starts.get(entry.cells[0]!)).toBe(entry.number);
    }
    expect(entries.some((entry) => entry.direction === "across")).toBe(true);
    expect(entries.some((entry) => entry.direction === "down")).toBe(true);
    for (const [index, cell] of [...cells].entries()) {
      expect(seen.has(index)).toBe(cell !== "#");
    }
    expect(new Set(starts.values()).size).toBe(starts.size);
  });
});
