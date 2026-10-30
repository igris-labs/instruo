export function parsePublicKey(source: string) {
  if (source.length > 32_000) throw new Error("Paste one OpenSSH public key smaller than 32 KB.");
  const [type, body] = source.trim().split(/\s+/);
  if (!type || !body || !/^[a-z0-9+/]*={0,2}$/i.test(body))
    throw new Error("Paste an OpenSSH public key, not a private key or authorized_keys options.");
  const bytes = Uint8Array.from(atob(body), (character) => character.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  let offset = 0;
  function field() {
    if (offset + 4 > bytes.length) throw new Error("Truncated OpenSSH key.");
    const length = view.getUint32(offset);
    offset += 4;
    if (offset + length > bytes.length || length === 0)
      throw new Error("Invalid OpenSSH key field.");
    const value = bytes.slice(offset, offset + length);
    offset += length;
    return value;
  }
  if (new TextDecoder().decode(field()) !== type)
    throw new Error("Key type does not match its encoded data.");
  if (type === "ssh-ed25519") {
    if (field().length !== 32) throw new Error("An Ed25519 public key must contain 32 bytes.");
  } else if (type === "ssh-rsa") {
    field();
    field();
  } else if (/^ecdsa-sha2-nistp(?:256|384|521)$/.test(type)) {
    const curve = new TextDecoder().decode(field());
    if (type !== `ecdsa-sha2-${curve}`) throw new Error("Curve does not match the key type.");
    const point = field();
    const size = { nistp256: 65, nistp384: 97, nistp521: 133 }[curve];
    if (point[0] !== 4 || point.length !== size) throw new Error("Invalid elliptic-curve point.");
  } else
    throw new Error(
      "Supported public keys: Ed25519, RSA and NIST ECDSA. Certificates and security-key formats are not supported.",
    );
  if (offset !== bytes.length) throw new Error("Unexpected bytes after the key.");
  return { type, bytes };
}
export async function fingerprint(source: string) {
  const { type, bytes } = parsePublicKey(source);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return { type, fingerprint: `SHA256:${btoa(String.fromCharCode(...digest)).replace(/=+$/, "")}` };
}
