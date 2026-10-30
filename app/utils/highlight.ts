import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const languages = {
  json: () => import("shiki/langs/json.mjs"),
  jsonc: () => import("shiki/langs/jsonc.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
  shellscript: () => import("shiki/langs/shellscript.mjs"),
  dockerfile: () => import("shiki/langs/dockerfile.mjs"),
  ini: () => import("shiki/langs/ini.mjs"),
  dotenv: () => import("shiki/langs/dotenv.mjs"),
  nginx: () => import("shiki/langs/nginx.mjs"),
  graphql: () => import("shiki/langs/graphql.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  csv: () => import("shiki/langs/csv.mjs"),
  mermaid: () => import("shiki/langs/mermaid.mjs"),
  http: () => import("shiki/langs/http.mjs"),
  vue: () => import("shiki/langs/vue.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
};
export const codeLanguages = Object.keys(languages);
const aliases: Record<string, string> = {
  svg: "xml",
  js: "javascript",
  ts: "typescript",
  bash: "shellscript",
  shell: "shellscript",
  sh: "shellscript",
  docker: "dockerfile",
  yml: "yaml",
  md: "markdown",
  git: "ini",
};
let instance: Promise<HighlighterCore> | undefined;
const loading = new Map<string, Promise<void>>();

export function escapeCode(source: string) {
  return source
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function highlightLines(source: string, requestedLanguage: string): Promise<string[]> {
  const language = aliases[requestedLanguage] ?? requestedLanguage;
  const load = languages[language as keyof typeof languages];
  if (!load) return source.split("\n").map(escapeCode);
  instance ??= createHighlighterCore({
    themes: [import("shiki/themes/light-plus.mjs"), import("shiki/themes/dark-plus.mjs")],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  }).catch((error) => {
    instance = undefined;
    throw error;
  });
  const highlighter = await instance;
  if (!loading.has(language))
    loading.set(
      language,
      load()
        .then((module) => highlighter.loadLanguage(module.default))
        .catch((error) => {
          loading.delete(language);
          throw error;
        }),
    );
  await loading.get(language);
  const lines = highlighter.codeToTokensWithThemes(source, {
    lang: language,
    themes: { light: "light-plus", dark: "dark-plus" },
  });
  // Only trusted theme colors enter attributes; source text is always escaped, never cached.
  return lines.map((line) =>
    line
      .map((token) => {
        const color = (value?: string) =>
          value && /^#[\da-f]{3,8}$/i.test(value) ? value : "currentColor";
        return `<span class="syntax-token" style="--shiki-light:${color(token.variants.light?.color)};--shiki-dark:${color(token.variants.dark?.color)}">${escapeCode(token.content)}</span>`;
      })
      .join(""),
  );
}

export async function highlightCode(source: string, language: string) {
  return (await highlightLines(source, language)).join("\n");
}
