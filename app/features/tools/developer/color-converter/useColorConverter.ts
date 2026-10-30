import {
  clampRgb,
  converter,
  displayable,
  formatCss,
  formatHex,
  formatHex8,
  formatHsl,
  formatRgb,
  parse,
} from "culori";
import { computed, ref } from "vue";

export function inspectColor(value: string) {
  const color = parse(value.trim());
  if (!color) return null;
  const clipped = clampRgb(color);
  const formats = [
    { label: "HEX", value: (color.alpha ?? 1) < 1 ? formatHex8(clipped) : formatHex(clipped) },
    { label: "RGB", value: formatRgb(clipped) },
    { label: "HSL", value: formatHsl(clipped) },
    ...(["oklch", "lch", "oklab", "lab", "p3"] as const).map((mode) => ({
      label: mode === "p3" ? "Display P3" : mode.toUpperCase(),
      value: formatCss(converter(mode)(color)).replace(/-?\d*\.\d+(?:e[-+]?\d+)?/gi, (value) =>
        String(Number(Number(value).toFixed(5))),
      ),
    })),
  ];
  return {
    css: formatCss(color),
    hex: formatHex(clipped),
    formats,
    inSrgb: displayable(color),
    alpha: color.alpha ?? 1,
  };
}
export function useColorConverter() {
  const input = ref("#f97316");
  const result = computed(() => inspectColor(input.value));
  const error = computed(() =>
    result.value ? "" : "Enter a valid CSS color: HEX, RGB, HSL, OKLCH, LCH, or a color name.",
  );
  return { input, result, error };
}
