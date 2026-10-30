export type ContractTarget = "typescript" | "zod" | "valibot" | "typebox";

function distinct(values: unknown[], render: (value: unknown) => string) {
  return [...new Set(values.map(render))];
}
function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    const types = distinct(value, typeOf);
    return types.length === 0
      ? "unknown[]"
      : types.length === 1
        ? `${types[0]}[]`
        : `(${types.join(" | ")})[]`;
  }
  if (typeof value === "object")
    return `{\n${Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `  ${JSON.stringify(key)}: ${typeOf(item)};`)
      .join("\n")}\n}`;
  return typeof value;
}
function schemaOf(value: unknown, target: Exclude<ContractTarget, "typescript">): string {
  const prefix = target === "zod" ? "z" : target === "valibot" ? "v" : "Type";
  const call = (name: string, body = "") =>
    `${prefix}.${target === "typebox" ? name[0]!.toUpperCase() + name.slice(1) : name}(${body})`;
  if (value === null) return call("null");
  if (Array.isArray(value)) {
    const types = distinct(value, (item) => schemaOf(item, target));
    const item =
      types.length === 0
        ? call("unknown")
        : types.length === 1
          ? types[0]!
          : call("union", `[${types.join(", ")}]`);
    return call("array", item);
  }
  if (typeof value === "object")
    return call(
      "object",
      `{\n${Object.entries(value as Record<string, unknown>)
        .map(
          ([key, item]) =>
            `  ${key === "__proto__" ? `[${JSON.stringify(key)}]` : JSON.stringify(key)}: ${schemaOf(item, target)}`,
        )
        .join(",\n")}\n}`,
    );
  return call(typeof value);
}

export function generateContract(
  value: unknown,
  requestedName: string,
  target: ContractTarget,
): string {
  const stack: [unknown, number][] = [[value, 0]];
  let nodes = 0;
  while (stack.length) {
    const [item, depth] = stack.pop()!;
    if (depth > 50 || ++nodes > 50_000)
      throw new Error("Use a smaller or less deeply nested sample.");
    if (typeof item === "object" && item !== null)
      for (const child of Object.values(item)) stack.push([child, depth + 1]);
  }
  let name = requestedName.replace(/[^\w$]/g, "") || "Root";
  if (!/^[A-Z_$]/i.test(name)) name = `Root${name}`;
  if (
    new Set(
      "any as async await boolean break case catch class const continue debugger declare default delete do else enum export extends false finally for from function if implements import in infer instanceof interface keyof let module namespace never new null number object of package private protected public readonly return static string super switch symbol this throw true try type typeof undefined unique unknown var void while with yield".split(
        " ",
      ),
    ).has(name)
  )
    name = `Root${name}`;
  if (target === "typescript")
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? `export interface ${name} ${typeOf(value)}`
      : `export type ${name} = ${typeOf(value)};`;
  const statement =
    target === "zod"
      ? 'import { z } from "zod";'
      : target === "valibot"
        ? 'import * as v from "valibot";'
        : 'import { Type } from "@sinclair/typebox";';
  return `${statement}\n\nexport const ${name}Schema = ${schemaOf(value, target)};${target === "zod" ? `\nexport type ${name} = z.infer<typeof ${name}Schema>;` : ""}`;
}
