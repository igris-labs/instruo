import { computed, ref, watch } from "vue";

export const unitGroups = {
  length: {
    label: "Length",
    units: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.344,
    },
  },
  weight: {
    label: "Weight",
    units: {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      pound: 0.45359237,
      ounce: 0.028349523125,
      tonne: 1000,
    },
  },
  temperature: { label: "Temperature", units: { celsius: 1, fahrenheit: 1, kelvin: 1 } },
  area: {
    label: "Area",
    units: {
      "square meter": 1,
      "square foot": 0.09290304,
      hectare: 10000,
      acre: 4046.8564224,
      "square kilometer": 1000000,
    },
  },
  volume: {
    label: "Volume",
    units: {
      liter: 1,
      milliliter: 0.001,
      "US gallon": 3.785411784,
      "US cup": 0.2365882365,
      "US fluid ounce": 0.0295735295625,
      "cubic meter": 1000,
    },
  },
  speed: {
    label: "Speed",
    units: {
      "meter/second": 1,
      "kilometer/hour": 1 / 3.6,
      "mile/hour": 0.44704,
      knot: 0.514444444444,
    },
  },
  time: {
    label: "Time",
    units: { second: 1, millisecond: 0.001, minute: 60, hour: 3600, day: 86400, week: 604800 },
  },
  data: {
    label: "Digital storage",
    units: {
      byte: 1,
      kilobyte: 1000,
      megabyte: 1000000,
      gigabyte: 1000000000,
      kibibyte: 1024,
      mebibyte: 1048576,
      gibibyte: 1073741824,
    },
  },
};
export type UnitCategory = keyof typeof unitGroups;

export function convertUnit(value: number, from: string, to: string, category: UnitCategory) {
  const units: Record<string, number> = unitGroups[category].units;
  if (!Number.isFinite(value) || !(from in units) || !(to in units)) return null;
  if (category === "temperature") {
    const celsius =
      from === "fahrenheit" ? ((value - 32) * 5) / 9 : from === "kelvin" ? value - 273.15 : value;
    if (celsius < -273.15 - 1e-9) return null;
    return to === "fahrenheit"
      ? (celsius * 9) / 5 + 32
      : to === "kelvin"
        ? celsius + 273.15
        : celsius;
  }
  if (value < 0) return null;
  return (value * units[from]!) / units[to]!;
}
export function useUnitConverter() {
  const category = ref<UnitCategory>("length");
  const amount = ref<number | null>(1);
  const fromSelection = ref("meter");
  const toSelection = ref("foot");
  const units = computed(() => Object.keys(unitGroups[category.value].units));
  watch(
    category,
    () => {
      fromSelection.value = units.value[0]!;
      toSelection.value = units.value[1]!;
    },
    { flush: "sync" },
  );
  const value = computed(() =>
    amount.value === null
      ? null
      : convertUnit(amount.value, fromSelection.value, toSelection.value, category.value),
  );
  const format = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 8 });
  const result = computed(() => (value.value === null ? "—" : format(value.value)));
  const error = computed(() =>
    value.value !== null
      ? ""
      : amount.value === null
        ? "Enter an amount."
        : category.value === "temperature"
          ? "Temperature cannot be below absolute zero."
          : "Enter a valid, non-negative amount.",
  );
  const equivalents = computed(() =>
    units.value.map((unit) => ({
      unit,
      value:
        amount.value === null
          ? null
          : convertUnit(amount.value, fromSelection.value, unit, category.value),
    })),
  );
  function swap() {
    const previous = fromSelection.value;
    fromSelection.value = toSelection.value;
    toSelection.value = previous;
  }
  return {
    category,
    amount,
    fromSelection,
    toSelection,
    units,
    result,
    error,
    equivalents,
    format,
    swap,
  };
}
