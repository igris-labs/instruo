import type { SelectOption } from "akaza-ui";

export function selectOptions(items: readonly (string | number | SelectOption)[]): SelectOption[] {
  return items.map((item) =>
    typeof item === "object" ? item : { label: String(item), value: String(item) },
  );
}
