export function secureToken(alphabet: string, length: number) {
  const source = [...new Set(Array.from(alphabet))];
  if (source.length < 2 || source.length > 256)
    throw new Error("Use 2–256 unique characters in the alphabet.");
  if (!Number.isInteger(length) || length < 1 || length > 512)
    throw new Error("Choose a whole length from 1–512.");
  const limit = Math.floor(256 / source.length) * source.length;
  const result: string[] = [];
  while (result.length < length)
    for (const byte of crypto.getRandomValues(new Uint8Array(1024))) {
      if (byte < limit) result.push(source[byte % source.length]!);
      if (result.length === length) break;
    }
  return result.join("");
}
