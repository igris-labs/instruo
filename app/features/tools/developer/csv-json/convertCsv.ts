import Papa from "papaparse";

export function convertCsv(source: string, delimiter: string, headers: boolean, typed: boolean) {
  if (!source.trim()) return { output: "", rows: 0, columns: 0 };
  if (new TextEncoder().encode(source).length > 1_000_000)
    throw new Error("Use a CSV file smaller than 1 MB.");
  const parsed = Papa.parse<string[]>(source, { delimiter, skipEmptyLines: true });
  // Auto detection can report this for valid one-column documents.
  const failure = parsed.errors.find((error) => error.code !== "UndetectableDelimiter");
  if (failure) throw new Error(`Row ${(failure.row ?? 0) + 1}: ${failure.message}`);
  const data = parsed.data;
  const fields = data[0] ?? [];
  const columns = fields.length;
  if (headers && fields.some((field) => !field.trim()))
    throw new Error("Every column needs a non-empty header, or turn off the header row option.");
  if (headers && new Set(fields).size !== fields.length)
    throw new Error(
      "Duplicate column names would overwrite data. Rename them or turn off the header row option.",
    );
  const rows = headers ? data.slice(1) : data;
  const value = (text: string): string | number | boolean | null => {
    if (!typed) return text;
    if (text === "true") return true;
    if (text === "false") return false;
    if (text === "null") return null;
    // IDs with leading zeros and integers beyond safe precision stay as strings.
    if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(text)) {
      const number = Number(text);
      if (Number.isFinite(number) && Math.abs(number) <= Number.MAX_SAFE_INTEGER) return number;
    }
    return text;
  };
  const output = rows.map((row, index) => {
    if (row.length !== columns)
      throw new Error(
        `Row ${index + (headers ? 2 : 1)} has ${row.length} columns; expected ${columns}.`,
      );
    return headers
      ? Object.fromEntries(fields.map((field, index) => [field, value(row[index]!)]))
      : row.map(value);
  });
  return { output: JSON.stringify(output, null, 2), rows: rows.length, columns };
}
