export const categoryPresentation: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  Developer: {
    label: "Code & data",
    icon: "tabler:code",
    description: "Format JSON, inspect APIs and prepare code.",
  },
  Image: {
    label: "Images & design",
    icon: "tabler:photo",
    description: "Convert files, resize images and work with colour.",
  },
  Text: {
    label: "Text",
    icon: "tabler:typography",
    description: "Clean up text, change case and organise lines.",
  },
  "Encoder Decoder": {
    label: "Encoding & decoding",
    icon: "tabler:arrows-exchange",
    description: "Move between Base64, URLs, binary and Morse code.",
  },
  Security: {
    label: "Security",
    icon: "tabler:shield-lock",
    description: "Create passwords, inspect tokens and calculate hashes.",
  },
  Everyday: {
    label: "Everyday calculations",
    icon: "tabler:calculator",
    description: "Work out dates, measurements and everyday numbers.",
  },
  Productivity: {
    label: "Productivity",
    icon: "tabler:checklist",
    description: "Make a choice and move on with your day.",
  },
};

export const quickStartSlugs = [
  "json-formatter",
  "image-format-converter",
  "password-generator",
  "unit-converter",
];
export const directoryPageSize = 12;

export function directoryPage(value: unknown, total: number): number {
  const requested = typeof value === "string" || typeof value === "number" ? Number(value) : 1;
  const valid = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  return Math.min(valid, Math.max(1, Math.ceil(total / directoryPageSize)));
}
