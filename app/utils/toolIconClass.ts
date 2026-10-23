// Category identity uses IPEX label colors; darker light-mode shades keep icons legible.
const categoryClasses: Record<string, string> = {
  Developer: "text-[color-mix(in_oklch,var(--label-blue)_78%,black)] dark:text-(--label-blue)",
  "Encoder Decoder":
    "text-[color-mix(in_oklch,var(--label-purple)_78%,black)] dark:text-(--label-purple)",
  Everyday: "text-[color-mix(in_oklch,var(--label-amber)_78%,black)] dark:text-(--label-amber)",
  Image: "text-[color-mix(in_oklch,var(--label-peach)_78%,black)] dark:text-(--label-peach)",
  Productivity: "text-[color-mix(in_oklch,var(--label-cyan)_78%,black)] dark:text-(--label-cyan)",
  Security: "text-[color-mix(in_oklch,var(--label-green)_78%,black)] dark:text-(--label-green)",
  Text: "text-[color-mix(in_oklch,var(--label-red)_78%,black)] dark:text-(--label-red)",
};

export function toolIconClass(category?: string): string {
  return categoryClasses[category ?? ""] ?? "text-foreground-muted";
}
