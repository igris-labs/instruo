import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

/** Temporary test seam for rules embedded in SFCs; replace with direct logic imports when ported. */
export function featureFunctions<T>(
  path: string,
  names: string[],
  bindings: Record<string, unknown> = {},
): T {
  const source = readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
  const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert(script, `No script in ${path}`);
  const ast = ts.createSourceFile(path, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declarations = ast.statements.flatMap((node) => {
    if (ts.isFunctionDeclaration(node) && node.name && names.includes(node.name.text)) {
      return [node.getText(ast)];
    }
    if (!ts.isVariableStatement(node)) return [];
    return node.declarationList.declarations.flatMap((declaration) =>
      ts.isIdentifier(declaration.name) && names.includes(declaration.name.text)
        ? [`const ${declaration.getText(ast)};`]
        : [],
    );
  });
  assert.equal(
    declarations.length,
    names.length,
    `Missing declaration in ${path}: ${names.join(", ")}`,
  );
  const selected = declarations.join("\n");
  const { outputText } = ts.transpileModule(selected, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  });
  return runInNewContext(`(() => { ${outputText}; return { ${names.join(", ")} }; })()`, bindings, {
    timeout: 1000,
    contextCodeGeneration: { strings: false, wasm: false },
  }) as T;
}
