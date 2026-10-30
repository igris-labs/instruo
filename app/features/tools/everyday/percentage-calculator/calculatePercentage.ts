export function calculatePercentage(value: number, percent: number, mode: string) {
  if (![value, percent].every(Number.isFinite)) throw new Error("Enter two finite numbers.");
  if ((mode === "ratio" || mode === "change") && value === 0)
    throw new Error("The starting or base value cannot be zero.");
  const result =
    mode === "ratio"
      ? (percent / value) * 100
      : mode === "change"
        ? ((percent - value) / Math.abs(value)) * 100
        : mode === "increase"
          ? value * (1 + percent / 100)
          : mode === "decrease"
            ? value * (1 - percent / 100)
            : (value * percent) / 100;
  if (!Number.isFinite(result)) throw new TypeError("Result exceeds the supported number range.");
  return result;
}
