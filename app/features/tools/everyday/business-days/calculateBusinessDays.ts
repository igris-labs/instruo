import { dateOnly, dayMs } from "../dateMath";
export function calculateBusinessDays(
  start: string,
  end: string,
  holidays: string,
  weekends: number[],
  inclusive = true,
) {
  let first = dateOnly(start).toDate("UTC").getTime();
  let last = dateOnly(end).toDate("UTC").getTime();
  if (last < first) throw new Error("Choose an end date on or after start date.");
  if (!inclusive) {
    first += dayMs;
    last -= dayMs;
  }
  const calendar = Math.max(0, Math.round((last - first) / dayMs) + 1);
  const excluded = new Set(weekends);
  let weekend = Math.floor(calendar / 7) * excluded.size;
  for (let offset = 0; offset < calendar % 7; offset++)
    if (excluded.has(new Date(first + offset * dayMs).getUTCDay())) weekend++;
  const keys = new Set(holidays.split(/[\s,]+/).filter(Boolean));
  if (keys.size > 10_000) throw new Error("Use fewer than 10,000 holiday dates.");
  let skippedHolidays = 0;
  for (const key of keys) {
    const date = dateOnly(key).toDate("UTC");
    if (date.getTime() >= first && date.getTime() <= last && !excluded.has(date.getUTCDay()))
      skippedHolidays++;
  }
  return { calendar, weekend, skippedHolidays, working: calendar - weekend - skippedHolidays };
}
