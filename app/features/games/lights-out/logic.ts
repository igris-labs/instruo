export type BoardSize = 5 | 6 | 7;

export function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function affectedIndices(index: number, currentSize: BoardSize) {
  const row = Math.floor(index / currentSize);
  const column = index % currentSize;
  const targets = [
    [row, column],
    [row - 1, column],
    [row + 1, column],
    [row, column - 1],
    [row, column + 1],
  ];

  return targets
    .filter(
      ([targetRow, targetColumn]) =>
        targetRow !== undefined &&
        targetColumn !== undefined &&
        targetRow >= 0 &&
        targetRow < currentSize &&
        targetColumn >= 0 &&
        targetColumn < currentSize,
    )
    .map(([targetRow, targetColumn]) => targetRow! * currentSize + targetColumn!);
}

export function applyMove(state: boolean[], index: number, currentSize: BoardSize) {
  for (const targetIndex of affectedIndices(index, currentSize))
    state[targetIndex] = !state[targetIndex];
}

export function solveBoard(input: boolean[], currentSize: BoardSize) {
  let best: number[] | null = null;

  // Row chasing tries every first-row pattern and then extinguishes each lit
  // cell in the row above. This is exact for the five, six, and seven boards.
  for (let firstMask = 0; firstMask < 1 << currentSize; firstMask += 1) {
    const state = [...input];
    const solution: number[] = [];

    for (let column = 0; column < currentSize; column += 1) {
      if (firstMask & (1 << column)) {
        applyMove(state, column, currentSize);
        solution.push(column);
      }
    }

    for (let row = 1; row < currentSize; row += 1) {
      for (let column = 0; column < currentSize; column += 1) {
        const previousRowIndex = (row - 1) * currentSize + column;
        if (state[previousRowIndex]) {
          const index = row * currentSize + column;
          applyMove(state, index, currentSize);
          solution.push(index);
        }
      }
    }

    const lastRowStart = (currentSize - 1) * currentSize;
    const solved = state.slice(lastRowStart, lastRowStart + currentSize).every((cell) => !cell);
    if (solved && (!best || solution.length < best.length)) best = solution;
  }

  return best ?? [];
}

export function makePuzzle(currentSize: BoardSize, seed: number) {
  const nextBoard = Array.from<boolean>({ length: currentSize * currentSize }).fill(false);
  const random = seededRandom(seed);
  const scrambleMoves = currentSize * 3 + 3 + Math.floor(random() * currentSize * 2);

  for (let index = 0; index < scrambleMoves; index += 1) {
    applyMove(nextBoard, Math.floor(random() * nextBoard.length), currentSize);
  }

  if (nextBoard.every((cell) => !cell)) applyMove(nextBoard, 0, currentSize);
  return nextBoard;
}
