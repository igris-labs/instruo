import { getLocalTimeZone, parseDate, parseDateTime } from "@internationalized/date";
export const dayMs = 86_400_000;
export function dateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Use a valid YYYY-MM-DD date.");
  return parseDate(value);
}
export function dateInZone(value: string, zone = getLocalTimeZone()) {
  if (!value) throw new Error("Choose a date and time.");
  return parseDateTime(value).toDate(zone, "reject");
}
export function localInput(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
