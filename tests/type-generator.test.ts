import ts from "typescript";
import { describe, expect, it } from "vitest";
import { generateContract } from "../app/features/tools/developer/type-generator/logic";

describe("generated contracts", () => {
  for (const target of ["typescript", "zod", "valibot", "typebox"] as const) {
    it.each([
      null,
      42,
      false,
      "hello",
      [],
      [1, "two", null],
      { name: "Ada", items: [{ id: 1 }], active: true },
    ])(`generates syntactically valid ${target} for %j`, (value) => {
      const code = generateContract(value, "123 model", target);
      const result = ts.transpileModule(code, {
        reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      expect(result.diagnostics).toEqual([]);
      expect(code).not.toMatch(/interface \w+ (?:null|string|number|boolean)/);
    });
  }
  it("uses constructors in Valibot and TypeBox rather than bare TypeScript names", () => {
    expect(generateContract({ age: 1 }, "User", "valibot")).toContain('"age": v.number()');
    expect(generateContract({ age: 1 }, "User", "typebox")).toContain('"age": Type.Number()');
    expect(generateContract([1, "two"], "Values", "zod")).toContain(
      "z.array(z.union([z.number(), z.string()]))",
    );
  });
});
