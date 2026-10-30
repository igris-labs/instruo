function encode(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}
function decode(text: string) {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}
async function key(password: string, salt: Uint8Array) {
  if (!password) throw new Error("Enter an encryption password.");
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 100_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function encryptAes(text: string, password: string) {
  if (text.length > 1_000_000) throw new Error("Use text smaller than 1 million characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await key(password, salt),
    new TextEncoder().encode(text),
  );
  return JSON.stringify({ salt: encode(salt), iv: encode(iv), data: encode(new Uint8Array(data)) });
}
export async function decryptAes(text: string, password: string) {
  if (text.length > 6_000_000) throw new Error("Use a payload smaller than 6 MB.");
  try {
    const payload = JSON.parse(text);
    if (![payload.salt, payload.iv, payload.data].every((value) => typeof value === "string"))
      throw new Error("Invalid payload");
    const salt = decode(payload.salt);
    const iv = decode(payload.iv);
    const bytes = decode(payload.data);
    if (salt.length !== 16 || iv.length !== 12 || bytes.length < 16)
      throw new Error("Invalid payload");
    const data = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      await key(password, salt),
      bytes as BufferSource,
    );
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    throw new Error("Unable to decrypt. Check password and payload.");
  }
}
