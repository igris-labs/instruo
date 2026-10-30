export type DocumentLanguage =
  "javascript" | "html" | "css" | "graphql" | "sql" | "xml" | "docker" | "nginx" | "svg";
export interface FormatOptions {
  language: DocumentLanguage;
  mode: "format" | "minify";
  indent: number;
  dialect: string;
}

export async function formatDocument(source: string, options: FormatOptions) {
  if (!source.trim()) return "";
  if (new TextEncoder().encode(source).length > 2_000_000)
    throw new Error(
      "This formatter supports documents up to 2 MB. Split larger documents before formatting.",
    );
  if (![2, 4, 8].includes(options.indent)) throw new Error("Choose 2, 4, or 8 spaces.");
  if (options.language === "svg") {
    const { optimize } = await import("svgo/browser");
    return optimize(source, {
      multipass: true,
      plugins: [
        { name: "preset-default", params: { overrides: { cleanupIds: false, removeDesc: false } } },
      ],
    }).data;
  }
  if (options.language === "docker" || options.language === "nginx") {
    const { formatDockerfile, formatNginx } = await import("./configFormats");
    return options.language === "docker"
      ? formatDockerfile(source)
      : formatNginx(source, options.indent);
  }
  if (options.language === "sql") {
    const { format } = await import("sql-formatter");
    const allowed = ["sql", "postgresql", "mysql", "sqlite", "tsql", "bigquery"] as const;
    const dialect = allowed.find((value) => value === options.dialect);
    if (!dialect) throw new Error("Choose a supported SQL dialect.");
    return format(source, { language: dialect, tabWidth: options.indent, keywordCase: "upper" });
  }
  if (options.language === "xml") {
    const { default: format } = await import("xml-formatter");
    return format(source, {
      indentation: " ".repeat(options.indent),
      lineSeparator: "\n",
      collapseContent: true,
      strictMode: true,
      throwOnFailure: true,
    });
  }
  if (options.mode === "minify") {
    if (options.language === "javascript") {
      const { minify } = await import("terser");
      return (
        (await minify(source, { compress: false, mangle: false, format: { comments: "some" } }))
          .code ?? ""
      );
    }
    if (options.language === "css") {
      const { minify } = await import("csso");
      return minify(source, { restructure: false }).css;
    }
    if (options.language === "html") {
      const { minify } = await import("html-minifier-terser/dist/htmlminifier.esm.bundle");
      return minify(source, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: false,
        minifyJS: false,
        minifyCSS: false,
      });
    }
  }
  const { format } = await import("prettier/standalone");
  if (options.language === "javascript") {
    const [babel, estree] = await Promise.all([
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
    ]);
    return format(source, { parser: "babel", plugins: [babel, estree], tabWidth: options.indent });
  }
  if (options.language === "html") {
    const plugin = await import("prettier/plugins/html");
    return format(source, {
      parser: "html",
      plugins: [plugin],
      tabWidth: options.indent,
      htmlWhitespaceSensitivity: "css",
    });
  }
  if (options.language === "css") {
    const plugin = await import("prettier/plugins/postcss");
    return format(source, { parser: "css", plugins: [plugin], tabWidth: options.indent });
  }
  const plugin = await import("prettier/plugins/graphql");
  return format(source, { parser: "graphql", plugins: [plugin], tabWidth: options.indent });
}
