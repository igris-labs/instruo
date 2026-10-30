import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import Ajv2020 from "ajv/dist/2020.js";

export const draft = "https://json-schema.org/draft/2020-12/schema";
export function inferSchema(
  value: unknown,
  required = true,
  closed = false,
  depth = 0,
): Record<string, unknown> {
  if (depth > 64) throw new Error("This document is too deeply nested to infer safely.");
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    const variants = [
      ...new Map(
        value.map((item) => {
          const schema = inferSchema(item, required, closed, depth + 1);
          return [JSON.stringify(schema), schema] as const;
        }),
      ).values(),
    ];
    return {
      type: "array",
      items: variants.length > 1 ? { anyOf: variants } : (variants[0] ?? {}),
    };
  }
  if (typeof value === "object") {
    const properties = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        inferSchema(item, required, closed, depth + 1),
      ]),
    );
    return {
      type: "object",
      properties,
      ...(required && Object.keys(properties).length ? { required: Object.keys(properties) } : {}),
      ...(closed ? { additionalProperties: false } : {}),
    };
  }
  return { type: typeof value === "number" && Number.isInteger(value) ? "integer" : typeof value };
}
export function parseDocument(text: string, label: string): unknown {
  if (new TextEncoder().encode(text).length > 1_000_000)
    throw new Error(`${label} must be smaller than 1 MB.`);
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new Error(`${label}: ${cause instanceof Error ? cause.message : "invalid JSON"}`);
  }
}
function describe(error: ErrorObject) {
  const key =
    error.keyword === "required"
      ? error.params.missingProperty
      : error.keyword === "additionalProperties"
        ? error.params.additionalProperty
        : "";
  const path = `${error.instancePath}${key ? `/${String(key).replace(/~/g, "~0").replace(/\//g, "~1")}` : ""}`;
  return `${path || "/"}: ${error.message ?? "does not match the schema"}`;
}
export function validateSchema(source: string, schema: string) {
  const data = parseDocument(source, "JSON document");
  const rule = parseDocument(schema, "JSON Schema");
  if (!(
    typeof rule === "boolean" ||
    (typeof rule === "object" && rule !== null && !Array.isArray(rule))
  ))
    throw new Error("A JSON Schema must be an object or a boolean.");
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    strictSchema: true,
    validateFormats: true,
    ownProperties: true,
  });
  addFormats(ajv);
  const validate = ajv.compile(rule);
  if ("$async" in validate && validate.$async)
    throw new Error("Asynchronous schemas are not supported. Remote references are not fetched.");
  const valid = validate(data) as boolean;
  const errors = validate.errors ?? [];
  return { valid, errors: errors.slice(0, 100).map(describe), total: errors.length };
}
