import { computed, ref } from "vue";
export type EncoderKind = "base64" | "binary" | "morse" | "url";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const codes =
  ".- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --.. ----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.".split(
    " ",
  );
const morse: Record<string, string> = {
  ...Object.fromEntries(Array.from(alphabet, (letter, index) => [letter, codes[index]!])),
  " ": "/",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};
const letters = Object.fromEntries(Object.entries(morse).map(([letter, code]) => [code, letter]));
export function transformEncoding(
  value: string,
  kind: EncoderKind,
  operation: string,
  variant = "standard",
) {
  if (value.length > 200_000) throw new Error("Use text shorter than 200,000 characters.");
  if (!value) return "";
  if (operation === "encode") {
    if (kind === "base64") {
      let binary = "";
      for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
      const encoded = btoa(binary);
      return variant === "url"
        ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
        : encoded;
    }
    if (kind === "binary")
      return Array.from(new TextEncoder().encode(value), (byte) =>
        byte.toString(2).padStart(8, "0"),
      ).join(" ");
    if (kind === "url") return variant === "uri" ? encodeURI(value) : encodeURIComponent(value);
    return Array.from(value.toUpperCase())
      .map((character) => {
        const code = morse[character];
        if (!code)
          throw new Error(
            `Morse code does not support ${JSON.stringify(character)}. Use Latin letters, digits, spaces or standard punctuation.`,
          );
        return code;
      })
      .join(" ");
  }
  if (kind === "url") return variant === "uri" ? decodeURI(value) : decodeURIComponent(value);
  if (kind === "morse") {
    if (!value.trim()) return "";
    return value
      .trim()
      .split(/\s+/)
      .map((code) => {
        if (!(code in letters))
          throw new Error(
            `Unknown Morse sequence: ${code}. Separate letters with spaces and words with /.`,
          );
        return letters[code];
      })
      .join("");
  }
  let bytes: Uint8Array;
  if (kind === "base64") {
    const normalized = value.replace(/\s/g, "");
    if (!(variant === "url" ? /^[\w-]*={0,2}$/ : /^[A-Z0-9+/]*={0,2}$/i).test(normalized))
      throw new Error("This input is not valid for the selected Base64 alphabet.");
    try {
      bytes = Uint8Array.from(atob(normalized.replace(/-/g, "+").replace(/_/g, "/")), (character) =>
        character.charCodeAt(0),
      );
    } catch {
      throw new Error("Invalid Base64 length or padding.");
    }
  } else {
    if (!value.trim()) return "";
    const groups = value.trim().split(/\s+/);
    if (groups.some((group) => !/^[01]{8}$/.test(group)))
      throw new Error("Use 8-bit binary groups separated by spaces.");
    bytes = Uint8Array.from(groups, (group) => Number.parseInt(group, 2));
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      "Decoded bytes are not valid UTF-8 text. This tool decodes text, not arbitrary binary files.",
    );
  }
}
export function useEncoderDecoder(kind: EncoderKind) {
  const input = ref("");
  const operation = ref("encode");
  const variant = ref("standard");
  const result = computed(() => {
    try {
      return {
        output: transformEncoding(input.value, kind, operation.value, variant.value),
        error: "",
      };
    } catch (cause) {
      return { output: "", error: cause instanceof Error ? cause.message : "Invalid input." };
    }
  });
  function swap() {
    if (!result.value.output) return;
    const output = result.value.output;
    operation.value = operation.value === "encode" ? "decode" : "encode";
    input.value = output;
  }
  return { input, operation, variant, result, swap };
}
