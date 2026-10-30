import { dateOnly, dayMs } from "../dateMath";
export function calculateAge(birthText: string, asOfText: string) {
  const birth = dateOnly(birthText);
  const end = dateOnly(asOfText);
  if (birth.compare(end) > 0)
    throw new Error("Birth date must be on or before the reference date.");
  let years = end.year - birth.year;
  if (birth.add({ years }).compare(end) > 0) years--;
  let months = (end.year - birth.add({ years }).year) * 12 + end.month - birth.month;
  if (birth.add({ years, months }).compare(end) > 0) months--;
  const days =
    (end.toDate("UTC").getTime() - birth.add({ years, months }).toDate("UTC").getTime()) / dayMs;
  let next = birth.set({ year: end.year });
  if (next.compare(end) < 0) next = birth.set({ year: end.year + 1 });
  return {
    years,
    months,
    days,
    totalDays: (end.toDate("UTC").getTime() - birth.toDate("UTC").getTime()) / dayMs,
    next: next.toString(),
    until: (next.toDate("UTC").getTime() - end.toDate("UTC").getTime()) / dayMs,
  };
}
