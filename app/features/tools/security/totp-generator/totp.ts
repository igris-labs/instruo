export function decodeBase32(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = value.toUpperCase().replace(/[\s-]/g, "");
  if (!/^[A-Z2-7]+={0,6}$/.test(clean)) throw new Error("Secret must be valid Base32.");
  const letters = clean.replace(/=+$/, "");
  if (![0, 2, 4, 5, 7].includes(letters.length % 8)) throw new Error("Invalid Base32 length.");
  let bits = "";
  for (const letter of letters) bits += alphabet.indexOf(letter).toString(2).padStart(5, "0");
  if (/1/.test(bits.slice(Math.floor(bits.length / 8) * 8)))
    throw new Error("Invalid Base32 padding bits.");
  const bytes = Uint8Array.from({ length: Math.floor(bits.length / 8) }, (_, index) =>
    Number.parseInt(bits.slice(index * 8, index * 8 + 8), 2),
  );
  if (!bytes.length || bytes.length > 1024)
    throw new Error("Use a Base32 secret containing 1–1,024 bytes.");
  return bytes;
}
export async function totp(
  secret: string,
  seconds: number,
  digits = 6,
  period = 30,
  hash = "SHA-1",
) {
  if (
    ![6, 8].includes(digits) ||
    !Number.isInteger(period) ||
    period < 5 ||
    period > 300 ||
    !Number.isFinite(seconds) ||
    seconds < 0
  )
    throw new Error("Check TOTP parameters.");
  const key = await crypto.subtle.importKey(
    "raw",
    decodeBase32(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  const bytes = new ArrayBuffer(8);
  new DataView(bytes).setBigUint64(0, BigInt(Math.floor(seconds / period)));
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, bytes));
  const offset = digest.at(-1)! & 15;
  const number = new DataView(digest.buffer).getUint32(offset) & 2147483647;
  return String(number % 10 ** digits).padStart(digits, "0");
}
