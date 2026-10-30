/** Normalize assignment spacing without modifying quoted multiline values. */
export function formatEnv(source: string, redact = false) {
  if (source.length > 200_000)
    throw new Error("Use an environment file smaller than 200,000 characters.");
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const separator = line.indexOf("=");
    const left = separator < 0 ? "" : line.slice(0, separator).trim();
    const exported = left.startsWith("export ");
    const name = exported ? left.slice(7).trim() : left;
    const match = /^[\w.]+$/.test(name)
      ? [line, exported ? "export " : "", name, line.slice(separator + 1)]
      : null;
    if (!match) {
      result.push(line);
      continue;
    }
    const [, prefix, key, initial] = match;
    let value = initial!.trimStart();
    const quote = value[0];
    if (quote === '"' || quote === "'") {
      const closed = (text: string) => {
        for (let j = 1; j < text.length; j++) {
          if (text[j] !== quote) continue;
          let slashes = 0;
          for (let k = j - 1; k >= 0 && text[k] === "\\"; k--) slashes++;
          if (slashes % 2 === 0) return true;
        }
        return false;
      };
      while (!closed(value) && i + 1 < lines.length) value += `\n${lines[++i]}`;
      if (!closed(value)) throw new Error(`Unclosed quoted value for ${key}.`);
    }
    const secret = /KEY|SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL/i.test(key!);
    result.push(`${prefix}${key}=${redact && secret ? '"[REDACTED]"' : value}`);
  }
  return result.join("\n");
}
