export function formatDockerfile(source: string) {
  const lines = source.split(/\r?\n/);
  let continued = false;
  let heredoc = "";
  let escape = "\\";
  return lines
    .map((line) => {
      if (heredoc) {
        if (line.trim() === heredoc) heredoc = "";
        return line;
      }
      const directive = line.match(/^#\s*escape\s*=\s*([\\`])/i);
      if (directive) escape = directive[1]!;
      const result =
        continued || /^\s*#/.test(line)
          ? line
          : line.replace(
              /^(\s*)(FROM|RUN|CMD|COPY|ADD|WORKDIR|ENV|EXPOSE|ENTRYPOINT|VOLUME|USER|ARG|LABEL|SHELL|STOPSIGNAL|HEALTHCHECK|ONBUILD)\b/i,
              (_, indent: string, instruction: string) => indent + instruction.toUpperCase(),
            );
      continued = line.trimEnd().endsWith(escape);
      const opening = line.match(/<<-?["']?([A-Z_]\w*)["']?/i);
      if (opening) heredoc = opening[1]!;
      return result;
    })
    .join("\n");
}
export function formatNginx(source: string, indent = 2) {
  let quote = "";
  let escaped = false;
  let comment = false;
  let depth = 0;
  let literalBraceDepth = 0;
  let text = "";
  const lines: string[] = [];
  function flush() {
    if (text.trim()) lines.push(" ".repeat(depth * indent) + text.trim());
    text = "";
  }
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (comment) {
      text += char;
      if (char === "\n") {
        flush();
        comment = false;
      }
      continue;
    }
    if (escaped) {
      text += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      text += char;
      escaped = true;
      continue;
    }
    if (quote) {
      text += char;
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      text += char;
      continue;
    }
    if (char === "#") {
      comment = true;
      text += char;
      continue;
    }
    if (char === "{" && source[index - 1] === "$") {
      const end = source.indexOf("}", index);
      if (end < 0) throw new Error("Unclosed variable reference.");
      text += source.slice(index, end + 1);
      index = end;
      continue;
    }
    if (char === "{" && (index === 0 || /\s/.test(source[index - 1]!))) {
      text += "{";
      flush();
      depth++;
    } else if (char === "{") {
      literalBraceDepth++;
      text += char;
    } else if (char === "}" && literalBraceDepth) {
      literalBraceDepth--;
      text += char;
    } else if (char === "}") {
      flush();
      if (!depth) throw new Error("Unexpected closing brace.");
      depth--;
      text = "}";
      flush();
    } else if (char === ";") {
      text += char;
      flush();
    } else if (/\s/.test(char)) {
      if (text && !text.endsWith(" ")) text += " ";
    } else text += char;
  }
  if (quote || escaped || depth || literalBraceDepth)
    throw new Error("Check unclosed quotes, escapes or configuration blocks.");
  flush();
  return lines.join("\n");
}
