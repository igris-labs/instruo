import { describe, expect, it } from "vitest";
import { convertCsv } from "../app/features/tools/developer/csv-json/convertCsv";
import {
  draft,
  inferSchema,
  validateSchema,
} from "../app/features/tools/developer/json-schema-studio/schema";
import { convertJsonYaml } from "../app/features/tools/developer/json-yaml-converter/useJsonYaml";

describe("cSV conversion without data loss", () => {
  it("preserves quoted line breaks, escaped quotes, delimiters and intentional spaces", () => {
    const result = convertCsv(
      'name,notes\r\nAda,"First line\nSecond, line"\r\nLinus,"He said ""hello"""\r\n  Name  ,  Value  ',
      ",",
      true,
      false,
    );
    expect(JSON.parse(result.output)).toEqual([
      { name: "Ada", notes: "First line\nSecond, line" },
      { name: "Linus", notes: 'He said "hello"' },
      { name: "  Name  ", notes: "  Value  " },
    ]);
  });
  it("rejects duplicate headers and mismatched rows instead of overwriting fields", () => {
    expect(() => convertCsv("name,name\na,b", ",", true, false)).toThrow("Duplicate");
    expect(() => convertCsv("a,b\n1", ",", true, false)).toThrow("Row 2");
    expect(() => convertCsv('a,b\n"no closing quote', ",", true, false)).toThrow("Row");
  });
  it("supports headerless data and preserves IDs with leading zeros or unsafe integer precision", () => {
    expect(
      JSON.parse(convertCsv("001;9007199254740993;42;false;null", ";", false, true).output),
    ).toEqual([["001", "9007199254740993", 42, false, null]]);
    expect(JSON.parse(convertCsv("a\n1", "", true, false).output)).toEqual([{ a: "1" }]);
  });
});
describe("jSON Schema 2020-12, not a partial hand-written type checker", () => {
  const schema = (rule: unknown) => JSON.stringify({ $schema: draft, ...(rule as object) });
  it("infers every mixed-array variant and makes strictness explicit", () => {
    const rule = inferSchema([1, "one", null]);
    expect(rule.items).toHaveProperty("anyOf");
    expect(validateSchema('[1,"one",null]', schema(rule)).valid).toBe(true);
    expect(inferSchema({ name: "Ada" }, false)).not.toHaveProperty("required");
    expect(inferSchema({ name: "Ada" }, true, true)).toHaveProperty("additionalProperties", false);
  });
  it("checks numeric constraints, formats, required and additional properties with JSON Pointer paths", () => {
    const result = validateSchema(
      '{"age":10,"email":"wrong","extra":true}',
      schema({
        type: "object",
        required: ["name"],
        properties: {
          age: { type: "integer", minimum: 18 },
          email: { type: "string", format: "email" },
        },
        additionalProperties: false,
      }),
    );
    expect(result.valid).toBe(false);
    for (const path of ["/age:", "/email:", "/name:", "/extra:"])
      expect(result.errors.some((error) => error.startsWith(path))).toBe(true);
  });
  it("resolves local references but never fetches remote schemas", () => {
    const rule = schema({
      $defs: { score: { type: "number", maximum: 10 } },
      $ref: "#/$defs/score",
    });
    expect(validateSchema("12", rule).valid).toBe(false);
    expect(() => validateSchema("12", schema({ $ref: "https://example.com/schema" }))).toThrow();
    expect(() => validateSchema("1", schema({ unknownRule: true }))).toThrow();
    expect(validateSchema("null", "true").valid).toBe(true);
    expect(validateSchema("null", "false").valid).toBe(false);
  });
});
describe("jSON/YAML safe conversion", () => {
  it("round-trips values and supports false and null roots", () => {
    const source = '{"name":"Ada","active":true,"tags":["math"]}';
    expect(
      JSON.parse(convertJsonYaml(convertJsonYaml(source, "json-yaml", 2), "yaml-json", 2)),
    ).toEqual(JSON.parse(source));
    expect(convertJsonYaml("false", "yaml-json", 2)).toBe("false");
    expect(convertJsonYaml("null", "yaml-json", 2)).toBe("null");
  });
  it("reports duplicate keys, cycles, unknown tags and non-JSON values", () => {
    for (const source of [
      "name: Ada\nname: Linus",
      "a: &a [*a]",
      "!unknown hello",
      "value: .inf",
      "value: 9007199254740993",
      "? [one, two]\n: value",
    ]) {
      expect(() => convertJsonYaml(source, "yaml-json", 2), source).toThrow();
    }
  });
});
